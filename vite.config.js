import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" para que el build funcione servido desde cualquier subcarpeta
// (por ejemplo GitHub Pages) sin tener que recompilar con otra ruta.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  test: {
    // Los tests puros (motor, notación, carta, guardado) no necesitan DOM y
    // corren más rápido sin él. Los tests de componentes lo piden por archivo
    // con "// @vitest-environment jsdom" arriba de todo.
    environment: "node",
    setupFiles: ["./src/test/setup.js"],
  },
});
