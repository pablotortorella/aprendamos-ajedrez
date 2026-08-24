import { describe, expect, it } from "vitest";
import { createEmptyBoard, createInitialBoard, generateMoves, FILES } from "./engine.js";

/** Arma un tablero desde coordenadas de ajedrez: boardFrom({ e4: "P", d5: "p" }). */
export function boardFrom(piezas) {
  const board = createEmptyBoard();
  for (const [casilla, pieza] of Object.entries(piezas)) {
    board[8 - Number(casilla[1])][FILES.indexOf(casilla[0])] = pieza;
  }
  return board;
}

/** Coordenada de ajedrez a índices internos: at("e4") -> { row, col }. */
export function at(casilla) {
  return { row: 8 - Number(casilla[1]), col: FILES.indexOf(casilla[0]) };
}

const movesFrom = (board, casilla) => {
  const { row, col } = at(casilla);
  return generateMoves(board, row, col);
};

const destinos = (board, casilla) =>
  movesFrom(board, casilla)
    .map((m) => `${FILES[m.col]}${8 - m.row}`)
    .sort();

describe("caballo", () => {
  it("en la esquina tiene sólo 2 salidas, no 8", () => {
    const board = boardFrom({ a1: "N" });
    expect(destinos(board, "a1")).toEqual(["b3", "c2"]);
  });

  it("en el centro tiene 8 salidas", () => {
    expect(movesFrom(boardFrom({ d5: "N" }), "d5")).toHaveLength(8);
  });

  it("salta por encima de las piezas que tiene alrededor", () => {
    const board = boardFrom({ d5: "N", d6: "P", c5: "P", e5: "P", d4: "P" });
    expect(movesFrom(board, "d5")).toHaveLength(8);
  });
});

describe("peón", () => {
  it("avanza uno o dos desde su fila inicial", () => {
    expect(destinos(boardFrom({ e2: "P" }), "e2")).toEqual(["e3", "e4"]);
  });

  it("avanza sólo uno si ya salió de su fila inicial", () => {
    expect(destinos(boardFrom({ e3: "P" }), "e3")).toEqual(["e4"]);
  });

  it("no puede dar el doble paso si la casilla del medio está ocupada", () => {
    expect(movesFrom(boardFrom({ e2: "P", e3: "p" }), "e2")).toHaveLength(0);
  });

  it("no puede dar el doble paso si el destino está ocupado", () => {
    expect(destinos(boardFrom({ e2: "P", e4: "p" }), "e2")).toEqual(["e3"]);
  });

  it("no come de frente", () => {
    expect(movesFrom(boardFrom({ e4: "P", e5: "p" }), "e4")).toHaveLength(0);
  });

  it("come en diagonal", () => {
    const board = boardFrom({ e4: "P", d5: "p", f5: "p" });
    expect(destinos(board, "e4")).toEqual(["d5", "e5", "f5"]);
  });

  it("el negro avanza para el otro lado", () => {
    expect(destinos(boardFrom({ e7: "p" }), "e7")).toEqual(["e5", "e6"]);
  });
});

describe("piezas que se deslizan", () => {
  it("la torre se frena ANTES de su propia pieza", () => {
    const board = boardFrom({ a1: "R", a2: "P" });
    expect(destinos(board, "a1")).toEqual(["b1", "c1", "d1", "e1", "f1", "g1", "h1"]);
  });

  it("la torre se frena EN la pieza rival, comiéndola", () => {
    const board = boardFrom({ a1: "R", a2: "p" });
    const movs = movesFrom(board, "a1");
    expect(movs).toHaveLength(8);
    expect(movs.find((m) => m.row === at("a2").row && m.col === at("a2").col).capture).toBe(true);
  });

  it("el alfil no cambia nunca de color de casilla", () => {
    const board = boardFrom({ c1: "B" });
    // c1 es oscura: todos sus destinos tienen que ser oscuros también.
    for (const m of movesFrom(board, "c1")) {
      expect((m.row + m.col) % 2).toBe((at("c1").row + at("c1").col) % 2);
    }
  });

  it("la dama combina torre y alfil", () => {
    const torre = movesFrom(boardFrom({ d4: "R" }), "d4").length;
    const alfil = movesFrom(boardFrom({ d4: "B" }), "d4").length;
    expect(movesFrom(boardFrom({ d4: "Q" }), "d4")).toHaveLength(torre + alfil);
  });
});

describe("posición inicial", () => {
  it("las blancas arrancan con 20 jugadas posibles", () => {
    const board = createInitialBoard();
    let total = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p === p.toUpperCase()) total += generateMoves(board, r, c).length;
      }
    }
    expect(total).toBe(20); // 16 de peones + 4 de caballos
  });

  it("una casilla vacía no devuelve movimientos", () => {
    expect(generateMoves(createInitialBoard(), 4, 4)).toEqual([]);
  });
});
