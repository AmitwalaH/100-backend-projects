import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allows dev server to read demo.json files from sibling project-* folders
      allow: [".."],
    },
  },
});
