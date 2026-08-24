const { Schema } = require("mongoose");

function getModels(db) {
  if (db.models.Post) return { Post: db.model("Post") };

  const PostSchema = new Schema({
    title: { type: String, required: true },
    content: String,
    slug: String,
    tags: [String],
    author: String,
    createdAt: { type: Date, default: Date.now },
  });

  return { Post: db.model("Post", PostSchema) };
}

module.exports = {
  "POST /api/auth/register": async (body) => {
    const { name, email } = body;
    if (!name || !email) {
      return {
        status: 400,
        body: { success: false, error: "name and email are required" },
      };
    }

    return {
      status: 201,
      body: {
        success: true,
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signature",
        user: { _id: "demo_" + Date.now(), name, email },
      },
    };
  },

  "POST /api/posts": async (body, db) => {
    const { title, content = "", tags = [] } = body;
    if (!title) {
      return {
        status: 400,
        body: { success: false, error: "title is required" },
      };
    }

    const { Post } = getModels(db);
    const post = await Post.create({
      title,
      content,
      tags,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      author: "demo_user",
    });

    return {
      status: 201,
      body: {
        success: true,
        post: {
          _id: post._id,
          title: post.title,
          slug: post.slug,
          tags: post.tags,
          createdAt: post.createdAt,
        },
      },
    };
  },

  "GET /api/posts": async (_body, db) => {
    const { Post } = getModels(db);
    const posts = await Post.find().sort({ createdAt: -1 }).limit(10).lean();
    return {
      status: 200,
      body: { success: true, count: posts.length, posts },
    };
  },
};
