const router = require("express").Router();
const { handleDemoRequest, listSandboxProjects } = require("../controllers/demoController");

router.post("/:project", handleDemoRequest);
router.get("/projects", listSandboxProjects);

module.exports = router;
