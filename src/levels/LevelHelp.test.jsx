// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AYUDA } from "../content/ayuda.js";
import LevelHelp from "./LevelHelp.jsx";

afterEach(() => {
  cleanup();
});

describe("LevelHelp — explicación de cada sección", () => {
  it("muestra el título y el texto de las 5 secciones", () => {
    render(<LevelHelp onIrANivel={() => {}} />);
    for (const item of AYUDA) {
      expect(screen.getByText(item.titulo)).toBeInTheDocument();
      expect(screen.getByText(item.texto)).toBeInTheDocument();
    }
  });

  it("tocar una tarjeta llama a onIrANivel con el número de esa sección", async () => {
    const user = userEvent.setup();
    const onIrANivel = vi.fn();
    render(<LevelHelp onIrANivel={onIrANivel} />);

    await user.click(screen.getByRole("button", { name: /Ir a 3\. Ubicá casillas/ }));

    expect(onIrANivel).toHaveBeenCalledWith(3);
  });
});
