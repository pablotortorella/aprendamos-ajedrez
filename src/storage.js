/* ============ Guardado local ============
   Persistencia en localStorage: la partida del nivel 4 y el puntaje del nivel 1.
   Una partida por correspondencia dura semanas, así que recargar la página no
   puede borrarla.

   Regla de oro de este archivo: NUNCA confiar en lo que se lee. El dato guardado
   puede estar corrupto, a medio escribir, o tener el formato de una versión vieja
   de la app. Si eso llegara crudo a React, la app rompería al abrir... y seguiría
   rompiendo en cada recarga, porque el dato malo sigue guardado. Por eso todo lo
   que entra se valida, y ante la menor duda se descarta y se arranca de cero. */

import { limpiarNombre } from "./carta.js";

const CLAVE_PARTIDA = "cartero-ajedrez:partida";
const CLAVE_PUNTOS = "cartero-ajedrez:puntos-nivel1";
const CLAVE_NOMBRES = "cartero-ajedrez:nombres";

/** Si el formato guardado cambia, subir este número invalida lo viejo. */
const VERSION = 1;

const PIEZAS_VALIDAS = new Set(["P", "N", "B", "R", "Q", "K", "p", "n", "b", "r", "q", "k"]);

/**
 * localStorage puede no existir (SSR, tests) o tirar excepción con sólo tocarlo
 * (Safari en modo privado, cookies bloqueadas). Se resuelve en cada llamada para
 * que los tests puedan sustituirlo.
 */
function almacen() {
  try {
    return typeof globalThis !== "undefined" && globalThis.localStorage ? globalThis.localStorage : null;
  } catch {
    return null;
  }
}

export function esTableroValido(board) {
  if (!Array.isArray(board) || board.length !== 8) return false;
  return board.every(
    (fila) =>
      Array.isArray(fila) &&
      fila.length === 8 &&
      fila.every((casilla) => casilla === null || PIEZAS_VALIDAS.has(casilla)),
  );
}

function esJugadaDelLogValida(entrada) {
  return (
    entrada !== null &&
    typeof entrada === "object" &&
    typeof entrada.number === "number" &&
    typeof entrada.white === "string" &&
    (entrada.black === null || typeof entrada.black === "string")
  );
}

const CLAVES_ENROQUE = ["wK", "wQ", "bK", "bQ"];

/** `castling` es opcional: una partida guardada antes de sumar el enroque no lo tiene. */
function esCastlingValido(castling) {
  if (castling === null || castling === undefined) return true;
  if (typeof castling !== "object") return false;
  return CLAVES_ENROQUE.every((clave) => typeof castling[clave] === "boolean");
}

function esCasillaValida(casilla) {
  return (
    casilla !== null &&
    typeof casilla === "object" &&
    Number.isInteger(casilla.row) &&
    casilla.row >= 0 &&
    casilla.row <= 7 &&
    Number.isInteger(casilla.col) &&
    casilla.col >= 0 &&
    casilla.col <= 7
  );
}

/** `enPassant` también es opcional, por la misma razón que `castling`. */
function esEnPassantValido(enPassant) {
  return enPassant === null || enPassant === undefined || esCasillaValida(enPassant);
}

/** Valida una partida completa, incluida la posición anterior para deshacer. */
export function esPartidaValida(datos, esRaiz = true) {
  if (datos === null || typeof datos !== "object") return false;
  if (esRaiz && datos.version !== VERSION) return false;
  if (!esTableroValido(datos.board)) return false;
  if (datos.turn !== "w" && datos.turn !== "b") return false;
  if (!Array.isArray(datos.log) || !datos.log.every(esJugadaDelLogValida)) return false;
  if (!esCastlingValido(datos.castling)) return false;
  if (!esEnPassantValido(datos.enPassant)) return false;
  // `previous` es la posición anterior, para deshacer una jugada. Puede no haber.
  if (datos.previous !== null && datos.previous !== undefined) {
    if (!esPartidaValida(datos.previous, false)) return false;
  }
  return true;
}

/**
 * Devuelve la partida guardada, o null si no hay / está corrupta / es de una
 * versión vieja. Si estaba corrupta, además la borra: así el problema se
 * resuelve solo en la próxima recarga en vez de repetirse para siempre.
 */
export function leerPartida() {
  const store = almacen();
  if (!store) return null;
  let crudo;
  try {
    crudo = store.getItem(CLAVE_PARTIDA);
  } catch {
    return null;
  }
  if (!crudo) return null;

  let datos;
  try {
    datos = JSON.parse(crudo);
  } catch {
    borrarPartida();
    return null;
  }
  if (!esPartidaValida(datos)) {
    borrarPartida();
    return null;
  }
  return conDefaults(datos);
}

/** Ningún derecho de enroque: el default seguro para una partida guardada antes de sumarlo. */
const SIN_DERECHOS_DE_ENROQUE = { wK: false, wQ: false, bK: false, bQ: false };

/**
 * Completa `castling`/`enPassant` si faltan (partida guardada con una versión
 * vieja de la app), recursivamente en `previous` también. El default es el
 * conservador: sin derechos de enroque, no "todavía los tiene todos" — de una
 * partida vieja no se sabe si el rey o la torre ya se movieron, así que
 * asumir que sí se puede enrocar podría ofrecer una jugada ilegal.
 */
function conDefaults(datos) {
  return {
    board: datos.board,
    turn: datos.turn,
    log: datos.log,
    previous: datos.previous ? conDefaults(datos.previous) : null,
    castling: datos.castling ?? SIN_DERECHOS_DE_ENROQUE,
    enPassant: datos.enPassant ?? null,
  };
}

export function guardarPartida(estado) {
  const store = almacen();
  if (!store) return false;
  try {
    store.setItem(CLAVE_PARTIDA, JSON.stringify({ version: VERSION, ...estado }));
    return true;
  } catch {
    // Puede fallar por cuota llena o por modo privado. No es motivo para
    // interrumpir la partida: se sigue jugando, sólo que sin guardar.
    return false;
  }
}

export function borrarPartida() {
  const store = almacen();
  if (!store) return;
  try {
    store.removeItem(CLAVE_PARTIDA);
  } catch {
    /* nada que hacer */
  }
}

export function leerPuntos() {
  const store = almacen();
  if (!store) return 0;
  try {
    const n = Number(store.getItem(CLAVE_PUNTOS));
    // Descarta NaN, negativos, infinitos y decimales raros.
    return Number.isInteger(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function guardarPuntos(puntos) {
  const store = almacen();
  if (!store) return false;
  try {
    store.setItem(CLAVE_PUNTOS, String(puntos));
    return true;
  } catch {
    return false;
  }
}

/**
 * Nombres de quien escribe y quien recibe la carta. Si no hay nada guardado (o
 * lo guardado no sirve), devuelve dos strings vacíos: la carta sale igual, sólo
 * que con un saludo genérico.
 */
export function leerNombres() {
  const vacio = { remitente: "", destinataria: "" };
  const store = almacen();
  if (!store) return vacio;
  try {
    const crudo = store.getItem(CLAVE_NOMBRES);
    if (!crudo) return vacio;
    const datos = JSON.parse(crudo);
    if (datos === null || typeof datos !== "object") return vacio;
    return {
      remitente: limpiarNombre(datos.remitente),
      destinataria: limpiarNombre(datos.destinataria),
    };
  } catch {
    return vacio;
  }
}

export function guardarNombres(nombres) {
  const store = almacen();
  if (!store) return false;
  try {
    store.setItem(
      CLAVE_NOMBRES,
      JSON.stringify({
        remitente: limpiarNombre(nombres?.remitente),
        destinataria: limpiarNombre(nombres?.destinataria),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
