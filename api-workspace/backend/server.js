import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/project-request", async (req, res) => {
  const { baseUrl, path, method, requestBody } = req.body ?? {};
  if (!baseUrl || !path || !method) {
    return res.status(400).json({ ok: false, error: "Missing request parameters." });
  }

  try {
    const targetUrl = `${baseUrl.replace(/\/$/, "")}${path}`;
    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: ["GET", "DELETE"].includes(method.toUpperCase()) ? null : JSON.stringify(requestBody ?? {}),
    });

    const responseText = await response.text();
    let body = null;

    try {
      body = responseText ? JSON.parse(responseText) : null;
    } catch {
      body = responseText;
    }

    res.status(response.status).json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: targetUrl,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      durationMs: 0,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      status: 500,
      statusText: "Proxy Error",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API workspace proxy running on http://localhost:${PORT}`);
});
