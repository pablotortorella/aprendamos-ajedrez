/* ============ La carta ============
   Arma el texto que se copia y se manda. Función pura: entra el historial de
   jugadas y los nombres, sale el texto.

   Los nombres no están en el código: los elige quien usa la app. Así la
   herramienta sirve para cualquier chico o chica que juegue por correspondencia,
   y de paso no quedan nombres de menores escritos en un repositorio público. */

export const LARGO_MAXIMO_NOMBRE = 24;

/**
 * Deja un nombre listo para usar: sin saltos de línea (romperían el formato de
 * la carta), sin espacios de más, y con un largo razonable.
 *
 * Ojo: NO usar esto en cada tecla que se aprieta. Al hacer trim se comería el
 * espacio recién tecleado y no se podría escribir un nombre de dos palabras.
 * Va al guardar y al escribir la carta, no mientras se tipea.
 */
export function limpiarNombre(valor) {
  if (typeof valor !== "string") return "";
  return valor.replace(/\s+/g, " ").trim().slice(0, LARGO_MAXIMO_NOMBRE);
}

/** Versión suave, para mientras se escribe: sólo corta saltos de línea y largo. */
export function recortarMientrasEscribe(valor) {
  if (typeof valor !== "string") return "";
  return valor.replace(/[\r\n\t]+/g, " ").slice(0, LARGO_MAXIMO_NOMBRE);
}

/**
 * Escribe la carta.
 *
 * El saludo es neutro a propósito ("¡Hola Ana!" y no "Querida Ana"), porque los
 * nombres los pone quien usa la app y no se sabe a quién le escribe.
 *
 * @param {Array} log       Jugadas: [{ number, white, black }]
 * @param {object} nombres  { remitente, destinataria }
 */
export function textoCarta(log, nombres = {}) {
  const destinataria = limpiarNombre(nombres.destinataria);
  const remitente = limpiarNombre(nombres.remitente);

  const lineas = (Array.isArray(log) ? log : []).map(
    (m) => `${m.number}. ${m.white}${m.black ? "  " + m.black : ""}`
  );

  const saludo = destinataria ? `¡Hola ${destinataria}!` : "¡Hola!";
  const firma = remitente ? `Cariños, ${remitente}` : "Cariños";

  return `${saludo}\nAcá van mis jugadas:\n\n${lineas.join("\n")}\n\n¡Espero tu respuesta!\n${firma}`;
}

/**
 * Inverso de textoCarta: saca la lista de jugadas de un texto pegado. Sirve
 * tanto si se pega la carta entera (con saludo y firma) como si se pega sólo
 * la lista de jugadas — cualquier línea que no tenga forma de "1. e4  e5" se
 * ignora, no rompe nada.
 *
 * No valida que las jugadas sean legales ni que la notación tenga sentido:
 * eso es trabajo de quien reconstruye el tablero con esta lista.
 *
 * @param {string} texto
 * @returns {Array<{ number: number, white: string, black: string|null }>}
 */
export function extraerJugadas(texto) {
  if (typeof texto !== "string") return [];
  const jugadas = [];
  for (const linea of texto.split(/\r?\n/)) {
    const m = linea.match(/^\s*(\d+)\.\s*(\S+)(?:\s+(\S+))?\s*$/);
    if (!m) continue;
    jugadas.push({ number: Number(m[1]), white: m[2], black: m[3] ?? null });
  }
  return jugadas;
}
