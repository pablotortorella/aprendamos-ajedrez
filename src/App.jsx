import { useEffect, useState } from "react";
import LevelTab from "./components/LevelTab.jsx";
import Level1 from "./levels/Level1.jsx";
import Level2 from "./levels/Level2.jsx";
import Level3 from "./levels/Level3.jsx";
import Level4 from "./levels/Level4.jsx";
import LevelTip from "./levels/LevelTip.jsx";
import { guardarNombres, leerNombres } from "./storage.js";
import { FONTS } from "./theme.js";

export default function App() {
  const [level, setLevel] = useState(1);
  // Los nombres viven acá porque los usan la carta y el encabezado.
  const [nombres, setNombres] = useState(leerNombres);
  // Qué pieza (P/N/B/R/Q/K) mostrar al llegar a "Conocé piezas" o "Cómo se
  // mueven" desde el link cruzado del otro nivel. Level2/Level3 se
  // desmontan al cambiar de pestaña, así que esto sólo necesita sembrar su
  // estado inicial al montar — por eso se limpia en cada navegación de menú
  // normal, para no quedar "pegado" a la última pieza cruzada.
  const [piezaObjetivo, setPiezaObjetivo] = useState(null);

  const irANivel = (nuevoNivel, pieza = null) => {
    setLevel(nuevoNivel);
    setPiezaObjetivo(pieza);
  };

  useEffect(() => {
    guardarNombres(nombres);
  }, [nombres]);

  return (
    <div style={{ minHeight: "100vh", fontFamily: FONTS.nunito }} className="p-4 sm:p-6 bg-cartero-paper">
      <header className="max-w-2xl mx-auto text-center mb-5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">📮</span>
          <h1
            style={{ fontFamily: FONTS.baloo }}
            className="text-2xl sm:text-3xl font-extrabold text-cartero-teal-dark"
          >
            El Cartero de Ajedrez
          </h1>
        </div>
        <p className="text-sm mt-1 text-cartero-ink-soft">
          {nombres.destinataria
            ? `Aprendé a nombrar las jugadas para escribirle a ${nombres.destinataria}`
            : "Aprendé a nombrar las jugadas para escribirle a quien juega con vos"}
        </p>
      </header>

      <nav className="max-w-2xl mx-auto flex flex-wrap justify-center gap-2 mb-6">
        <LevelTab active={level === 1} onClick={() => irANivel(1)} emoji="♟️" label="1. Conocé piezas" />
        <LevelTab active={level === 2} onClick={() => irANivel(2)} emoji="🧭" label="2. Cómo se mueven" />
        <LevelTab active={level === 3} onClick={() => irANivel(3)} emoji="🗺️" label="3. Ubicá casillas" />
        <LevelTab active={level === 4} onClick={() => irANivel(4)} emoji="✉️" label="4. Escribí tu carta" />
        <LevelTab active={level === 5} onClick={() => irANivel(5)} emoji="👑" label="Consejos" />
      </nav>

      <main style={{ background: "rgba(255,255,255,0.5)", borderRadius: 24 }} className="max-w-3xl mx-auto p-4 sm:p-6">
        {level === 1 && <Level2 piezaInicial={piezaObjetivo} onVerComoSeMueve={(pieza) => irANivel(2, pieza)} />}
        {level === 2 && <Level3 piezaInicial={piezaObjetivo} onVerMasSobreLaPieza={(pieza) => irANivel(1, pieza)} />}
        {level === 3 && <Level1 />}
        {level === 4 && <Level4 nombres={nombres} onCambiarNombres={setNombres} />}
        {level === 5 && <LevelTip />}
      </main>

      <footer className="text-center text-xs mt-6 pb-4 text-cartero-ink-soft">
        <p>Notación en español 🙂</p>
        <p className="mt-1">
          Hecho por Pablo Tortorella, en colaboración con Claude Code · Software libre (GPL-3.0) ·{" "}
          <a
            href="https://github.com/pablotortorella/aprendamos-ajedrez"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-cartero-teal"
          >
            código en GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
