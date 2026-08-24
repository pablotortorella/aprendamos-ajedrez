import { useEffect, useState } from "react";
import LevelTab from "./components/LevelTab.jsx";
import Level1 from "./levels/Level1.jsx";
import Level2 from "./levels/Level2.jsx";
import Level3 from "./levels/Level3.jsx";
import Level4 from "./levels/Level4.jsx";
import LevelTip from "./levels/LevelTip.jsx";
import { guardarNombres, leerNombres } from "./storage.js";
import { COLORS, FONT_IMPORT } from "./theme.js";

export default function App() {
  const [level, setLevel] = useState(1);
  // Los nombres viven acá porque los usan la carta y el encabezado.
  const [nombres, setNombres] = useState(leerNombres);

  useEffect(() => {
    guardarNombres(nombres);
  }, [nombres]);

  return (
    <div style={{ background: COLORS.paper, minHeight: "100vh", fontFamily: "Nunito" }} className="p-4 sm:p-6">
      <style>{FONT_IMPORT}</style>

      <header className="max-w-2xl mx-auto text-center mb-5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">📮</span>
          <h1 style={{ fontFamily: "Baloo 2", color: COLORS.tealDark }} className="text-2xl sm:text-3xl font-extrabold">
            El Cartero de Ajedrez
          </h1>
        </div>
        <p style={{ color: COLORS.inkSoft }} className="text-sm mt-1">
          {nombres.destinataria
            ? `Aprendé a nombrar las jugadas para escribirle a ${nombres.destinataria}`
            : "Aprendé a nombrar las jugadas para escribirle a quien juega con vos"}
        </p>
      </header>

      <nav className="max-w-2xl mx-auto flex flex-wrap justify-center gap-2 mb-6">
        <LevelTab active={level === 1} onClick={() => setLevel(1)} emoji="♟️" label="1. Conocé piezas" />
        <LevelTab active={level === 2} onClick={() => setLevel(2)} emoji="🗺️" label="2. Ubicá casillas" />
        <LevelTab active={level === 3} onClick={() => setLevel(3)} emoji="🧭" label="3. Cómo se mueven" />
        <LevelTab active={level === 4} onClick={() => setLevel(4)} emoji="✉️" label="4. Escribí tu carta" />
        <LevelTab active={level === 5} onClick={() => setLevel(5)} emoji="👑" label="Consejos" />
      </nav>

      <main style={{ background: "rgba(255,255,255,0.5)", borderRadius: 24 }} className="max-w-3xl mx-auto p-4 sm:p-6">
        {level === 1 && <Level2 />}
        {level === 2 && <Level1 />}
        {level === 3 && <Level3 />}
        {level === 4 && <Level4 nombres={nombres} onCambiarNombres={setNombres} />}
        {level === 5 && <LevelTip />}
      </main>

      <footer style={{ color: COLORS.inkSoft }} className="text-center text-xs mt-6 pb-4">
        <p>Notación en español · sin enroque ni captura al paso, para no complicar todavía 🙂</p>
        <p className="mt-1">
          Hecho por Pablo Tortorella, en colaboración con Claude Code · Software libre (GPL-3.0) ·{" "}
          <a
            href="https://github.com/pablotortorella/aprendamos-ajedrez"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.teal }}
            className="underline"
          >
            código en GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
