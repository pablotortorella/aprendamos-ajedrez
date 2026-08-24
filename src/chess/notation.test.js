import { describe, expect, it } from "vitest";
import { moveNotation, parseMove, resolveMove } from "./notation.js";
import { at, boardFrom } from "./engine.test.js";

/** Escribe la jugada de una casilla a otra: escribir(board, "b1", "d2"). */
const escribir = (board, desde, hasta, opciones) =>
  moveNotation(board, at(desde).row, at(desde).col, at(hasta).row, at(hasta).col, opciones);

describe("jugadas simples", () => {
  it("el peón se escribe sólo con la casilla de destino", () => {
    expect(escribir(boardFrom({ e2: "P" }), "e2", "e4")).toBe("e4");
  });

  it("las demás piezas llevan su letra española adelante", () => {
    expect(escribir(boardFrom({ g1: "N" }), "g1", "f3")).toBe("Cf3");
    expect(escribir(boardFrom({ c1: "B" }), "c1", "g5")).toBe("Ag5");
    expect(escribir(boardFrom({ a1: "R" }), "a1", "d1")).toBe("Td1");
    expect(escribir(boardFrom({ d1: "Q" }), "d1", "h5")).toBe("Dh5");
    expect(escribir(boardFrom({ e1: "K" }), "e1", "f1")).toBe("Rf1");
  });
});

describe("capturas", () => {
  it("el peón que come lleva su columna de origen", () => {
    const board = boardFrom({ e4: "P", d5: "p" });
    expect(escribir(board, "e4", "d5", { capture: true })).toBe("exd5");
  });

  it("las piezas que comen llevan la x", () => {
    const board = boardFrom({ c1: "B", f4: "p" });
    expect(escribir(board, "c1", "f4", { capture: true })).toBe("Axf4");
  });
});

describe("coronación", () => {
  it("el peón que corona termina en =D", () => {
    expect(escribir(boardFrom({ e7: "P" }), "e7", "e8", { promoted: true })).toBe("e8=D");
  });

  it("coronar comiendo combina las dos cosas", () => {
    const board = boardFrom({ e7: "P", f8: "r" });
    expect(escribir(board, "e7", "f8", { capture: true, promoted: true })).toBe("exf8=D");
  });
});

describe("desambiguación (el bug que rompía las cartas)", () => {
  it("con un solo caballo no agrega nada", () => {
    expect(escribir(boardFrom({ b1: "N" }), "b1", "d2")).toBe("Cd2");
  });

  it("si dos caballos llegan a la misma casilla, aclara la COLUMNA", () => {
    // b1 y f1 pueden ir los dos a d2: "Cd2" sería ambiguo del otro lado de la carta.
    const board = boardFrom({ b1: "N", f1: "N" });
    expect(escribir(board, "b1", "d2")).toBe("Cbd2");
    expect(escribir(board, "f1", "d2")).toBe("Cfd2");
  });

  it("si comparten columna, aclara la FILA", () => {
    // b3 y b5 llegan los dos a d4, y la columna no alcanza para distinguirlos.
    const board = boardFrom({ b3: "N", b5: "N" });
    expect(escribir(board, "b3", "d4")).toBe("C3d4");
    expect(escribir(board, "b5", "d4")).toBe("C5d4");
  });

  it("si comparten columna Y fila, escribe la casilla entera", () => {
    // Tres damas que llegan a e5: la de a1 comparte columna con a5 y fila con e1.
    const board = boardFrom({ a1: "Q", e1: "Q", a5: "Q" });
    expect(escribir(board, "a1", "e5")).toBe("Da1e5");
  });

  it("no se confunde con piezas del rival ni de otro tipo", () => {
    // El caballo negro de f1 y la torre blanca no cuentan como ambigüedad.
    const board = boardFrom({ b1: "N", f1: "n", h1: "R" });
    expect(escribir(board, "b1", "d2")).toBe("Cd2");
  });

  it("no cuenta piezas del mismo tipo que NO llegan a esa casilla", () => {
    const board = boardFrom({ b1: "N", h8: "N" });
    expect(escribir(board, "b1", "d2")).toBe("Cd2");
  });

  it("desambigua también cuando come", () => {
    const board = boardFrom({ b1: "N", f1: "N", d2: "p" });
    expect(escribir(board, "b1", "d2", { capture: true })).toBe("Cbxd2");
  });

  it("el rey nunca desambigua, porque hay uno solo", () => {
    expect(escribir(boardFrom({ e1: "K" }), "e1", "d2")).toBe("Rd2");
  });

  it("dos peones que pueden comer en la misma casilla se distinguen por su columna", () => {
    // El peón ya lleva su columna al comer, así que no necesita nada extra.
    const board = boardFrom({ c4: "P", e4: "P", d5: "p" });
    expect(escribir(board, "c4", "d5", { capture: true })).toBe("cxd5");
    expect(escribir(board, "e4", "d5", { capture: true })).toBe("exd5");
  });
});

describe("bordes", () => {
  it("una casilla de origen vacía devuelve texto vacío en vez de romper", () => {
    expect(escribir(boardFrom({}), "e2", "e4")).toBe("");
  });
});

describe("parseMove", () => {
  it("un peón es sólo la casilla de destino", () => {
    expect(parseMove("e4")).toEqual({ type: "P", disambig: "", capture: false, dest: "e4", promoted: false });
  });

  it("una pieza lleva su letra", () => {
    expect(parseMove("Cf3")).toEqual({ type: "N", disambig: "", capture: false, dest: "f3", promoted: false });
  });

  it("reconoce la captura", () => {
    expect(parseMove("exd5")).toEqual({ type: "P", disambig: "e", capture: true, dest: "d5", promoted: false });
    expect(parseMove("Axf4")).toEqual({ type: "B", disambig: "", capture: true, dest: "f4", promoted: false });
  });

  it("reconoce la coronación", () => {
    expect(parseMove("e8=D")).toEqual({ type: "P", disambig: "", capture: false, dest: "e8", promoted: true });
  });

  it("reconoce los tres niveles de desambiguación", () => {
    expect(parseMove("Cbd2")).toMatchObject({ disambig: "b", dest: "d2" });
    expect(parseMove("C3d4")).toMatchObject({ disambig: "3", dest: "d4" });
    expect(parseMove("Da1e5")).toMatchObject({ disambig: "a1", dest: "e5" });
  });

  it("tolera el +/# de jaque, aunque la app todavía no los escriba", () => {
    expect(parseMove("Dh5+")).toMatchObject({ dest: "h5" });
    expect(parseMove("Dh7#")).toMatchObject({ dest: "h7" });
  });

  it("un token sin forma de jugada devuelve null en vez de romper", () => {
    expect(parseMove("")).toBeNull();
    expect(parseMove("hola")).toBeNull();
    expect(parseMove("O-O")).toBeNull(); // enroque: no soportado todavía
    expect(parseMove(undefined)).toBeNull();
  });
});

describe("resolveMove", () => {
  const resolver = (board, turn, token) => resolveMove(board, turn, parseMove(token));

  /** Arma el { fromRow, fromCol, toRow, toCol } esperado a partir de dos casillas. */
  const desdeHasta = (desde, hasta) => ({
    fromRow: at(desde).row,
    fromCol: at(desde).col,
    toRow: at(hasta).row,
    toCol: at(hasta).col,
  });

  it("encuentra el peón que puede avanzar", () => {
    const board = boardFrom({ e2: "P" });
    expect(resolver(board, "w", "e4")).toEqual(desdeHasta("e2", "e4"));
  });

  it("usa la desambiguación para elegir entre dos candidatos", () => {
    const board = boardFrom({ b1: "N", f1: "N" });
    expect(resolver(board, "w", "Cbd2")).toEqual(desdeHasta("b1", "d2"));
    expect(resolver(board, "w", "Cfd2")).toEqual(desdeHasta("f1", "d2"));
  });

  it("no resuelve una jugada ambigua sin desambiguación", () => {
    const board = boardFrom({ b1: "N", f1: "N" });
    expect(resolver(board, "w", "Cd2")).toBeNull();
  });

  it("no resuelve una jugada que ninguna pieza propia puede hacer", () => {
    const board = boardFrom({ e2: "P" });
    expect(resolver(board, "w", "Cf3")).toBeNull(); // no hay caballo
    expect(resolver(board, "b", "e4")).toBeNull(); // el peón es blanco
  });

  it("no confunde una jugada marcada como captura con una que no lo es", () => {
    const board = boardFrom({ e4: "P" }); // d5 vacía: no hay nada para comer
    expect(resolver(board, "w", "exd5")).toBeNull();
  });

  it("null de entrada (token inválido) no rompe", () => {
    expect(resolveMove(boardFrom({}), "w", null)).toBeNull();
  });
});
