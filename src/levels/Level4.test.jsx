// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LARGO_MAXIMO_NOMBRE } from "../carta.js";
import { applyMove, createEmptyBoard, createInitialBoard, initialCastlingRights } from "../chess/engine.js";
import { guardarPartida } from "../storage.js";
import Level4 from "./Level4.jsx";

const nombres = { remitente: "", destinataria: "" };
const sinCambiarNombres = () => {};

/** Los tests de más abajo tocan tests reales de tipeo: hace falta que el input sea controlado de verdad. */
function Level4Controlado() {
  const [nombres, setNombres] = useState({ remitente: "", destinataria: "" });
  return <Level4 nombres={nombres} onCambiarNombres={setNombres} />;
}

/** Clickea una casilla por su coordenada (el label que ya se ve en el tablero). */
const clickCasilla = (casilla) => fireEvent.click(screen.getByText(casilla));

/** Enfoca una casilla por su coordenada, como haría Tab, sin clickearla. */
const enfocarCasilla = (casilla) => screen.getByText(casilla).closest("button").focus();

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("Level4 — jugar, deshacer, empezar de nuevo", () => {
  it("arranca en la posición inicial, con las blancas para jugar", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    expect(screen.getByText(/Juegan las Blancas/)).toBeInTheDocument();
    expect(screen.getByText("Todavía no jugaste ninguna jugada...")).toBeInTheDocument();
  });

  it("jugar 1.e4 anota la jugada y le pasa el turno a las negras", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("e2");
    clickCasilla("e4");

    expect(screen.getByText(/Juegan las Negras/)).toBeInTheDocument();
    expect(screen.getByText(/1\. e4/)).toBeInTheDocument();
  });

  it("las casillas son <button>: se pueden tabular y jugar con Enter, igual que con clic", async () => {
    const user = userEvent.setup();
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);

    expect(screen.getByText("e2").closest("button").tagName).toBe("BUTTON");

    enfocarCasilla("e2");
    await user.keyboard("{Enter}");
    enfocarCasilla("e4");
    await user.keyboard("{Enter}");

    expect(screen.getByText(/Juegan las Negras/)).toBeInTheDocument();
    expect(screen.getByText(/1\. e4/)).toBeInTheDocument();
  });

  it("Espacio activa una casilla enfocada igual que Enter", async () => {
    const user = userEvent.setup();
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);

    enfocarCasilla("e2");
    await user.keyboard(" ");
    enfocarCasilla("e4");
    await user.keyboard(" ");

    expect(screen.getByText(/Juegan las Negras/)).toBeInTheDocument();
    expect(screen.getByText(/1\. e4/)).toBeInTheDocument();
  });

  it("cada casilla anuncia su coordenada y contenido para lectores de pantalla", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);

    expect(screen.getByRole("button", { name: "e2, Peón blanco" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "e8, Rey negro" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "e4, vacía" })).toBeInTheDocument();
  });

  it("deshacer vuelve a la posición anterior", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("e2");
    clickCasilla("e4");
    expect(screen.getByText(/Juegan las Negras/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Deshacer jugada/ }));

    expect(screen.getByText(/Juegan las Blancas/)).toBeInTheDocument();
    expect(screen.getByText("Todavía no jugaste ninguna jugada...")).toBeInTheDocument();
  });

  it("empezar de nuevo, tras confirmar, borra la partida", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("e2");
    clickCasilla("e4");

    fireEvent.click(screen.getByRole("button", { name: "Empezar de nuevo" }));
    expect(screen.getByText("¿Seguro? Se borra la partida")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sí, borrar" }));

    expect(screen.getByText(/Juegan las Blancas/)).toBeInTheDocument();
    expect(screen.getByText("Todavía no jugaste ninguna jugada...")).toBeInTheDocument();
  });

  it("empezar de nuevo cancelado ('No') no toca la partida", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("e2");
    clickCasilla("e4");

    fireEvent.click(screen.getByRole("button", { name: "Empezar de nuevo" }));
    fireEvent.click(screen.getByRole("button", { name: "No" }));

    expect(screen.getByText(/Juegan las Negras/)).toBeInTheDocument();
    expect(screen.getByText(/1\. e4/)).toBeInTheDocument();
  });
});

describe("Level4 — se recupera de localStorage al montar", () => {
  it("si hay una partida guardada, arranca desde ahí y no desde el inicio", () => {
    // 1.e4, con las negras para jugar: mismas coordenadas que usa chess/engine.js
    // (fila 0 = rango 8), e2 -> (6,4), e4 -> (4,4).
    const inicial = createInitialBoard();
    const { board: despuesDeE4 } = applyMove(inicial, 6, 4, 4, 4);
    guardarPartida({
      board: despuesDeE4,
      turn: "b",
      log: [{ number: 1, white: "e4", black: null }],
      previous: { board: inicial, turn: "w", log: [] },
    });

    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);

    expect(screen.getByText(/Juegan las Negras/)).toBeInTheDocument();
    expect(screen.getByText(/1\. e4/)).toBeInTheDocument();
  });
});

describe("Level4 — turno y jaque anunciados por voz (aria-live)", () => {
  it("el turno vive en una región aria-live, para que un lector de pantalla avise cuando cambia", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    const estado = screen.getByRole("status");
    expect(estado).toHaveTextContent("Juegan las Blancas");

    clickCasilla("e2");
    clickCasilla("e4");

    expect(estado).toHaveTextContent("Juegan las Negras");
  });

  it("el jaque se anuncia en la misma región, sin depender de mirar el tablero", () => {
    // Torre blanca en e1 haciendo jaque al rey negro en e8 por la columna e:
    // no hace falta una partida legal completa, sólo una posición en jaque.
    const boardEnJaque = createEmptyBoard();
    boardEnJaque[0][4] = "k";
    boardEnJaque[7][4] = "R";
    guardarPartida({ board: boardEnJaque, turn: "b", log: [], previous: null });

    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);

    const estado = screen.getByRole("status");
    expect(estado).toHaveTextContent("Juegan las Negras");
    expect(estado).toHaveTextContent("¡Jaque!");
  });
});

describe("Level4 — copiar la carta cuando falla el portapapeles", () => {
  afterEach(() => {
    delete navigator.clipboard;
  });

  it("avisa y deja el texto seleccionado en vez de fallar en silencio", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("sin permiso")) },
      configurable: true,
    });

    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("e2");
    clickCasilla("e4");

    fireEvent.click(screen.getByRole("button", { name: "Copiar carta" }));

    expect(await screen.findByText(/No se pudo copiar sola/)).toBeInTheDocument();
  });
});

describe("Level4 — límite de largo del nombre", () => {
  it("no deja escribir más de LARGO_MAXIMO_NOMBRE caracteres", async () => {
    const user = userEvent.setup();
    render(<Level4Controlado />);

    const input = screen.getByPlaceholderText("Su nombre");
    await user.type(input, "Maria Guadalupe Esperanza de los Angeles");

    expect(input.value.length).toBe(LARGO_MAXIMO_NOMBRE);
    expect(input).toHaveAttribute("maxLength", String(LARGO_MAXIMO_NOMBRE));
  });

  it("muestra un contador sólo cuando el nombre se acerca al límite", async () => {
    const user = userEvent.setup();
    render(<Level4Controlado />);

    const input = screen.getByPlaceholderText("Su nombre");
    await user.type(input, "Ana");
    expect(screen.queryByText(/\/24/)).not.toBeInTheDocument();

    await user.type(input, " Guadalupe Esperanza");
    expect(screen.getByText(`${input.value.length}/${LARGO_MAXIMO_NOMBRE}`)).toBeInTheDocument();
  });
});

describe("Level4 — enroque", () => {
  it("clickear el rey y la casilla del enroque corto lo juega, con la torre incluida", () => {
    const board = createEmptyBoard();
    board[7][4] = "K"; // e1
    board[7][7] = "R"; // h1
    board[0][4] = "k"; // e8, para que haya un rey rival y no rompa isInCheck
    guardarPartida({ board, turn: "w", log: [], previous: null, castling: initialCastlingRights(), enPassant: null });

    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("e1");
    clickCasilla("g1");

    expect(screen.getByRole("button", { name: "g1, Rey blanco" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "f1, Torre blanca" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "e1, vacía" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "h1, vacía" })).toBeInTheDocument();
    expect(screen.getByText(/1\. O-O/)).toBeInTheDocument();
  });

  it("deshacer el enroque devuelve el derecho: se puede volver a enrocar", () => {
    const board = createEmptyBoard();
    board[7][4] = "K";
    board[7][7] = "R";
    board[0][4] = "k";
    guardarPartida({ board, turn: "w", log: [], previous: null, castling: initialCastlingRights(), enPassant: null });

    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("e1");
    clickCasilla("g1");
    fireEvent.click(screen.getByRole("button", { name: /Deshacer jugada/ }));

    expect(screen.getByRole("button", { name: "e1, Rey blanco" })).toBeInTheDocument();
    expect(screen.getByText("Todavía no jugaste ninguna jugada...")).toBeInTheDocument();

    // Si el derecho no se hubiera restaurado, esta segunda vuelta no ofrecería el enroque.
    clickCasilla("e1");
    clickCasilla("g1");
    expect(screen.getByRole("button", { name: "g1, Rey blanco" })).toBeInTheDocument();
  });

  it("pegar una carta que enroca la reconstruye bien", () => {
    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    const textarea = screen.getByPlaceholderText(/1\. e4/);
    fireEvent.change(textarea, { target: { value: "1. e4 e5\n2. Cf3 Cc6\n3. Ac4 Ac5\n4. O-O" } });
    fireEvent.click(screen.getByRole("button", { name: "Subir jugadas" }));

    expect(screen.getByRole("button", { name: "g1, Rey blanco" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "f1, Torre blanca" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "c4, Alfil blanco" })).toBeInTheDocument();
  });
});

describe("Level4 — captura al paso", () => {
  it("un peón come al paso justo después del avance de dos casillas rival", () => {
    const board = createEmptyBoard();
    board[3][4] = "P"; // e5
    board[1][3] = "p"; // d7
    board[7][4] = "K";
    board[0][4] = "k";
    guardarPartida({ board, turn: "b", log: [], previous: null, castling: initialCastlingRights(), enPassant: null });

    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("d7");
    clickCasilla("d5"); // avance de dos casillas: deja el objetivo de captura al paso
    clickCasilla("e5"); // selecciona el peón blanco
    clickCasilla("d6"); // captura al paso

    expect(screen.getByRole("button", { name: "d6, Peón blanco" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "d5, vacía" })).toBeInTheDocument(); // el peón comido, sacado
    expect(screen.getByText(/exd6/)).toBeInTheDocument();
  });

  it("sin capturar de inmediato, la oportunidad se pierde (dura una sola jugada)", () => {
    const board = createEmptyBoard();
    board[3][4] = "P"; // e5
    board[1][3] = "p"; // d7
    board[7][4] = "K";
    board[7][0] = "R"; // torre para tener una jugada neutral que hacer
    board[0][4] = "k";
    guardarPartida({ board, turn: "b", log: [], previous: null, castling: initialCastlingRights(), enPassant: null });

    render(<Level4 nombres={nombres} onCambiarNombres={sinCambiarNombres} />);
    clickCasilla("d7");
    clickCasilla("d5"); // avance de dos casillas
    clickCasilla("a1");
    clickCasilla("a2"); // una jugada cualquiera, en vez de capturar al paso

    // Un turno después, d6 ya no es una jugada legal para el peón de e5:
    // clickearlo no debería mover nada.
    clickCasilla("e5");
    clickCasilla("d6");
    expect(screen.getByRole("button", { name: "e5, Peón blanco" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "d6, vacía" })).toBeInTheDocument();
  });
});
