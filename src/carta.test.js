import { describe, expect, it } from "vitest";
import { LARGO_MAXIMO_NOMBRE, extraerJugadas, limpiarNombre, recortarMientrasEscribe, textoCarta } from "./carta.js";

const log = [
  { number: 1, white: "e4", black: "e5" },
  { number: 2, white: "Cf3", black: null },
];

describe("limpiarNombre", () => {
  it("saca los espacios de los bordes", () => {
    expect(limpiarNombre("  Ana  ")).toBe("Ana");
  });

  it("convierte saltos de línea en espacios, para no romper la carta", () => {
    expect(limpiarNombre("Ana\nMaría")).toBe("Ana María");
    expect(limpiarNombre("Ana\r\n\tMaría")).toBe("Ana María");
  });

  it("junta los espacios repetidos", () => {
    expect(limpiarNombre("Ana     María")).toBe("Ana María");
  });

  it("corta los nombres larguísimos", () => {
    expect(limpiarNombre("A".repeat(200))).toHaveLength(LARGO_MAXIMO_NOMBRE);
  });

  it("lo que no es texto se vuelve vacío", () => {
    for (const basura of [null, undefined, 42, {}, []]) {
      expect(limpiarNombre(basura)).toBe("");
    }
  });
});

describe("recortarMientrasEscribe", () => {
  it("NO come el espacio recién tecleado, para poder escribir dos palabras", () => {
    expect(recortarMientrasEscribe("Ana ")).toBe("Ana ");
  });

  it("igual corta saltos de línea y largo", () => {
    expect(recortarMientrasEscribe("Ana\nMaría")).toBe("Ana María");
    expect(recortarMientrasEscribe("A".repeat(50))).toHaveLength(LARGO_MAXIMO_NOMBRE);
  });
});

describe("textoCarta", () => {
  it("usa los dos nombres cuando están", () => {
    const texto = textoCarta(log, { remitente: "Ana", destinataria: "Sofi" });
    expect(texto).toContain("¡Hola Sofi!");
    expect(texto).toContain("Cariños, Ana");
    expect(texto).toContain("1. e4  e5");
    expect(texto).toContain("2. Cf3");
  });

  it("sin nombres saluda de forma genérica en vez de dejar un hueco", () => {
    const texto = textoCarta(log);
    expect(texto).toContain("¡Hola!");
    expect(texto).toContain("Cariños");
    expect(texto).not.toContain("undefined");
    expect(texto).not.toContain("null");
  });

  it("con un solo nombre completa el que hay", () => {
    expect(textoCarta(log, { destinataria: "Sofi" })).toContain("¡Hola Sofi!");
    expect(textoCarta(log, { remitente: "Ana" })).toContain("Cariños, Ana");
  });

  it("limpia los nombres antes de escribirlos", () => {
    const texto = textoCarta(log, { remitente: "  Ana\nMaría ", destinataria: " Sofi " });
    expect(texto).toContain("¡Hola Sofi!");
    expect(texto).toContain("Cariños, Ana María");
    // Un salto de línea colado en el nombre partiría la firma en dos.
    expect(texto.split("\n").at(-1)).toBe("Cariños, Ana María");
  });

  it("una jugada sin respuesta de negras no deja espacios colgando", () => {
    expect(textoCarta([{ number: 1, white: "e4", black: null }])).toContain("1. e4\n");
  });

  it("sin jugadas no rompe", () => {
    expect(() => textoCarta([])).not.toThrow();
    expect(() => textoCarta(null)).not.toThrow();
  });

  it("textoCarta y extraerJugadas son inversas", () => {
    const texto = textoCarta(log, { remitente: "Ana", destinataria: "Sofi" });
    expect(extraerJugadas(texto)).toEqual(log);
  });
});

describe("extraerJugadas", () => {
  it("saca las jugadas de una carta entera, ignorando saludo y firma", () => {
    const texto = textoCarta(log, { remitente: "Ana", destinataria: "Sofi" });
    expect(extraerJugadas(texto)).toEqual(log);
  });

  it("también funciona si se pega sólo la lista de jugadas", () => {
    expect(extraerJugadas("1. e4  e5\n2. Cf3")).toEqual([
      { number: 1, white: "e4", black: "e5" },
      { number: 2, white: "Cf3", black: null },
    ]);
  });

  it("tolera espacios de más y líneas vacías entre jugadas", () => {
    expect(extraerJugadas("1.   e4    e5\n\n2.Cf3")).toEqual([
      { number: 1, white: "e4", black: "e5" },
      { number: 2, white: "Cf3", black: null },
    ]);
  });

  it("sin jugadas devuelve una lista vacía en vez de romper", () => {
    expect(extraerJugadas("¡Hola! ¿Cómo estás?")).toEqual([]);
    expect(extraerJugadas("")).toEqual([]);
    expect(extraerJugadas(null)).toEqual([]);
    expect(extraerJugadas(undefined)).toEqual([]);
  });
});
