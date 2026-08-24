import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" para que el build funcione servido desde cualquier subcarpeta
// (por ejemplo GitHub Pages) sin tener que recompilar con otra ruta.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
