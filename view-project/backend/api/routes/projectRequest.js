const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  const { baseUrl, method, path: apiPath, requestBody } = req.body;
  if (!baseUrl || !method || !apiPath) {
    return res.status(400).json({
      error: "project-request requires baseUrl, method, and path",
    });
  }

  const targetUrl = `${baseUrl.replace(/\/$/, "")}${apiPath}`;
  const fetchOptions = {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (!["GET", "DELETE"].includes(fetchOptions.method)) {
    fetchOptions.body = JSON.stringify(requestBody ?? {});
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    return res.status(response.status).json({
      ok: response.ok,
      url: targetUrl,
      status: response.status,
      statusText: response.statusText,
      body,
    });
  } catch (error) {
    return res.status(502).json({
      error: "Failed to proxy request to local project backend.",
      detail: error.message,
    });
  }
});

module.exports = router;
