import { Component } from "react";
import { COLORS, FONTS } from "./theme.js";

/**
 * Red de seguridad para un bug que no se vio venir: sin esto, cualquier
 * excepción en un componente desmonta TODO el árbol de React y deja una
 * pantalla en blanco, sin ningún mensaje. Para alguien usando la app sola
 * (Celeste tiene 6 años), eso es mucho más confuso que un cartel simple.
 *
 * Los error boundaries de React sólo se pueden escribir como clase: no hay
 * equivalente con hooks todavía.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error atrapado por ErrorBoundary:", error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <div
        style={{ minHeight: "100vh", fontFamily: FONTS.nunito }}
        className="flex flex-col items-center justify-center gap-3 p-6 text-center bg-cartero-paper"
      >
        <span className="text-5xl">📮💔</span>
        <p style={{ fontFamily: FONTS.baloo, color: COLORS.tealDark }} className="text-xl font-extrabold">
          ¡Uy, algo se rompió!
        </p>
        <p style={{ color: COLORS.inkSoft }} className="text-sm max-w-xs">
          No es nada que hayas hecho vos. Probá recargar la página — tu partida se guardó sola, así que vas a seguir
          donde estabas.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ fontFamily: FONTS.baloo, background: COLORS.teal, color: "#fff" }}
          className="mt-2 px-5 py-2 rounded-full font-bold shadow"
        >
          Recargar
        </button>
      </div>
    );
  }
}
