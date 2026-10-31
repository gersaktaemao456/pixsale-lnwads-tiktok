/* PIXSALE — data store (local-first + GitHub sync) */
(function () {
  "use strict";

  var P = window.PIX;
  var GH = window.PIXGH;

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function uid(prefix) {
    return (prefix || "b") + "_" + Math.random().toString(36).slice(2, 9);
  }

  function slugify(input) {
    var s = String(input || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!s) s = "page-" + Math.random().toString(36).slice(2, 6);
    return s.slice(0, 60);
  }

  function fmtNum(n) {
    n = Number(n || 0);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function fmtPrice(n) {
    var num = Number(n || 0);
    return "฿" + num.toLocaleString("th-TH", { maximumFractionDigits: 0 });
  }

  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    if (!then) return "—";
    var diff = Date.now() - then;
    var min = Math.floor(diff / 60000);
    if (min < 1) return "เมื่อสักครู่";
    if (min < 60) return min + " นาทีที่แล้ว";
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + " ชั่วโมงที่แล้ว";
    var day = Math.floor(hr / 24);
    if (day < 30) return day + " วันที่แล้ว";
    return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  }

  var Store = {
    clone: clone,
    uid: uid,
    slugify: slugify,
    fmtNum: fmtNum,
    fmtPrice: fmtPrice,
    timeAgo: timeAgo,

    github: function () {
      var cfg = readJSON(P.keys.github, null);
      return cfg && cfg.token ? cfg : null;
    },

    githubPublic: function () {
      var cfg = this.github();
      if (!cfg) return null;
      return { owner: cfg.owner, repo: cfg.repo, branch: cfg.branch, path: cfg.path || "data" };
    },

    connect: function (cfg) {
      var clean = GH.normalize(cfg);
      writeJSON(P.keys.github, clean);
      return clean;
    },

    disconnect: function () {
      localStorage.removeItem(P.keys.github);
    },

    profile: function () {
      return readJSON(P.keys.profile, {
        studio: P.brand.studio,
        owner: "",
        email: "",
        line: "",
        avatar: ""
      });
    },

    saveProfile: function (profile) {
      return writeJSON(P.keys.profile, profile);
    },

    seedPages: function () {
      return clone(window.PIXSeed.pages);
    },

    initLocal: function () {
      var stored = readJSON(P.keys.pages, null);
      if (!Array.isArray(stored) || !stored.length) {
        stored = this.seedPages();
        writeJSON(P.keys.pages, stored);
      }
      return stored;
    },

    list: function () {
      return this.initLocal();
    },

    get: function (slug) {
      var pages = this.list();
      for (var i = 0; i < pages.length; i++) {
        if (pages[i].slug === slug || pages[i].id === slug) return clone(pages[i]);
      }
      return null;
    },

    getStored: function (slug) {
      var pages = readJSON(P.keys.pages, []);
      if (!Array.isArray(pages)) return null;
      for (var i = 0; i < pages.length; i++) {
        if (pages[i].slug === slug || pages[i].id === slug) return clone(pages[i]);
      }
      return null;
    },

    save: function (page, options) {
      options = options || {};
      var pages = this.list();
      page.updatedAt = new Date().toISOString();
      var idx = -1;
      for (var i = 0; i < pages.length; i++) {
        if (pages[i].slug === page.slug) { idx = i; break; }
      }
      if (idx >= 0) pages[idx] = clone(page);
      else pages.unshift(clone(page));
      writeJSON(P.keys.pages, pages);
      localStorage.setItem(P.keys.lastPage, page.slug);

      if (options.remote === false) return Promise.resolve({ local: true });
      var cfg = this.github();
      if (!cfg) return Promise.resolve({ local: true, remote: false });
      return this.pushPage(page, cfg).then(function (res) {
        return { local: true, remote: true, remoteResult: res };
      });
    },

    remove: function (slug) {
      var pages = this.list().filter(function (p) { return p.slug !== slug; });
      writeJSON(P.keys.pages, pages);
      var cfg = this.github();
      if (!cfg) return Promise.resolve(true);
      var self = this;
      var filePath = self.pagePath(cfg, slug);
      return GH.getFile(cfg, filePath).then(function (file) {
        return GH.deleteFile(cfg, filePath, "content(pixsale): delete page " + slug, file.sha);
      }).catch(function (err) {
        if (GH.isMissing(err)) return true;
        throw err;
      });
    },

    rename: function (oldSlug, page) {
      var self = this;
      var pages = this.list().filter(function (p) { return p.slug !== oldSlug; });
      var idx = pages.findIndex(function (p) { return p.slug === page.slug; });
      if (idx >= 0) pages[idx] = clone(page);
      else pages.unshift(clone(page));
      writeJSON(P.keys.pages, pages);

      var cfg = this.github();
      if (!cfg) return Promise.resolve({ local: true, remote: false });

      return this.pushPage(page, cfg).then(function () {
        var base = (cfg.path || "data").replace(/\/+$/, "");
        var oldPath = base + "/pages/" + oldSlug + ".json";
        return GH.getFile(cfg, oldPath).then(function (file) {
          return GH.deleteFile(cfg, oldPath, "content(pixsale): rename " + oldSlug + " -> " + page.slug, file.sha);
        }).catch(function (err) {
          if (GH.isMissing(err)) return true;
          throw err;
        });
      }).then(function () {
        return { local: true, remote: true };
      });
    },

    pagePath: function (cfg, slug) {
      var base = (cfg.path || "data").replace(/\/+$/, "");
      return base + "/pages/" + slug + ".json";
    },

    pushPage: function (page, cfg) {
      cfg = cfg || this.github();
      if (!cfg) return Promise.reject(new Error("ยังไม่ได้เชื่อม GitHub"));
      var self = this;
      var path = self.pagePath(cfg, page.slug);
      var body = JSON.stringify(page, null, 2) + "\n";
      return GH.getFile(cfg, path).then(function (file) {
        return file.sha;
      }).catch(function (err) {
        if (GH.isMissing(err)) return null;
        throw err;
      }).then(function (sha) {
        return GH.putFile(cfg, path, body, "content(pixsale): update " + page.slug, sha, false);
      });
    },

    pushSite: function (cfg) {
      cfg = cfg || this.github();
      if (!cfg) return Promise.resolve(null);
      var base = (cfg.path || "data").replace(/\/+$/, "");
      var path = base + "/site.json";
      var payload = {
        brand: P.brand.name,
        studio: this.profile().studio,
        repo: { owner: cfg.owner, name: cfg.repo, branch: cfg.branch },
        updatedAt: new Date().toISOString()
      };
      var body = JSON.stringify(payload, null, 2) + "\n";
      return GH.getFile(cfg, path).then(function (f) { return f.sha; })
        .catch(function (e) { if (GH.isMissing(e)) return null; throw e; })
        .then(function (sha) {
          return GH.putFile(cfg, path, body, "chore(pixsale): publish site coordinates", sha, false);
        });
    },

    pushAll: function (onProgress) {
      var self = this;
      var cfg = this.github();
      if (!cfg) return Promise.reject(new Error("ยังไม่ได้เชื่อม GitHub"));
      var pages = this.list();
      var done = 0;
      var failed = [];
      return pages.reduce(function (chain, page) {
        return chain.then(function () {
          return self.pushPage(page, cfg).then(function () {
            done++;
            if (onProgress) onProgress(done, pages.length, page.slug);
          }).catch(function (err) {
            failed.push({ slug: page.slug, message: GH.friendly(err) });
            done++;
            if (onProgress) onProgress(done, pages.length, page.slug);
          });
        });
      }, Promise.resolve()).then(function () {
        return self.pushSite(cfg).catch(function () { return null; }).then(function () {
          return { total: pages.length, pushed: done - failed.length, failed: failed };
        });
      });
    },

    pullAll: function () {
      var self = this;
      var cfg = this.github();
      if (!cfg) return Promise.reject(new Error("ยังไม่ได้เชื่อม GitHub"));
      var base = (cfg.path || "data").replace(/\/+$/, "");
      return GH.listDir(cfg, base + "/pages").then(function (files) {
        var jsonFiles = files.filter(function (f) { return f.type === "file" && /\.json$/i.test(f.name); });
        return jsonFiles.reduce(function (chain, file) {
          return chain.then(function (acc) {
            return GH.getFile(cfg, file.path).then(function (f) {
              var page = JSON.parse(f.text);
              if (page && page.slug) acc.push(page);
              return acc;
            }).catch(function () { return acc; });
          });
        }, Promise.resolve([]));
      }).then(function (remotePages) {
        if (!remotePages.length) throw new Error("ไม่พบไฟล์ใน " + base + "/pages");
        writeJSON(P.keys.pages, remotePages);
        return remotePages;
      });
    },

    uploadImage: function (file, pageSlug) {
      var self = this;
      return new Promise(function (resolve, reject) {
        if (!file) return reject(new Error("ไม่พบไฟล์รูป"));
        if (file.size > P.limits.imageMaxBytes) {
          return reject(new Error("รูปใหญ่เกิน " + Math.round(P.limits.imageMaxBytes / 1024) + " KB — ย่อขนาดก่อนอัปโหลด"));
        }
        var reader = new FileReader();
        reader.onload = function () {
          var dataUrl = String(reader.result || "");
          var cfg = self.github();
          if (!cfg) return resolve({ url: dataUrl, remote: false, bytes: file.size });
          var parts = dataUrl.split(",");
          var base64 = parts[1];
          var ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
          var name = (pageSlug || "image") + "-" + Date.now() + "." + ext;
          var path = "assets/uploads/" + name;
          GH.putFile(cfg, path, base64, "assets(pixsale): upload " + name, null, true)
            .then(function () {
              resolve({ url: "/" + path, remote: true, bytes: file.size, raw: GH.rawUrl(cfg, path) });
            })
            .catch(reject);
        };
        reader.onerror = function () { reject(new Error("อ่านไฟล์ไม่สำเร็จ")); };
        reader.readAsDataURL(file);
      });
    },

    loadPublic: function (slug) {
      var seed = (window.PIXSeed.pages || []).filter(function (p) { return p.slug === slug; })[0] || null;
      var baseHref = document.body.getAttribute("data-base") || "";
      var localUrl = baseHref + "data/pages/" + slug + ".json";
      var self = this;

      // A page edited in this browser is the freshest copy for its owner.
      // Visitors have no local copy and fall through to GitHub / static JSON.
      var stored = this.getStored(slug);
      if (stored && stored.slug) return Promise.resolve(stored);

      function trySiteConfig() {
        return fetch(baseHref + "data/site.json", { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      }

      function tryRaw(site) {
        if (!site || !site.repo || !site.repo.owner || !site.repo.name) return Promise.resolve(null);
        var url = "https://raw.githubusercontent.com/" + site.repo.owner + "/" + site.repo.name + "/" + (site.repo.branch || "main") + "/data/pages/" + slug + ".json";
        return fetch(url + "?t=" + Date.now(), { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      }

      return trySiteConfig()
        .then(function (site) {
          return tryRaw(site).then(function (remote) {
            if (remote) return remote;
            return fetch(localUrl + "?t=" + Date.now(), { cache: "no-store" })
              .then(function (r) { return r.ok ? r.json() : null; })
              .catch(function () { return null; });
          });
        })
        .then(function (page) {
          if (page && page.slug) return page;
          var local = self.getStored(slug);
          if (local && local.slug) return local;
          if (seed) return clone(seed);
          return null;
        });
    },

    findPublicBySlug: function (slug) {
      return this.loadPublic(slug);
    }
  };

  window.PIXStore = Store;
})();
