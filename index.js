const detectDarkmode = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const parseOptions = attrs =>
  [...attrs].reduce((props, { name, nodeValue }) => {
    let value = nodeValue;
    if (/^[\-0-9\.]+$/.test(value)) value = +value;
    if (/^[\-0-9\.]+\,\s*[\-0-9\.]+$/.test(value))
      value = value.split(",").map(one => +one);
    if (value === "") value = true;
    if (value === "true") value = true;
    if (value === "false") value = false;
    return {
      ...props,
      [name]: value
    };
  }, {});

const drawGrid = ({ size, color, fill }, opts) => {
  const { width, height, xScale, yScale } = opts;

  // Generate a unique ID for the style of this pattern, because
  // otherwise two different SVGs might conflict
  const id = `grid-${size}-${color}-${fill}-${width}-${height}-${xScale}-${yScale}`;

  const x = size * xScale;
  const y = size * yScale;
  const flipV = `
    transform: scaleY(-1);
    transform-origin: 0 ${height / 2}px;
  `;

  if (!size) return "";

  return `
    <defs>
      <pattern id="${id}" width="${x}" height="${y}" patternUnits="userSpaceOnUse">
        <path
          d="${`M 0 0 L 0 ${y} ${x} ${y} ${x} 0 0 0`}"
          fill="${fill}"
          stroke="${color}"
          stroke-width="0.5"
        />
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="${`url(#${id})`}" style="${flipV}" />
  `;
};

let globalId = 0;

const drawText = ({ x, y, color, small, large, text, ...props }, opts) => {
  const { height, xScale, yScale, colors, ...rest } = opts;
  const charSize = small ? 6 : large ? 12 : 10;
  const width = ("" + text.length) * charSize + 10;
  const xm = xScale * (x - rest.x[0]);
  const ym = height - yScale * (y - rest.y[0]) + 1;
  color = color || colors.black;
  const font = `normal ${small ? 12 : large ? 20 : 16}px sans-serif`;
  const style = `dominant-baseline: middle; text-anchor: middle; font: ${font}`;
  return `
    <text x="${xm}" y="${ym}" width="${width}" fill="${color}" style="${style}">
      ${text}
    </text>
  `;
};

const drawLabel = ({ x, y, color, small, large, text, ...props }, opts) => {
  const { width, height, xScale, yScale, colors, ...rest } = opts;
  const size = small ? 8 : large ? 12 : 10;
  const textWidth = props.width || ("m" + text).length * size;
  const xm = xScale * (x - rest.x[0]);
  const ym = yScale * (y - rest.y[0]);
  color = color || colors.black;
  const strokeWidth = small ? 1 : large ? 2 : 1.75;
  return `
    <rect
      x="${xm - textWidth / 2}"
      y="${height - ym - size}"
      width="${textWidth}"
      height="${size * 2 + "px"}"
      fill="${colors.light}"
      stroke="${color}"
      stroke-width="${strokeWidth}"
      rx="5"
    />
    ${drawText({ text, x, y, color, small, large }, opts)}
  `;
};

const drawLine = ({ from = [0, 0], to, color, dashed }, opts) => {
  const { black, height, x, y, xScale, yScale, colors } = opts;
  if (!color) color = colors.black;

  const x1 = xScale * (from[0] - x[0]);
  const y1 = yScale * (from[1] - y[0]);

  const x2 = (to[0] - x[0]) * xScale;
  const y2 = (to[1] - y[0]) * yScale;

  return `
    <line
      x1="${x1}"
      y1="${height - y1}"
      x2="${x2}"
      y2="${height - y2}"
      stroke="${color}"
      stroke-width="1"
      stroke-dasharray="${dashed ? "5,3" : null}"
    />
  `;
};

const drawVector = (
  { from = [0, 0], to, cap, label, axis, ...props },
  opts
) => {
  const { height, x, y, xScale, yScale, colors } = opts;

  const id = globalId++;

  const x1 = xScale * (from[0] - x[0]);
  const y1 = yScale * (from[1] - y[0]);

  const arrSize = 10;

  const toPix = [(to[0] - from[0]) * xScale, (to[1] - from[1]) * yScale];
  const mag = Math.sqrt(toPix[0] ** 2 + toPix[1] ** 2);
  const angle = Math.atan2(toPix[1], toPix[0]);

  const new_mag = mag - 2 * arrSize;

  const x2 = x1 + new_mag * Math.cos(angle);
  const y2 = y1 + new_mag * Math.sin(angle);

  const color = props.color || colors.black;

  let labelText = "";
  if (label) {
    const x = (to[0] + from[0]) / 2;
    const y = (to[1] + from[1]) / 2;
    labelText = drawLabel({ text: label, color, x, y }, opts);
  }

  let axisText = "";
  if (axis) {
    const dashed = true;
    const small = true;
    axisText = [
      drawLine({ from: [to[0], 0], to, dashed, color }, opts),
      drawLine({ from: [0, to[1]], to, dashed, color }, opts),
      drawLabel({ text: to[0], x: to[0], y: 0, color, small }, opts),
      drawLabel({ text: to[1], x: 0, y: to[1], color, small }, opts)
    ].join("");
  }

  return `
    <defs>
      <marker
        id="arrowhead-${id}"
        markerWidth="10"
        markerHeight="5"
        refY="2.5"
        orient="auto"
      >
        <polygon points="0 0, 10 2.5, 0 5" fill="${color}" />
      </marker>
      <marker
        id="arrowbutt-${id}"
        markerWidth="4"
        markerHeight="4"
        refX="2"
        refY="2"
        orient="auto"
      >
        <circle cx="2" cy="2" r="${cap ? 2 : 0.5}" fill="${color}" />
      </marker>
    </defs>
    <line
      x1="${x1}"
      y1="${height - y1}"
      x2="${x2}"
      y2="${height - y2}"
      stroke="${color}"
      stroke-width="2"
      marker-start="url(#arrowbutt-${id})"
      marker-end="url(#arrowhead-${id})"
    />
    ${labelText}
    ${axisText}
  `;
};

const defaultOptions = {
  width: 600,
  height: 400,
  x: [0, 10],
  y: [0, 10],
  labels: ["x", "y"],
  grid: 1,
  dark: detectDarkmode(),
  pad: 20
};

if (typeof HTMLElement !== "undefined") {
  class SimpleGraph extends HTMLElement {
    constructor() {
      // Always call super first in constructor
      super();

      this.attachShadow({ mode: "open" });

      this.shadowRoot.innerHTML = graph(this.outerHTML);
    }
  }

  customElements.define("plane-graph", SimpleGraph);
}

export default function graph(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let { width, height, x, y, labels, grid, dark, pad } = {
    ...defaultOptions,
    ...parseOptions(doc.querySelector("plane-graph").attributes)
  };
  if (typeof x === "number") x = [0, x];
  if (typeof y === "number") y = [0, y];
  if (grid === true) grid = 1;

  // Define the axis scales, which is useful all across the board
  const xScale = width / (x[1] - x[0]);
  const yScale = height / (y[1] - y[0]);

  const colors = {
    light: dark ? "#000" : "#fff",
    gray: dark ? "#666" : "#ccc",
    dark: dark ? "#aaa" : "#aaa",
    black: dark ? "#fff" : "#000"
  };

  // Draw the SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute(
    "viewBox",
    `${-pad} ${-pad} ${width + 2 * pad} ${height + 2 * pad}`
  );
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const elements = [
    { type: "grid", color: colors.gray, fill: colors.light, size: grid },
    { type: "vector", label: labels?.[0], color: colors.dark, to: [x[1], 0] },
    { type: "vector", label: labels?.[1], color: colors.dark, to: [0, y[1]] }
  ];
  elements.push(
    ...[...doc.querySelector("plane-graph").children].map(item => {
      const type = item.nodeName.toLowerCase();
      const attrs = parseOptions(item.attributes);
      return { type, ...attrs };
    })
  );

  // RENDER EACH OF THE CHILDREN
  const options = { width, height, x, y, xScale, yScale, colors };

  elements.forEach(({ type, ...attrs }) => {
    if (type === "grid") {
      svg.innerHTML += drawGrid(attrs, options);
    }
    if (type === "vector") {
      svg.innerHTML += drawVector(attrs, options);
    }
    if (type === "label") {
      svg.innerHTML += drawLabel(attrs, options);
    }
    if (type === "text") {
      svg.innerHTML += drawText(attrs, options);
    }
  });

  return svg.outerHTML;
}
