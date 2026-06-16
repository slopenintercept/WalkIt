import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" → relative asset URLs, so the built app also loads from a
// file:// path inside the packaged Electron desktop app.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
