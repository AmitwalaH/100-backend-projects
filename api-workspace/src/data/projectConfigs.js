export const projectConfigs = [
  {
    slug: "project-01-blog-api",
    title: "Blog API",
    category: "Auth",
    description: "Blog API with registration, posts, and comments. Run real backend requests from the workspace.",
    backendConfig: {
      baseUrl: "http://localhost:3000",
      calls: [
        {
          method: "POST",
          path: "/auth/register",
          description: "Register a new blog author.",
          requestBody: {
            name: "Amit Wala",
            email: "amit+demo@example.com",
            password: "Password123!",
          },
        },
        {
          method: "POST",
          path: "/auth/login",
          description: "Sign in with email and password.",
          requestBody: {
            email: "amit+demo@example.com",
            password: "Password123!",
          },
        },
        {
          method: "POST",
          path: "/posts",
          description: "Create a blog post after login.",
          requestBody: {
            title: "API Workspace Post",
            content: "This post was created from the new local API runner.",
            tags: ["blog", "api", "workspace"],
          },
        },
        {
          method: "GET",
          path: "/posts",
          description: "Fetch all posts.",
        },
      ],
    },
  },
  {
    slug: "project-02-products-api",
    title: "Products API",
    category: "E-commerce",
    description: "Product catalog service with search, pagination and product detail endpoints.",
    backendConfig: {
      baseUrl: "http://localhost:3001",
      calls: [
        {
          method: "GET",
          path: "/products",
          description: "List all products.",
        },
        {
          method: "POST",
          path: "/products",
          description: "Create a new product.",
          requestBody: {
            name: "New API Product",
            price: 29.99,
            description: "Sample product from the API workspace.",
          },
        },
      ],
    },
  },
];
