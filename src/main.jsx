import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// Fuentes auto-hospedadas (@fontsource): la app no depende de Google Fonts
// por internet. Sólo los pesos que se usan de verdad (ver theme.js antes,
// donde vivía el @import que esto reemplaza), y sólo el subset "latin"
// (alcanza para español: tiene á é í ó ú ñ ü ¿ ¡) — el archivo sin prefijo
// trae de yapa cyrillic, devanagari, griego, etc. que esta app no usa.
import "@fontsource/baloo-2/latin-500.css";
import "@fontsource/baloo-2/latin-700.css";
import "@fontsource/baloo-2/latin-800.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-600.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/caveat/latin-600.css";
import "@fontsource/caveat/latin-700.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
