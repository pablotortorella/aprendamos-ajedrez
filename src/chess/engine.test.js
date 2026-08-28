import { describe, expect, it } from "vitest";
import {
  applyMove,
  createEmptyBoard,
  createInitialBoard,
  findKing,
  generateLegalMoves,
  generateMoves,
  hasAnyLegalMoves,
  initialCastlingRights,
  isInCheck,
  isSquareAttacked,
  FILES,
} from "./engine.js";

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

const movesFrom = (board, casilla, context) => {
  const { row, col } = at(casilla);
  return generateMoves(board, row, col, context);
};

const destinos = (board, casilla, context) =>
  movesFrom(board, casilla, context)
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

describe("applyMove", () => {
  it("mueve la pieza y deja vacío el origen, sin tocar el tablero original", () => {
    const board = boardFrom({ e2: "P" });
    const { board: nuevo } = applyMove(board, at("e2").row, at("e2").col, at("e4").row, at("e4").col);
    expect(nuevo[at("e2").row][at("e2").col]).toBeNull();
    expect(nuevo[at("e4").row][at("e4").col]).toBe("P");
    expect(board[at("e2").row][at("e2").col]).toBe("P"); // el original no cambia
  });

  it("reemplaza la pieza comida en destino", () => {
    const board = boardFrom({ c1: "B", f4: "p" });
    const { board: nuevo } = applyMove(board, at("c1").row, at("c1").col, at("f4").row, at("f4").col);
    expect(nuevo[at("f4").row][at("f4").col]).toBe("B");
  });

  it("un peón que llega a la última fila corona a Dama, del color que corresponda", () => {
    const blancas = boardFrom({ e7: "P" });
    const { board: b, promoted: pb } = applyMove(blancas, at("e7").row, at("e7").col, at("e8").row, at("e8").col);
    expect(b[at("e8").row][at("e8").col]).toBe("Q");
    expect(pb).toBe(true);

    const negras = boardFrom({ e2: "p" });
    const { board: n, promoted: pn } = applyMove(negras, at("e2").row, at("e2").col, at("e1").row, at("e1").col);
    expect(n[at("e1").row][at("e1").col]).toBe("q");
    expect(pn).toBe(true);
  });

  it("un peón que no llega a la última fila no corona", () => {
    const { promoted } = applyMove(boardFrom({ e2: "P" }), at("e2").row, at("e2").col, at("e4").row, at("e4").col);
    expect(promoted).toBe(false);
  });
});

describe("findKing", () => {
  it("encuentra el rey del color pedido", () => {
    const board = boardFrom({ e1: "K", e8: "k" });
    expect(findKing(board, true)).toEqual(at("e1"));
    expect(findKing(board, false)).toEqual(at("e8"));
  });

  it("sin rey en el tablero, devuelve null en vez de romper", () => {
    expect(findKing(boardFrom({}), true)).toBeNull();
  });
});

describe("isSquareAttacked", () => {
  it("una torre ataca a lo largo de toda su fila y columna", () => {
    const board = boardFrom({ a1: "R" });
    expect(isSquareAttacked(board, at("a8").row, at("a8").col, true)).toBe(true);
    expect(isSquareAttacked(board, at("h1").row, at("h1").col, true)).toBe(true);
    expect(isSquareAttacked(board, at("b2").row, at("b2").col, true)).toBe(false);
  });

  it("una pieza no ataca a través de otra que le bloquea el paso", () => {
    const board = boardFrom({ a1: "R", a4: "P" });
    expect(isSquareAttacked(board, at("a8").row, at("a8").col, true)).toBe(false);
    expect(isSquareAttacked(board, at("a3").row, at("a3").col, true)).toBe(true);
  });

  it("un peón ataca en diagonal, incluso si la casilla está vacía", () => {
    const board = boardFrom({ e4: "P" });
    expect(isSquareAttacked(board, at("d5").row, at("d5").col, true)).toBe(true);
    expect(isSquareAttacked(board, at("f5").row, at("f5").col, true)).toBe(true);
    // Un peón NO ataca derecho adelante: ahí sólo puede avanzar, no comer.
    expect(isSquareAttacked(board, at("e5").row, at("e5").col, true)).toBe(false);
  });
});

describe("isInCheck", () => {
  it("el rey está en jaque si algo lo ataca", () => {
    const board = boardFrom({ e1: "K", e8: "r" });
    expect(isInCheck(board, true)).toBe(true);
  });

  it("el rey no está en jaque si nada lo ataca", () => {
    const board = boardFrom({ e1: "K", a8: "r" });
    expect(isInCheck(board, true)).toBe(false);
  });

  it("sin rey en el tablero no rompe (para tests que no lo necesitan)", () => {
    expect(isInCheck(boardFrom({ e4: "P" }), true)).toBe(false);
  });
});

describe("generateLegalMoves", () => {
  it("una pieza clavada que no puede quedarse en la línea de la clavada no tiene jugadas", () => {
    // El caballo en e2 tapa el jaque de la torre negra al rey blanco. Cualquier
    // salto lo saca de la columna "e" (un caballo nunca se queda en la misma
    // columna), así que ninguno de sus movimientos pseudo-legales es legal.
    const board = boardFrom({ e1: "K", e2: "N", e8: "r" });
    expect(generateLegalMoves(board, at("e2").row, at("e2").col)).toEqual([]);
    // Sin la torre negra, el mismo caballo sí tiene jugadas.
    expect(generateLegalMoves(boardFrom({ e1: "K", e2: "N" }), at("e2").row, at("e2").col).length).toBeGreaterThan(0);
  });

  it("en jaque, el rey sólo puede ir a casillas que no sigan atacadas", () => {
    const board = boardFrom({ e1: "K", e8: "r" });
    const destinos = generateLegalMoves(board, at("e1").row, at("e1").col)
      .map((m) => `${FILES[m.col]}${8 - m.row}`)
      .sort();
    // d1, d2, f1, f2 salen de la columna "e" atacada; e2 se queda en ella.
    expect(destinos).toEqual(["d1", "d2", "f1", "f2"]);
  });
});

describe("hasAnyLegalMoves", () => {
  it("con jugadas legales disponibles, da true", () => {
    expect(hasAnyLegalMoves(createInitialBoard(), true)).toBe(true);
  });

  it("mate del pasillo: en jaque y sin ninguna jugada legal, da false", () => {
    // Rey blanco encerrado por sus propios peones, torre negra jaqueando por
    // la fila 1 sin nada en el medio: ni el rey ni los peones pueden hacer nada.
    const board = boardFrom({ g1: "K", f2: "P", g2: "P", h2: "P", a1: "r" });
    expect(isInCheck(board, true)).toBe(true);
    expect(hasAnyLegalMoves(board, true)).toBe(false);
  });
});

describe("enroque — generateMoves", () => {
  it("ofrece los dos lados si nada se lo impide", () => {
    const board = boardFrom({ e1: "K", a1: "R", h1: "R" });
    expect(destinos(board, "e1", { castling: initialCastlingRights() })).toEqual([
      "c1",
      "d1",
      "d2",
      "e2",
      "f1",
      "f2",
      "g1",
    ]);
  });

  it("sin el contexto de enroque, no lo ofrece (nivel 'Cómo se mueven')", () => {
    const board = boardFrom({ e1: "K", a1: "R", h1: "R" });
    expect(destinos(board, "e1")).toEqual(["d1", "d2", "e2", "f1", "f2"]);
  });

  it("no lo ofrece si ya perdió el derecho de ese lado", () => {
    const board = boardFrom({ e1: "K", a1: "R", h1: "R" });
    const rights = { wK: false, wQ: false, bK: true, bQ: true };
    expect(destinos(board, "e1", { castling: rights })).toEqual(["d1", "d2", "e2", "f1", "f2"]);
  });

  it("no lo ofrece de un lado si hay una pieza en el medio", () => {
    // f1 ocupado por un alfil propio: tapa el corto, el largo sigue libre.
    const board = boardFrom({ e1: "K", a1: "R", h1: "R", f1: "B" });
    expect(destinos(board, "e1", { castling: initialCastlingRights() })).toEqual(["c1", "d1", "d2", "e2", "f2"]);
  });

  it("no lo ofrece si el rey está en jaque", () => {
    const board = boardFrom({ e1: "K", a1: "R", h1: "R", e8: "r" });
    const d = destinos(board, "e1", { castling: initialCastlingRights() });
    expect(d).not.toContain("c1");
    expect(d).not.toContain("g1");
  });

  it("no lo ofrece de un lado si el rey pasa por una casilla atacada", () => {
    // La torre negra en f8 ataca f1, la casilla que el rey cruza para el corto.
    const board = boardFrom({ e1: "K", a1: "R", h1: "R", f8: "r" });
    const d = destinos(board, "e1", { castling: initialCastlingRights() });
    expect(d).not.toContain("g1");
    expect(d).toContain("c1"); // el largo no se ve afectado
  });

  it("no lo ofrece si no hay una torre propia en la esquina", () => {
    const board = boardFrom({ e1: "K" });
    expect(destinos(board, "e1", { castling: initialCastlingRights() })).toEqual(["d1", "d2", "e2", "f1", "f2"]);
  });
});

describe("enroque — applyMove", () => {
  it("enroque corto: la torre salta al otro lado del rey, en la misma jugada", () => {
    const board = boardFrom({ e1: "K", h1: "R" });
    const { board: after } = applyMove(board, at("e1").row, at("e1").col, at("g1").row, at("g1").col);
    expect(after[at("g1").row][at("g1").col]).toBe("K");
    expect(after[at("f1").row][at("f1").col]).toBe("R");
    expect(after[at("h1").row][at("h1").col]).toBeNull();
  });

  it("enroque largo: la torre salta al otro lado del rey, en la misma jugada", () => {
    const board = boardFrom({ e1: "K", a1: "R" });
    const { board: after } = applyMove(board, at("e1").row, at("e1").col, at("c1").row, at("c1").col);
    expect(after[at("c1").row][at("c1").col]).toBe("K");
    expect(after[at("d1").row][at("d1").col]).toBe("R");
    expect(after[at("a1").row][at("a1").col]).toBeNull();
  });

  it("también funciona para las negras, con su propia torre", () => {
    const board = boardFrom({ e8: "k", h8: "r" });
    const { board: after } = applyMove(board, at("e8").row, at("e8").col, at("g8").row, at("g8").col);
    expect(after[at("g8").row][at("g8").col]).toBe("k");
    expect(after[at("f8").row][at("f8").col]).toBe("r");
  });

  it("enrocar pierde los dos derechos de ese color", () => {
    const board = boardFrom({ e1: "K", h1: "R" });
    const { castling } = applyMove(
      board,
      at("e1").row,
      at("e1").col,
      at("g1").row,
      at("g1").col,
      initialCastlingRights(),
    );
    expect(castling).toEqual({ wK: false, wQ: false, bK: true, bQ: true });
  });

  it("mover la torre (sin enrocar) pierde sólo el derecho de ese lado", () => {
    const board = boardFrom({ h1: "R" });
    const { castling } = applyMove(
      board,
      at("h1").row,
      at("h1").col,
      at("h4").row,
      at("h4").col,
      initialCastlingRights(),
    );
    expect(castling).toEqual({ wK: false, wQ: true, bK: true, bQ: true });
  });

  it("comer una torre en su casilla de origen quita el derecho, aunque ella nunca se haya movido", () => {
    // Caballo negro en g3 (no una torre: así no se pisa con la regla de "la
    // pieza que se mueve sale de su propia esquina") saltando a comer la
    // torre blanca en h1.
    const board = boardFrom({ h1: "R", g3: "n" });
    const { castling } = applyMove(
      board,
      at("g3").row,
      at("g3").col,
      at("h1").row,
      at("h1").col,
      initialCastlingRights(),
    );
    expect(castling).toEqual({ wK: false, wQ: true, bK: true, bQ: true });
  });
});

describe("captura al paso", () => {
  it("el peón ofrece la captura si hay un objetivo adyacente en el contexto", () => {
    const board = boardFrom({ e5: "P", d5: "p" });
    const context = { enPassant: at("d6") };
    expect(destinos(board, "e5", context)).toContain("d6");
    const move = movesFrom(board, "e5", context).find((m) => m.row === at("d6").row && m.col === at("d6").col);
    expect(move.capture).toBe(true);
  });

  it("sin el objetivo en el contexto, no la ofrece (no inventa capturas fantasma)", () => {
    const board = boardFrom({ e5: "P", d5: "p" });
    expect(destinos(board, "e5")).not.toContain("d6");
  });

  it("un peón que no está al lado del objetivo no puede capturar al paso", () => {
    const board = boardFrom({ b5: "P" });
    expect(destinos(board, "b5", { enPassant: at("d6") })).not.toContain("d6");
  });

  it("al aplicarla, saca el peón comido — que no está en la casilla destino", () => {
    const board = boardFrom({ e5: "P", d5: "p" });
    const { board: after } = applyMove(board, at("e5").row, at("e5").col, at("d6").row, at("d6").col);
    expect(after[at("d6").row][at("d6").col]).toBe("P");
    expect(after[at("d5").row][at("d5").col]).toBeNull();
    expect(after[at("e5").row][at("e5").col]).toBeNull();
  });

  it("un peón que avanza dos casillas deja listo el objetivo para la próxima jugada", () => {
    const board = boardFrom({ e2: "P" });
    const { enPassant } = applyMove(board, at("e2").row, at("e2").col, at("e4").row, at("e4").col);
    expect(enPassant).toEqual(at("e3"));
  });

  it("cualquier otra jugada borra el objetivo (dura una sola jugada)", () => {
    const board = boardFrom({ a2: "P" });
    const { enPassant } = applyMove(board, at("a2").row, at("a2").col, at("a3").row, at("a3").col);
    expect(enPassant).toBeNull();
  });
});
