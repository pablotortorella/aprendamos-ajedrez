// Textos de la pantalla de Ayuda: qué hace cada sección del menú, para quien
// llega a la app por primera vez o se perdió. Un párrafo corto por sección —
// la explicación completa de cada una ya vive en esa misma sección.
// `nivel` es el número que usa App.jsx (el mismo de irANivel) para saber a qué
// sección ir cuando se toca la tarjeta — no es sólo un número decorativo en
// el título.
export const AYUDA = [
  {
    nivel: 1,
    emoji: "♟️",
    titulo: "1. Conocé piezas",
    texto: "Mirá cada pieza: cómo se llama, cuánto vale y con qué letra se anota al escribir una jugada.",
  },
  {
    nivel: 2,
    emoji: "🧭",
    titulo: "2. Cómo se mueven",
    texto: "Elegís una pieza y el tablero muestra, con puntos verdes, a qué casillas puede moverse.",
  },
  {
    nivel: 3,
    emoji: "🗺️",
    titulo: "3. Ubicá casillas",
    texto: "Practicás encontrar rápido una casilla del tablero (por ejemplo e5) antes de jugar de verdad.",
  },
  {
    nivel: 4,
    emoji: "✉️",
    titulo: "4. Escribí tu carta",
    texto:
      "Acá se juega de verdad: movés las piezas en el tablero y se arma el texto de la carta para mandar. " +
      "Si te llega una respuesta, la pegás para seguir la partida donde quedó.",
  },
  {
    nivel: 5,
    emoji: "👑",
    titulo: "Consejos",
    texto: "Seis ideas simples para pensar mejor cada jugada, del cuidado del Rey a no regalar piezas gratis.",
  },
];
