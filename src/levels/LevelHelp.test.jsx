// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AYUDA } from "../content/ayuda.js";
import LevelHelp from "./LevelHelp.jsx";

afterEach(() => {
  cleanup();
});

describe("LevelHelp — explicación de cada sección", () => {
  it("muestra el título y el texto de las 5 secciones", () => {
    render(<LevelHelp />);
    for (const item of AYUDA) {
      expect(screen.getByText(item.titulo)).toBeInTheDocument();
      expect(screen.getByText(item.texto)).toBeInTheDocument();
    }
  });
});
