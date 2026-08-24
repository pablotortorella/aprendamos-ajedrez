import { beforeEach, describe, expect, it } from "vitest";
import { createInitialBoard } from "./chess/engine.js";
import {
  borrarPartida,
  esPartidaValida,
  esTableroValido,
  guardarPartida,
  guardarPuntos,
  leerPartida,
  leerPuntos,
} from "./storage.js";

/** localStorage de mentira, para no depender de un navegador en los tests. */
function fakeStorage({ romperAlEscribir = false, romperAlLeer = false } = {}) {
  const datos = new Map();
  return {
    getItem: (k) => {
      if (romperAlLeer) throw new Error("acceso denegado");
      return datos.has(k) ? datos.get(k) : null;
    },
    setItem: (k, v) => {
      if (romperAlEscribir) throw new Error("cuota llena");
      datos.set(k, String(v));
    },
    removeItem: (k) => datos.delete(k),
    _datos: datos,
  };
}

const partida = () => ({ board: createInitialBoard(), turn: "w", log: [], previous: null });

beforeEach(() => {
  globalThis.localStorage = fakeStorage();
});

describe("validación del tablero", () => {
  it("acepta un tablero inicial", () => {
    expect(esTableroValido(createInitialBoard())).toBe(true);
  });

  it("rechaza lo que no es un tablero", () => {
    for (const basura of [null, undefined, "hola", 42, {}, []]) {
      expect(esTableroValido(basura)).toBe(false);
    }
  });

  it("rechaza un tablero con la cantidad de filas equivocada", () => {
    expect(esTableroValido(createInitialBoard().slice(0, 7))).toBe(false);
  });

  it("rechaza un tablero con una fila corta", () => {
    const b = createInitialBoard();
    b[3] = b[3].slice(0, 6);
    expect(esTableroValido(b)).toBe(false);
  });

  it("rechaza piezas inventadas", () => {
    const b = createInitialBoard();
    b[4][4] = "X";
    expect(esTableroValido(b)).toBe(false);
  });
});

describe("validación de la partida", () => {
  it("acepta una partida bien formada", () => {
    expect(esPartidaValida({ version: 1, ...partida() })).toBe(true);
  });

  it("rechaza una versión de formato distinta", () => {
    expect(esPartidaValida({ version: 99, ...partida() })).toBe(false);
  });

  it("rechaza un turno que no es w ni b", () => {
    expect(esPartidaValida({ version: 1, ...partida(), turn: "verde" })).toBe(false);
  });

  it("rechaza un log que no tiene la forma esperada", () => {
    expect(esPartidaValida({ version: 1, ...partida(), log: [{ number: "1" }] })).toBe(false);
  });

  it("acepta el log real de una partida empezada", () => {
    const log = [{ number: 1, white: "e4", black: "e5" }, { number: 2, white: "Cf3", black: null }];
    expect(esPartidaValida({ version: 1, ...partida(), log })).toBe(true);
  });

  it("valida también la posición guardada para deshacer", () => {
    const conBasura = { version: 1, ...partida(), previous: { board: "cualquier cosa" } };
    expect(esPartidaValida(conBasura)).toBe(false);
  });
});

describe("guardar y leer la partida", () => {
  it("lo que se guarda se puede volver a leer igual", () => {
    const estado = partida();
    expect(guardarPartida(estado)).toBe(true);
    expect(leerPartida()).toEqual(estado);
  });

  it("sin nada guardado devuelve null", () => {
    expect(leerPartida()).toBe(null);
  });

  it("con JSON roto devuelve null Y limpia el dato para que no se repita", () => {
    globalThis.localStorage.setItem("cartero-ajedrez:partida", "{esto no es json");
    expect(leerPartida()).toBe(null);
    expect(globalThis.localStorage.getItem("cartero-ajedrez:partida")).toBe(null);
  });

  it("con una partida corrupta devuelve null Y la limpia", () => {
    globalThis.localStorage.setItem(
      "cartero-ajedrez:partida",
      JSON.stringify({ version: 1, board: [[1, 2]], turn: "w", log: [] })
    );
    expect(leerPartida()).toBe(null);
    expect(globalThis.localStorage.getItem("cartero-ajedrez:partida")).toBe(null);
  });

  it("borrarPartida deja el guardado vacío", () => {
    guardarPartida(partida());
    borrarPartida();
    expect(leerPartida()).toBe(null);
  });
});

describe("cuando el navegador no deja guardar", () => {
  it("sin localStorage no rompe: devuelve null y false", () => {
    globalThis.localStorage = undefined;
    expect(leerPartida()).toBe(null);
    expect(guardarPartida(partida())).toBe(false);
    expect(leerPuntos()).toBe(0);
    expect(guardarPuntos(5)).toBe(false);
  });

  it("si escribir tira excepción (cuota llena) devuelve false sin romper", () => {
    globalThis.localStorage = fakeStorage({ romperAlEscribir: true });
    expect(guardarPartida(partida())).toBe(false);
    expect(guardarPuntos(3)).toBe(false);
  });

  it("si leer tira excepción (modo privado) devuelve el valor por defecto", () => {
    globalThis.localStorage = fakeStorage({ romperAlLeer: true });
    expect(leerPartida()).toBe(null);
    expect(leerPuntos()).toBe(0);
  });
});

describe("puntaje", () => {
  it("guarda y lee un puntaje", () => {
    guardarPuntos(7);
    expect(leerPuntos()).toBe(7);
  });

  it("sin nada guardado arranca en 0", () => {
    expect(leerPuntos()).toBe(0);
  });

  it("descarta valores que no son enteros positivos", () => {
    for (const basura of ["hola", "-3", "2.5", "Infinity", ""]) {
      globalThis.localStorage.setItem("cartero-ajedrez:puntos-nivel1", basura);
      expect(leerPuntos()).toBe(0);
    }
  });
});
