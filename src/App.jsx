import React, { useState, useMemo, useCallback } from "react";

/* ============ Paleta y tipografía ============
   Tema: "Cartero de Ajedrez" — inspirado en la partida por correspondencia
   real de Celeste con Paulina. Tablero tipo sello postal, acentos dorados
   de estampilla, y una "carta" que se puede copiar y mandar de verdad. */

const COLORS = {
  paper: "#EAF2F0",
  paperCard: "#FFFFFF",
  ink: "#1F3A3E",
  inkSoft: "#4C6B6E",
  teal: "#1F6F76",
  tealDark: "#164E53",
  lightSquare: "#F5ECD9",
  darkSquare: "#2A6F77",
  gold: "#E8A33D",
  goldSoft: "#F6D8A0",
  coral: "#E0574C",
  moveHint: "#7FBF8F",
};

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&family=Caveat:wght@600;700&display=swap');";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const algebraic = (row, col) => `${FILES[col]}${8 - row}`;

const PIECE_INFO = {
  P: {
    name: "Peón",
    letter: "",
    desc: "Camina derecho, come en diagonal. ¡Es lento pero de a muchos!",
    value: "1 punto",
    funFact: "Si un peón llega hasta el final del tablero, ¡se transforma en otra pieza! Casi siempre en Dama.",
    example: "Si mueve de e2 a e4, se escribe: e4",
  },
  N: {
    name: "Caballo",
    letter: "C",
    desc: "Salta en forma de L. Es el único que salta sobre otras piezas.",
    value: "3 puntos",
    funFact: "Es la única pieza que puede moverse al principio de la partida sin que nadie le abra camino.",
    example: "Si salta a f3, se escribe: Cf3",
  },
  B: {
    name: "Alfil",
    letter: "A",
    desc: "Se mueve en diagonal, siempre por el mismo color de casilla.",
    value: "3 puntos",
    funFact: "Cada jugador tiene un alfil de casillas claras y otro de casillas oscuras, ¡y nunca cambian de color!",
    example: "Si va a g5, se escribe: Ag5",
  },
  R: {
    name: "Torre",
    letter: "T",
    desc: "Se mueve en línea recta: adelante, atrás o al costado.",
    value: "5 puntos",
    funFact: "Empieza encerrada en la esquina, pero cuando el tablero se abre se vuelve durísima de enfrentar.",
    example: "Si va a d8, se escribe: Td8",
  },
  Q: {
    name: "Dama",
    letter: "D",
    desc: "La más poderosa: combina Torre + Alfil.",
    value: "9 puntos",
    funFact: "Es la pieza más fuerte, ¡pero perderla no significa perder la partida! Solo el Rey es insustituible.",
    example: "Si va a h5, se escribe: Dh5",
  },
  K: {
    name: "Rey",
    letter: "R",
    desc: "Un paso para cualquier lado. ¡Hay que cuidarlo siempre!",
    value: "No tiene puntos",
    funFact: "No se compara en puntos con las demás piezas: si lo atrapan (jaque mate), se termina la partida.",
    example: "Si va a f1, se escribe: Rf1",
  },
};

const TIPS = [
  {
    emoji: "♔",
    titulo: "Cuidá siempre a tu Rey",
    texto:
      "Antes de mover cualquier pieza, mirá el tablero completo: ¿mi Rey está seguro? Fijate si alguna pieza rival lo puede alcanzar.",
  },
  {
    emoji: "🎯",
    titulo: "Controlá el centro",
    texto:
      "Las casillas del medio del tablero (d4, e4, d5, e5) son las más valiosas. Las piezas que están ahí ven más casillas y se mueven mejor.",
  },
  {
    emoji: "🐴",
    titulo: "Sacá tus piezas primero",
    texto:
      "Al empezar, tratá de mover Caballos y Alfiles antes que la Dama. Si la sacás muy temprano, el rival te la puede espantar y perder tiempo.",
  },
  {
    emoji: "🎁",
    titulo: "No regales piezas gratis",
    texto:
      "Antes de mover, preguntate: si dejo la pieza ahí, ¿me la pueden comer sin que yo pueda comer nada a cambio?",
  },
  {
    emoji: "🐢",
    titulo: "Pensá tranquila, no hay apuro",
    texto:
      "Como juegan por correspondencia, tenés todo el tiempo del mundo. Mirá bien el tablero antes de escribir tu jugada en la carta.",
  },
  {
    emoji: "🔁",
    titulo: "Aprendé de tus partidas",
    texto:
      "Ganes o pierdas, después de cada partida pensá: ¿qué jugada me gustó más? ¿Cuál cambiarías si jugaras de nuevo?",
  },
];

const UNICODE = {
  wP: "♙", wN: "♘", wB: "♗", wR: "♖", wQ: "♕", wK: "♔",
  bP: "♟", bN: "♞", bB: "♝", bR: "♜", bQ: "♛", bK: "♚",
};
const pieceGlyph = (piece) => {
  if (!piece) return "";
  const color = isWhite(piece) ? "w" : "b";
  return UNICODE[color + piece.toUpperCase()];
};

function isWhite(piece) {
  return piece === piece.toUpperCase();
}
function pieceType(piece) {
  return piece.toUpperCase();
}

function createInitialBoard() {
  const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = back[c].toLowerCase();
    board[1][c] = "p";
    board[6][c] = "P";
    board[7][c] = back[c];
  }
  return board;
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function slide(board, row, col, white, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr,
      c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c, capture: false });
      } else {
        if (isWhite(target) !== white) moves.push({ row: r, col: c, capture: true });
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

function stepMoves(board, row, col, white, offsets) {
  const moves = [];
  for (const [dr, dc] of offsets) {
    const r = row + dr,
      c = col + dc;
    if (r < 0 || r > 7 || c < 0 || c > 7) continue;
    const target = board[r][c];
    if (!target || isWhite(target) !== white) {
      moves.push({ row: r, col: c, capture: !!target });
    }
  }
  return moves;
}

const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ORTH = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_OFFSETS = [...DIAG, ...ORTH];

function generateMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  const white = isWhite(piece);
  const type = pieceType(piece);

  if (type === "P") {
    const moves = [];
    const dir = white ? -1 : 1;
    const startRow = white ? 6 : 1;
    const oneStep = row + dir;
    if (oneStep >= 0 && oneStep < 8 && !board[oneStep][col]) {
      moves.push({ row: oneStep, col, capture: false });
      const twoStep = row + 2 * dir;
      if (row === startRow && !board[twoStep][col]) {
        moves.push({ row: twoStep, col, capture: false });
      }
    }
    for (const dc of [-1, 1]) {
      const nc = col + dc;
      const nr = row + dir;
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
      const target = board[nr][nc];
      if (target && isWhite(target) !== white) moves.push({ row: nr, col: nc, capture: true });
    }
    return moves;
  }
  if (type === "N") return stepMoves(board, row, col, white, KNIGHT_OFFSETS);
  if (type === "K") return stepMoves(board, row, col, white, KING_OFFSETS);
  if (type === "B") return slide(board, row, col, white, DIAG);
  if (type === "R") return slide(board, row, col, white, ORTH);
  if (type === "Q") return slide(board, row, col, white, [...DIAG, ...ORTH]);
  return [];
}

function moveNotation(piece, fromRow, fromCol, toRow, toCol, capture, promoted) {
  const type = pieceType(piece);
  const dest = algebraic(toRow, toCol);
  if (type === "P") {
    let n = capture ? `${FILES[fromCol]}x${dest}` : dest;
    if (promoted) n += "=D";
    return n;
  }
  const letter = PIECE_INFO[type].letter;
  return `${letter}${capture ? "x" : ""}${dest}`;
}

/* ============ Sub-componentes visuales ============ */

function Square({ dark, children, onClick, highlight, capture, selected, coordLabel, flash, correctReveal }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: dark ? COLORS.darkSquare : COLORS.lightSquare,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        outline: selected ? `3px solid ${COLORS.gold}` : "none",
        outlineOffset: "-3px",
        transition: "box-shadow 0.15s ease",
        boxShadow: flash === "bien"
          ? `inset 0 0 0 999px rgba(46,139,87,0.55)`
          : flash === "mal"
          ? `inset 0 0 0 999px rgba(224,87,76,0.55)`
          : correctReveal
          ? `inset 0 0 0 999px rgba(232,163,61,0.55)`
          : "none",
      }}
      className="aspect-square flex items-center justify-center select-none"
    >
      {children}
      {highlight && !capture && (
        <div
          style={{ background: COLORS.moveHint, opacity: 0.85 }}
          className="absolute rounded-full w-1/3 h-1/3"
        />
      )}
      {capture && (
        <div
          style={{ border: `4px solid ${COLORS.coral}`, opacity: 0.9 }}
          className="absolute inset-1 rounded-md"
        />
      )}
      {coordLabel && (
        <span
          style={{ color: dark ? COLORS.goldSoft : COLORS.teal, fontFamily: "Nunito" }}
          className="absolute bottom-0.5 right-1 text-[9px] sm:text-xs font-bold opacity-80"
        >
          {coordLabel}
        </span>
      )}
    </div>
  );
}

function Board({
  board,
  onSquareClick,
  selectedSquare,
  legalMoves,
  showCoords = true,
  pieceSize = "text-3xl sm:text-4xl",
  flashSquare,
  revealSquare,
}) {
  return (
    <div
      style={{ border: `6px solid ${COLORS.tealDark}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 24px rgba(22,78,83,0.25)" }}
      className="grid grid-cols-8 w-full max-w-md mx-auto"
    >
      {board.map((rowArr, row) =>
        rowArr.map((piece, col) => {
          const dark = (row + col) % 2 === 1;
          const move = legalMoves?.find((m) => m.row === row && m.col === col);
          const isFlash = flashSquare && flashSquare.row === row && flashSquare.col === col;
          const isReveal = revealSquare && revealSquare.row === row && revealSquare.col === col;
          return (
            <Square
              key={`${row}-${col}`}
              dark={dark}
              selected={selectedSquare && selectedSquare.row === row && selectedSquare.col === col}
              highlight={!!move}
              capture={move?.capture}
              coordLabel={showCoords ? algebraic(row, col) : null}
              onClick={onSquareClick ? () => onSquareClick(row, col) : undefined}
              flash={isFlash ? flashSquare.result : null}
              correctReveal={isReveal}
            >
              <span className={pieceSize} style={{ lineHeight: 1 }}>
                {pieceGlyph(piece)}
              </span>
            </Square>
          );
        })
      )}
    </div>
  );
}

function LevelTab({ active, onClick, label, emoji }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Baloo 2",
        background: active ? COLORS.teal : COLORS.paperCard,
        color: active ? "#FFFFFF" : COLORS.teal,
        border: `2px solid ${COLORS.teal}`,
      }}
      className="px-3 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors"
    >
      {emoji} {label}
    </button>
  );
}

/* ============ Nivel 1: coordenadas ============ */

function Level1() {
  const emptyBoard = useMemo(() => Array.from({ length: 8 }, () => Array(8).fill(null)), []);
  const [target, setTarget] = useState(() => ({ row: Math.floor(Math.random() * 8), col: Math.floor(Math.random() * 8) }));
  const [feedback, setFeedback] = useState(null);
  const [flashSquare, setFlashSquare] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reveal, setReveal] = useState(false);

  const newTarget = useCallback(() => {
    setTarget({ row: Math.floor(Math.random() * 8), col: Math.floor(Math.random() * 8) });
    setFeedback(null);
    setFlashSquare(null);
    setMisses(0);
    setReveal(false);
  }, []);

  const handleClick = (row, col) => {
    if (row === target.row && col === target.col) {
      setFeedback("bien");
      setFlashSquare({ row, col, result: "bien" });
      setScore((s) => s + 1);
      setTimeout(newTarget, 700);
    } else {
      setFeedback("mal");
      setFlashSquare({ row, col, result: "mal" });
      setMisses((m) => {
        const next = m + 1;
        if (next >= 2) setReveal(true);
        return next;
      });
      setTimeout(() => {
        setFlashSquare(null);
        setFeedback(null);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ fontFamily: "Baloo 2", color: COLORS.tealDark }} className="text-center">
        <p className="text-lg sm:text-xl font-bold">
          ¿Dónde está <span style={{ color: COLORS.coral }}>{algebraic(target.row, target.col)}</span>?
        </p>
        <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-sm mt-1">
          Tocá esa casilla en el tablero. Las letras van de a a h, los números de 1 a 8.
        </p>
      </div>
      <Board
        board={emptyBoard}
        onSquareClick={handleClick}
        flashSquare={flashSquare}
        revealSquare={reveal ? target : null}
      />
      <div className="flex items-center gap-3">
        <span
          style={{
            fontFamily: "Nunito",
            color: feedback === "bien" ? "#2E8B57" : feedback === "mal" ? COLORS.coral : COLORS.inkSoft,
          }}
          className="font-bold text-sm h-5"
        >
          {feedback === "bien"
            ? "¡Muy bien! 🎉"
            : feedback === "mal" && reveal
            ? "¡Mirá, ahí es! (la casilla dorada) 👉"
            : feedback === "mal"
            ? "Ahí no era, ¡probá de nuevo!"
            : "\u00A0"}
        </span>
      </div>
      <div style={{ fontFamily: "Baloo 2", color: COLORS.gold }} className="text-base font-extrabold">
        Puntos: {score}
      </div>
    </div>
  );
}

/* ============ Nivel 2: piezas ============ */

function Level2() {
  const order = ["P", "N", "B", "R", "Q", "K"];
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
      {order.map((type) => {
        const info = PIECE_INFO[type];
        const isOpen = expanded === type;
        return (
          <button
            key={type}
            onClick={() => setExpanded(isOpen ? null : type)}
            style={{
              background: COLORS.paperCard,
              border: `2px solid ${isOpen ? COLORS.teal : COLORS.goldSoft}`,
              textAlign: "center",
              gridColumn: isOpen ? "1 / -1" : undefined,
            }}
            className="rounded-2xl p-3 flex flex-col items-center shadow-sm transition-all"
          >
            <span className="text-4xl">{UNICODE["w" + type]}</span>
            <p style={{ fontFamily: "Baloo 2", color: COLORS.tealDark }} className="font-bold mt-1">
              {info.name}
            </p>
            <p style={{ fontFamily: "Nunito", color: COLORS.gold }} className="text-xs font-extrabold">
              Se anota: {info.letter === "" ? "(sin letra)" : info.letter}
            </p>
            <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-xs mt-1">
              {info.desc}
            </p>

            {isOpen && (
              <div
                style={{ borderTop: `2px dashed ${COLORS.goldSoft}` }}
                className="mt-3 pt-3 w-full flex flex-col gap-2 text-left"
              >
                <p style={{ fontFamily: "Nunito", color: COLORS.tealDark }} className="text-xs">
                  <span className="font-extrabold">Valor: </span>
                  {info.value}
                </p>
                <p style={{ fontFamily: "Nunito", color: COLORS.tealDark }} className="text-xs">
                  <span className="font-extrabold">Ejemplo de jugada: </span>
                  {info.example}
                </p>
                <p
                  style={{ fontFamily: "Nunito", color: COLORS.ink, background: "#F6D8A040" }}
                  className="text-xs rounded-lg p-2"
                >
                  💡 <span className="font-extrabold">Dato curioso: </span>
                  {info.funFact}
                </p>
              </div>
            )}
            <span style={{ fontFamily: "Nunito", color: COLORS.teal }} className="text-[10px] mt-2 font-bold">
              {isOpen ? "Tocá para cerrar ▲" : "Tocá para saber más ▼"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ Nivel 3: cómo se mueven ============ */

function Level3() {
  const order = ["P", "N", "B", "R", "Q", "K"];
  const [selected, setSelected] = useState("N");
  const origin = selected === "P" ? { row: 6, col: 3 } : { row: 3, col: 3 };
  const board = useMemo(() => {
    const b = Array.from({ length: 8 }, () => Array(8).fill(null));
    b[origin.row][origin.col] = selected;
    return b;
  }, [selected, origin.row, origin.col]);
  const moves = useMemo(() => generateMoves(board, origin.row, origin.col), [board, origin.row, origin.col]);
  const [destNote, setDestNote] = useState(null);

  const handleClick = (row, col) => {
    const m = moves.find((mv) => mv.row === row && mv.col === col);
    if (m) {
      setDestNote(moveNotation(selected, origin.row, origin.col, row, col, false, false));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {order.map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelected(type);
              setDestNote(null);
            }}
            style={{
              fontFamily: "Baloo 2",
              background: selected === type ? COLORS.gold : COLORS.paperCard,
              color: selected === type ? "#FFFFFF" : COLORS.tealDark,
              border: `2px solid ${COLORS.gold}`,
            }}
            className="px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
          >
            <span className="text-xl">{UNICODE["w" + type]}</span>
            {PIECE_INFO[type].name}
          </button>
        ))}
      </div>
      <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-sm text-center max-w-sm">
        Los círculos verdes muestran adónde puede ir el {PIECE_INFO[selected].name.toLowerCase()}. Tocá uno para ver
        cómo se escribe esa jugada.
      </p>
      <Board board={board} legalMoves={moves} onSquareClick={handleClick} />
      <div style={{ fontFamily: "Baloo 2", color: COLORS.tealDark, minHeight: 28 }} className="text-lg font-bold">
        {destNote ? (
          <>
            Esa jugada se escribe: <span style={{ color: COLORS.coral }}>{destNote}</span>
          </>
        ) : (
          "\u00A0"
        )}
      </div>
    </div>
  );
}

/* ============ Nivel 4: escribí tu carta ============ */

function Level4() {
  const [board, setBoard] = useState(createInitialBoard);
  const [turn, setTurn] = useState("w");
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState([]);
  const [log, setLog] = useState([]); // {number, white, black}
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setBoard(createInitialBoard());
    setTurn("w");
    setSelected(null);
    setMoves([]);
    setLog([]);
    setCopied(false);
  };

  const handleClick = (row, col) => {
    const piece = board[row][col];
    if (selected) {
      const m = moves.find((mv) => mv.row === row && mv.col === col);
      if (m) {
        const movingPiece = board[selected.row][selected.col];
        const type = pieceType(movingPiece);
        let promoted = false;
        const newBoard = cloneBoard(board);
        newBoard[selected.row][selected.col] = null;
        let finalPiece = movingPiece;
        if (type === "P" && (row === 0 || row === 7)) {
          finalPiece = turn === "w" ? "Q" : "q";
          promoted = true;
        }
        newBoard[row][col] = finalPiece;
        const notation = moveNotation(movingPiece, selected.row, selected.col, row, col, m.capture, promoted);

        setLog((prev) => {
          const copy = prev.slice();
          if (turn === "w") {
            copy.push({ number: copy.length + 1, white: notation, black: null });
          } else {
            copy[copy.length - 1] = { ...copy[copy.length - 1], black: notation };
          }
          return copy;
        });

        setBoard(newBoard);
        setTurn(turn === "w" ? "b" : "w");
        setSelected(null);
        setMoves([]);
        setCopied(false);
        return;
      }
      // clicking another own piece re-selects
      if (piece && isWhite(piece) === (turn === "w")) {
        setSelected({ row, col });
        setMoves(generateMoves(board, row, col));
        return;
      }
      setSelected(null);
      setMoves([]);
      return;
    }
    if (piece && isWhite(piece) === (turn === "w")) {
      setSelected({ row, col });
      setMoves(generateMoves(board, row, col));
    }
  };

  const cartaTexto = useMemo(() => {
    const lines = log.map((m) => `${m.number}. ${m.white}${m.black ? "  " + m.black : ""}`);
    return `Querida Paulina,\nAcá van mis jugadas:\n\n${lines.join("\n")}\n\n¡Espero tu respuesta!\nCariños, Celeste`;
  }, [log]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cartaTexto);
      setCopied(true);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start justify-center">
      <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
        <div style={{ fontFamily: "Baloo 2", color: COLORS.tealDark }} className="font-bold text-sm">
          Juegan las {turn === "w" ? "Blancas" : "Negras"} {turn === "w" ? "⚪" : "⚫"}
        </div>
        <Board board={board} onSquareClick={handleClick} selectedSquare={selected} legalMoves={moves} />
        <button
          onClick={reset}
          style={{ fontFamily: "Baloo 2", background: COLORS.coral, color: "#fff" }}
          className="px-4 py-1.5 rounded-full text-sm font-bold shadow"
        >
          Empezar de nuevo
        </button>
      </div>

      <div
        style={{
          fontFamily: "Caveat",
          background: COLORS.paperCard,
          border: `2px dashed ${COLORS.gold}`,
          color: COLORS.ink,
        }}
        className="rounded-2xl p-4 w-full lg:w-72 shadow-md"
      >
        <p style={{ fontFamily: "Baloo 2", color: COLORS.tealDark }} className="text-sm font-bold mb-2 not-italic">
          ✉️ Tu carta para Paulina
        </p>
        <pre
          style={{ fontFamily: "Caveat", fontSize: "1.15rem", whiteSpace: "pre-wrap", color: COLORS.ink }}
          className="min-h-[120px] leading-snug"
        >
          {log.length === 0 ? "Todavía no jugaste ninguna jugada..." : cartaTexto}
        </pre>
        {log.length > 0 && (
          <button
            onClick={copiar}
            style={{ fontFamily: "Nunito", background: COLORS.teal, color: "#fff" }}
            className="mt-2 px-3 py-1.5 rounded-full text-xs font-bold"
          >
            {copied ? "¡Copiada! ✅" : "Copiar carta"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============ Nivel 5: consejo ============ */

function LevelTip() {
  const [index, setIndex] = useState(0);
  const tip = TIPS[index];

  const go = (delta) => {
    setIndex((i) => (i + delta + TIPS.length) % TIPS.length);
  };

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-4">
      <div
        style={{ background: COLORS.paperCard, border: `2px solid ${COLORS.coral}`, minHeight: 220 }}
        className="rounded-2xl p-5 text-center shadow-md w-full flex flex-col items-center justify-center"
      >
        <span className="text-5xl">{tip.emoji}</span>
        <p style={{ fontFamily: "Baloo 2", color: COLORS.tealDark }} className="font-extrabold text-lg mt-2">
          {tip.titulo}
        </p>
        <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-sm mt-2">
          {tip.texto}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => go(-1)}
          style={{ fontFamily: "Baloo 2", background: COLORS.teal, color: "#fff" }}
          className="w-9 h-9 rounded-full font-bold text-lg shadow"
          aria-label="Consejo anterior"
        >
          ‹
        </button>
        <div className="flex gap-1.5">
          {TIPS.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              style={{
                background: i === index ? COLORS.gold : COLORS.goldSoft,
                cursor: "pointer",
              }}
              className="w-2.5 h-2.5 rounded-full inline-block"
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          style={{ fontFamily: "Baloo 2", background: COLORS.teal, color: "#fff" }}
          className="w-9 h-9 rounded-full font-bold text-lg shadow"
          aria-label="Siguiente consejo"
        >
          ›
        </button>
      </div>
      <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-xs">
        Consejo {index + 1} de {TIPS.length}
      </p>
    </div>
  );
}

/* ============ App principal ============ */

export default function App() {
  const [level, setLevel] = useState(1);

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
          Aprendé a nombrar las jugadas para escribirle a Paulina y Alejo
        </p>
      </header>

      <nav className="max-w-2xl mx-auto flex flex-wrap justify-center gap-2 mb-6">
        <LevelTab active={level === 1} onClick={() => setLevel(1)} emoji="🗺️" label="1. Ubicá casillas" />
        <LevelTab active={level === 2} onClick={() => setLevel(2)} emoji="♟️" label="2. Conocé piezas" />
        <LevelTab active={level === 3} onClick={() => setLevel(3)} emoji="🧭" label="3. Cómo se mueven" />
        <LevelTab active={level === 4} onClick={() => setLevel(4)} emoji="✉️" label="4. Escribí tu carta" />
        <LevelTab active={level === 5} onClick={() => setLevel(5)} emoji="👑" label="Consejos" />
      </nav>

      <main
        style={{ background: "rgba(255,255,255,0.5)", borderRadius: 24 }}
        className="max-w-3xl mx-auto p-4 sm:p-6"
      >
        {level === 1 && <Level1 />}
        {level === 2 && <Level2 />}
        {level === 3 && <Level3 />}
        {level === 4 && <Level4 />}
        {level === 5 && <LevelTip />}
      </main>

      <footer style={{ color: COLORS.inkSoft }} className="text-center text-xs mt-6">
        Notación en español · sin enroque ni captura al paso, para no complicar todavía 🙂
      </footer>
    </div>
  );
}
