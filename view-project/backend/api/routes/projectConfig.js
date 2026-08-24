const router = require("express").Router();
const projectConfigs = require("../projectConfig/loader");

router.get("/projects", (_req, res) => {
  res.json({ projects: projectConfigs });
});

module.exports = router;
