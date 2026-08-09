import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allows dev server to read project-page.json files from sibling project-* folders and root project manifest.
      allow: ["..", "../.."],
    },
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
