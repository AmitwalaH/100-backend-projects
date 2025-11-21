const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Post = require("../models/Post");
require("dotenv").config({ path: "./.env.test" });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await Post.deleteMany({});
  await mongoose.connection.close();
});

// --- Test Suite for /api/posts ---

describe("Post API Integration Tests", () => {
  // Test case 1: POST /api/posts
  it("should create a new post", async () => {
    const newPost = {
      title: "Testing the POST endpoint",
      content: "This post should be successfully created in the test DB.",
    };

    const response = await request(app).post("/api/posts").send(newPost);

    expect(response.statusCode).toBe(201);

    expect(response.body.title).toBe(newPost.title);
    expect(response.body.content).toBe(newPost.content);
  });

  // Test case 2: GET /api/posts
  it("should fetch all posts", async () => {
    const response = await request(app)
      .get("/api/posts")
      .set("Accept", "application/json");

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBeTruthy();

    expect(response.body.length).toBeGreaterThan(0);

    expect(response.body[0]).toHaveProperty("title");
    expect(response.body[0]).toHaveProperty("createdAt");
  });
});
