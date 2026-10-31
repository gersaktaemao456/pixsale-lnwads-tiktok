/* PIXSALE — runtime configuration */
window.PIX = {
  version: "1.0.0",
  brand: {
    name: "PIXSALE",
    studio: "PIXSALE Studio",
    tagline: "เซลเพจมือถือ-first สำหรับคนขายบน TikTok"
  },
  paths: {
    data: "data",
    pages: "data/pages",
    site: "data/site.json",
    uploads: "assets/uploads"
  },
  keys: {
    pages: "pixsale.pages.v1",
    github: "pixsale.github.v1",
    profile: "pixsale.profile.v1",
    lastPage: "pixsale.lastPage.v1"
  },
  // Public repository coordinates. Kept in data/site.json so visitors can read
  // freshly published pages straight from GitHub without a redeploy.
  repo: {
    owner: "",
    name: "",
    branch: "main"
  },
  limits: {
    pagesFree: 10,
    imageWarnBytes: 320 * 1024,
    imageMaxBytes: 1.6 * 1024 * 1024
  }
};
