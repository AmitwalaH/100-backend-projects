const { Schema } = require("mongoose");

function getModels(db) {
  if (db.models.ShortUrl) return { ShortUrl: db.model("ShortUrl") };

  const ShortUrlSchema = new Schema({
    alias: { type: String, required: true, unique: true },
    originalUrl: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    lastClickedAt: Date,
  });

  return { ShortUrl: db.model("ShortUrl", ShortUrlSchema) };
}

function randomAlias() {
  return Math.random().toString(36).slice(2, 8);
}

module.exports = {
  "POST /api/shorten": async (body, db) => {
    const { url, alias } = body;
    if (!url || !url.startsWith("http")) {
      return {
        status: 400,
        body: {
          success: false,
          error: "A valid URL starting with http(s) is required",
        },
      };
    }

    const { ShortUrl } = getModels(db);
    const finalAlias = alias || randomAlias();
    const existing = await ShortUrl.findOne({ alias: finalAlias });
    if (existing) {
      return {
        status: 409,
        body: {
          success: false,
          error: `Alias "${finalAlias}" is already taken`,
        },
      };
    }

    const short = await ShortUrl.create({
      alias: finalAlias,
      originalUrl: url,
    });

    return {
      status: 201,
      body: {
        success: true,
        shortUrl: `https://demo.backend-projects.dev/${short.alias}`,
        originalUrl: short.originalUrl,
        alias: short.alias,
        clicks: 0,
        createdAt: short.createdAt,
      },
    };
  },

  "GET /api/urls": async (_body, db) => {
    const { ShortUrl } = getModels(db);
    const urls = await ShortUrl.find().sort({ createdAt: -1 }).limit(10).lean();
    return { status: 200, body: { success: true, count: urls.length, urls } };
  },

  "DELETE /api/urls/:alias": async (body, db, params) => {
    const { alias } = params;
    if (!alias) {
      return {
        status: 400,
        body: { success: false, error: "alias is required" },
      };
    }

    const { ShortUrl } = getModels(db);
    const deleted = await ShortUrl.findOneAndDelete({ alias });
    if (!deleted) {
      return {
        status: 404,
        body: {
          success: false,
          error: `Short URL with alias "${alias}" not found`,
        },
      };
    }

    return { status: 200, body: { success: true, message: `Deleted "${alias}"` } };
  },
};
