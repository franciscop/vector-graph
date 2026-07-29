import graph from "../index.js";
import { describe, test, expect } from "bun:test";

// Helper: count occurrences of an SVG element in output
const count = (svg, tag) => (svg.match(new RegExp(`<${tag}\\b`, "g")) ?? []).length;

describe("drawPlot — eval/replaceAll bug", () => {
  // Bug: `fn.replaceAll("x", x)` also replaces "x" inside function names.
  // e.g. "Math.exp(x)".replaceAll("x", 1.5) → "Math.e1.5p(1.5)" → SyntaxError
  // The catch block swallowed the error silently, producing zero plot lines.
  test("Math.exp(x) produces line segments", () => {
    const svg = graph(
      `<vector-graph x="0,3" y="0,20" axis="false" grid="false">
        <plot fn="Math.exp(x)"></plot>
      </vector-graph>`
    );
    expect(count(svg, "line")).toBeGreaterThan(100);
  });

  // Same family: any fn containing "x" in a symbol name breaks, not just exp.
  test("x * Math.max(x, 0) produces line segments", () => {
    const svg = graph(
      `<vector-graph x="-3,3" y="-1,3" axis="false" grid="false">
        <plot fn="x * Math.max(x, 0)"></plot>
      </vector-graph>`
    );
    expect(count(svg, "line")).toBeGreaterThan(100);
  });
});

describe("drawPlot — loop bounds bug", () => {
  // Bug: loop ran `for (let x = opts.x[0]; x < opts.width; ...)` where opts.width=200
  // is pixel width, not the coordinate max. For x=[0,10] this iterated 4000 times
  // (coordinates 0 → 200) instead of 200 times (coordinates 0 → 10).
  test("generates ~200 segments for a 200px-wide x=[0,10] graph", () => {
    const svg = graph(
      `<vector-graph axis="false" grid="false">
        <plot fn="x"></plot>
      </vector-graph>`
    );
    // 200 sample points → 199 segments. A factor-of-20 overrun (~4000) would fail.
    const lines = count(svg, "line");
    expect(lines).toBeGreaterThan(150);
    expect(lines).toBeLessThan(300);
  });

  test("plot stays within coordinate bounds for a shifted range x=[-5,5]", () => {
    // Before fix: xUnit = x[1]/width = 5/200 = 0.025; loop x < 200 → iterates to coord 200
    // After fix:  xUnit = (x[1]-x[0])/width = 10/200 = 0.05; loop x < 5
    const svg = graph(
      `<vector-graph x="-5,5" y="-2,2" axis="false" grid="false">
        <plot fn="Math.sin(x)"></plot>
      </vector-graph>`
    );
    const lines = count(svg, "line");
    expect(lines).toBeGreaterThan(150);
    expect(lines).toBeLessThan(300);
  });
});

describe("drawPlot — return type bug", () => {
  // Bug: drawPlot returned an Array instead of a string. `svg.innerHTML += array`
  // coerces the array to a comma-joined string, inserting literal "," text nodes
  // between SVG elements.
  test("SVG output has no comma text nodes between elements", () => {
    const svg = graph(
      `<vector-graph axis="false" grid="false">
        <plot fn="x"></plot>
      </vector-graph>`
    );
    expect(svg).not.toMatch(/>\s*,\s*</);
  });
});

describe("drawUnits — yScale/xScale bug", () => {
  // Bug: y-axis label x-position used `x: -12 / yScale` instead of `x: -12 / xScale`.
  // On a non-square graph (different xScale and yScale) this places the label too
  // close to the axis or at the wrong pixel offset.
  //
  // Setup: width=100, height=500, x=[0,5], y=[0,5]
  //   xScale = 100/5 = 20,  yScale = 500/5 = 100
  //
  // Before fix: label x = -12/yScale = -0.12  → pixel xm = max(-29, 20×-0.12 - 10) = -12.4
  // After fix:  label x = -12/xScale = -0.6   → pixel xm = max(-29, 20×-0.6  - 10) = -22
  test("y-axis labels are offset by xScale on a tall narrow graph", () => {
    const svg = graph(
      `<vector-graph width="100" height="500" x="0,5" y="0,5" units grid="false" axis="false"></vector-graph>`
    );
    expect(svg).toContain('x="-22"');
  });
});
