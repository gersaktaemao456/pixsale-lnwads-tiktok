/* PIXSALE — GitHub Contents API adapter
   All calls happen in the browser with the user's fine-grained token.
   The token is stored in localStorage and never committed to the repo. */
(function () {
  "use strict";

  var API = "https://api.github.com";

  function encodeBase64(text) {
    var bytes = new TextEncoder().encode(text);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function decodeBase64(b64) {
    var clean = String(b64 || "").replace(/\s/g, "");
    var bin = atob(clean);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }

  function encodeBinary(bytes) {
    var bin = "";
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  function GitHubError(status, message, detail) {
    var err = new Error(message || "GitHub request failed");
    err.status = status;
    err.detail = detail;
    return err;
  }

  function friendly(err) {
    if (!err) return "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    if (err.status === 401) return "Token ไม่ถูกต้องหรือหมดอายุ — ตรวจสอบ Personal Access Token อีกครั้ง";
    if (err.status === 403) return "Token ไม่มีสิทธิ์เขียน repo นี้ — ต้องให้สิทธิ์ Contents: Read and write";
    if (err.status === 404) return "ไม่พบ repo หรือ path นี้ — ตรวจชื่อ owner / repo / branch";
    if (err.status === 409 && /empty/i.test(String(err.message || ""))) return "repo ยังว่าง — กด “อัปโหลดทุกหน้าขึ้น GitHub” เพื่อสร้างไฟล์แรก";
    if (err.status === 409 || err.status === 422) return "ไฟล์ถูกแก้ไขจากที่อื่น — กดซิงก์อีกครั้งเพื่อรวมข้อมูลล่าสุด";
    if (err.status === 429) return "เรียก GitHub ถี่เกินไป — รอสักครู่แล้วลองใหม่";
    if (err.status >= 500) return "GitHub ขัดข้องชั่วคราว — ลองอีกครั้งในอีก 1 นาที";
    return err.message || "เชื่อมต่อ GitHub ไม่สำเร็จ";
  }

  function isMissing(err) {
    if (!err) return false;
    if (err.status === 404) return true;
    // GitHub returns 409 "Git Repository is empty." before the first commit.
    return err.status === 409 && /empty/i.test(String(err.message || ""));
  }

  function request(cfg, path, options) {
    options = options || {};
    if (!cfg || !cfg.token) return Promise.reject(GitHubError(401, "ยังไม่มี token"));
    var url = API + path;
    var headers = {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + cfg.token,
      "X-GitHub-Api-Version": "2022-11-28"
    };
    var init = { method: options.method || "GET", headers: headers };
    if (options.body) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
    return fetch(url, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) {
          var msg = (data && data.message) || res.statusText;
          throw GitHubError(res.status, msg, data);
        }
        return data;
      });
    });
  }

  function repoPath(cfg, path) {
    return "/repos/" + encodeURIComponent(cfg.owner) + "/" + encodeURIComponent(cfg.repo) + "/contents/" + path.split("/").map(encodeURIComponent).join("/");
  }

  var GH = {
    encodeBase64: encodeBase64,
    decodeBase64: decodeBase64,
    encodeBinary: encodeBinary,
    friendly: friendly,
    isMissing: isMissing,

    normalize: function (cfg) {
      cfg = cfg || {};
      return {
        owner: String(cfg.owner || "").trim(),
        repo: String(cfg.repo || "").trim(),
        branch: String(cfg.branch || "main").trim() || "main",
        token: String(cfg.token || "").trim(),
        path: String(cfg.path || "data").replace(/^\/+|\/+$/g, "") || "data"
      };
    },

    test: function (cfg) {
      cfg = GH.normalize(cfg);
      if (!cfg.owner || !cfg.repo || !cfg.token) {
        return Promise.reject(GitHubError(400, "กรอก owner, repo และ token ให้ครบ"));
      }
      return request(cfg, "/repos/" + encodeURIComponent(cfg.owner) + "/" + encodeURIComponent(cfg.repo)).then(function (repo) {
        return {
          fullName: repo.full_name,
          branch: repo.default_branch,
          private: repo.private,
          permissions: repo.permissions || null,
          htmlUrl: repo.html_url
        };
      });
    },

    getFile: function (cfg, path) {
      cfg = GH.normalize(cfg);
      return request(cfg, repoPath(cfg, path) + "?ref=" + encodeURIComponent(cfg.branch)).then(function (data) {
        return {
          path: data.path,
          sha: data.sha,
          size: data.size,
          downloadUrl: data.download_url,
          text: data.content ? decodeBase64(data.content) : null
        };
      });
    },

    listDir: function (cfg, path) {
      cfg = GH.normalize(cfg);
      return request(cfg, repoPath(cfg, path) + "?ref=" + encodeURIComponent(cfg.branch)).then(function (data) {
        if (!Array.isArray(data)) return [];
        return data.map(function (f) {
          return { name: f.name, path: f.path, sha: f.sha, size: f.size, type: f.type, downloadUrl: f.download_url };
        });
      });
    },

    putFile: function (cfg, path, content, message, sha, isBase64) {
      cfg = GH.normalize(cfg);
      var body = {
        message: message || "chore(pixsale): update " + path,
        content: isBase64 ? content : encodeBase64(content),
        branch: cfg.branch
      };
      if (sha) body.sha = sha;
      return request(cfg, repoPath(cfg, path), { method: "PUT", body: body }).then(function (res) {
        return {
          path: res.content && res.content.path,
          sha: res.content && res.content.sha,
          commit: res.commit && res.commit.sha,
          htmlUrl: res.commit && res.commit.html_url
        };
      });
    },

    deleteFile: function (cfg, path, message, sha) {
      cfg = GH.normalize(cfg);
      return request(cfg, repoPath(cfg, path), {
        method: "DELETE",
        body: { message: message || "chore(pixsale): delete " + path, sha: sha, branch: cfg.branch }
      });
    },

    rawUrl: function (cfg, path) {
      cfg = GH.normalize(cfg);
      if (!cfg.owner || !cfg.repo) return "";
      return "https://raw.githubusercontent.com/" + cfg.owner + "/" + cfg.repo + "/" + cfg.branch + "/" + path.split("/").map(encodeURIComponent).join("/");
    }
  };

  window.PIXGH = GH;
})();
