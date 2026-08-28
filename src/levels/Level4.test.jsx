// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyMove, createEmptyBoard, createInitialBoard } from "../chess/engine.js";
import { guardarPartida } from "../storage.js";
import Level4 from "./Level4.jsx";

const nombres = { remitente: "", destinataria: "" };
const sinCambiarNombres = () => {};

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
