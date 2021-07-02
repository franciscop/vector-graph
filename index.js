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

const drawUnits = ({ from = 0, to, axis, color, size }, opts) => {
  const { xScale, yScale, colors } = opts;
  if (!color) color = colors.dark;
  let units = "";
  for (let i = from; i < to; i += size) {
    if (axis === "x") {
      const x = from + i - opts.x[0];
      units += drawLine(
        { from: [x, 0], to: [x, -5 / yScale], width: 1.5, color },
        opts
      );
      units += drawLabel(
        { text: `${i}`, x, y: -12 / yScale, color, size: "tiny" },
        opts
      );
    } else {
      const y = from + i - opts.y[0];
      units += drawLine(
        { from: [0, y], to: [-5 / xScale, y], width: 1.5, color },
        opts
      );
      units += drawLabel(
        { text: `${i}`, x: -12 / yScale, y, color, size: "tiny" },
        opts
      );
    }
  }

  return units;
};

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

const sizes = { tiny: 8, small: 8, normal: 10, large: 12 };
const fontSizes = { tiny: 12, small: 12, normal: 16, large: 20 };
const strokeSizes = { tiny: 0, small: 1, normal: 1.75, large: 2 };

// Draws a text tag somewhere in the page, given in user coordinates
// <text text="hello world" x="2" y="3"></text>
const drawText = ({ text, x, y, color, size, width }, opts) => {
  const { height, xScale, yScale, colors, pad, ...rest } = opts;

  // Defaults, preferred inline since some are more complex
  if (!text) return "";
  if (!size) size = "normal";
  if (!width) width = ("m" + text).length * sizes[size];
  if (!color) color = colors.black;

  // Calculate where to draw it. There's a bound on the left since we don't
  // want labels to be cut off on the left side
  const xm = Math.max(-pad + 1 + width / 2, xScale * (x - rest.x[0]));
  const ym = height - yScale * (y - rest.y[0]) + 1;

  const font = `normal ${fontSizes[size]}px sans-serif`;
  const style = `dominant-baseline: middle; text-anchor: middle; font: ${font}`;
  return `
    <text x="${xm}" y="${ym}" width="${width}" fill="${color}" style="${style}">
      ${text}
    </text>
  `;
};

// Draws a Label (text withing a box) in the given in user coordinates
// <label text="hello world" x="2" y="3"></label>
const drawLabel = ({ text, x, y, size, width, height, color }, opts) => {
  const { xScale, yScale, colors, pad } = opts;

  // Defaults, preferred inline since some are more complex
  if (!text) return "";
  if (!size) size = "normal";
  if (!width) width = ("m" + text).length * sizes[size];
  if (!height) height = sizes[size] * 2.1;
  if (!color) color = colors.black;

  // Calculate where to draw it. There's a bound on the left since we don't
  // want labels to be cut off on the left side
  const xm = Math.max(-pad + 1, xScale * (x - opts.x[0]) - width / 2);
  const ym = opts.height - yScale * (y - opts.y[0]) - height / 2;

  return `
    <rect
      x="${xm}"
      y="${ym}"
      width="${width}"
      height="${height}"
      fill="${colors.light}"
      stroke="${color}"
      stroke-width="${strokeSizes[size]}"
      rx="5"
    />
    ${drawText({ text, x, y, color, size, width }, opts)}
  `;
};

const drawPoint = ({ x, y, label, color, axis }, opts) => {
  const { height, xScale, yScale, colors } = opts;

  if (!color) color = colors.black;

  const cx = (x - opts.x[0]) * xScale;
  const cy = height - (y - opts.y[0]) * yScale;

  return `
    <circle cx=${cx} cy=${cy} r="4" fill="${color}" />
    ${drawLabel({ text: label, color, x, y: y + 20 / yScale }, opts)}
    ${axis ? drawCoordinates({ x, y, color }, opts) : ""}
  `;
};

const drawLine = ({ to, from, label, color, width, dashed }, opts) => {
  const { height, x, y, xScale, yScale, colors } = opts;

  if (!from) from = [0, 0];
  if (!color) color = colors.black;
  if (!width) width = 1.75;
  if (dashed) dashed = "5,3";

  const x1 = xScale * (from[0] - x[0]);
  const y1 = height - yScale * (from[1] - y[0]);

  const x2 = (to[0] - x[0]) * xScale;
  const y2 = height - (to[1] - y[0]) * yScale;

  const labelX = (to[0] + from[0]) / 2;
  const labelY = (to[1] + from[1]) / 2;

  return `
    <line
      x1="${x1}"
      y1="${y1}"
      x2="${x2}"
      y2="${y2}"
      stroke="${color}"
      stroke-width="${width}"
      stroke-dasharray="${dashed}"
    />
    ${drawLabel({ text: label, color, x: labelX, y: labelY }, opts)}
  `;
};

const drawCircle = ({ x = 0, y = 0, radius, label, color, width }, opts) => {
  const { height, xScale, yScale, colors } = opts;

  if (!color) color = colors.black;
  if (!width) width = 2;

  const cx = (x - opts.x[0]) * xScale;
  const cy = height - (y - opts.y[0]) * yScale;

  return `
    <ellipse
      cx="${cx}"
      cy="${cy}"
      rx="${radius * xScale}"
      ry="${radius * yScale}"
      fill="none"
      stroke="${color}"
      stroke-width="${width}"
      path-length="1px"
      />
      ${label ? drawLabel({ text: label, x, y, color }, opts) : ""}
  `;
};

function toEuclidian(x, y, radius, rads) {
  return [x + radius * Math.cos(rads), y + radius * Math.sin(rads)];
}

function drawArc(x, y, r, from, to) {
  // Convert to radians in the right coordinates for the euclidian plane
  const fromRads = (-from * Math.PI) / 180;
  const toRads = (-to * Math.PI) / 180;
  const large = to - from <= 180 ? "0" : "1";

  const [xStart, yStart] = toEuclidian(x, y, r, fromRads);
  const [xEnd, yEnd] = toEuclidian(x, y, r, toRads);

  return `M ${xStart} ${yStart} A ${r} ${r} 0 ${large} 0 ${xEnd} ${yEnd}`;
}

// function drawArc(x, y, r, from, to) {
//   // Convert to radians in the right coordinates for the euclidian plane
//   const fromRads = (from * Math.PI) / 180;
//   const toRads = ((-to + from) * Math.PI) / 180;
//   const large = to-from <= 180 ? "0" : "1";
//
//   const [xStart, yStart] = toEuclidian(x, y, r, 0);
//   const [xEnd, yEnd] = toEuclidian(x, y, r, toRads);
//
//   return `M ${xStart} ${yStart} A ${r} ${r} ${fromRads} 0 0 ${xEnd} ${yEnd}`;
// }

const drawAngle = (
  { x = 0, y = 0, from, to, radius, label, color, size, dashed },
  opts
) => {
  const { height, xScale, yScale, colors } = opts;

  if (!from) from = 0;
  if (from > to) [to, from] = [from, to];
  from = (from + 360) % 360;
  to = (to + 360) % 360;
  if (!radius) radius = opts.x[1] / 3;
  if (!color) color = colors.black;
  if (!size) size = "small";
  if (dashed || typeof dashed === "undefined") dashed = "5,3";

  const labelAngle = ((from + to) * Math.PI) / 360;

  const toLarge = to >= 180;
  const fromLarge = from >= 180;

  // Adjust to and from to take into account the scales
  const toTan = Math.tan((to * Math.PI) / 180);
  to = (Math.atan2(toTan * yScale, xScale) * 180) / Math.PI;
  const fromTan = Math.tan((from * Math.PI) / 180);
  from = (Math.atan2(fromTan * yScale, xScale) * 180) / Math.PI;

  from = (from + 360) % 360;
  to = (to + 360) % 360;

  if (toLarge && to < 180) to += 180;
  if (fromLarge && from < 180) from += 180;
  if (!toLarge && to > 180) to -= 180;
  if (!fromLarge && from > 180) from -= 180;

  from = (from + 360) % 360;
  to = (to + 360) % 360;

  // console.log(from, to);

  const x1 = xScale * (x - opts.x[0]);
  const y1 = height - yScale * (y - opts.y[0]);

  // TODO: fix label positioning for whenever xScale !== yScale
  const xL = x + radius * Math.cos(labelAngle);
  const yL = y + radius * Math.sin(labelAngle);

  return `
    <path
      fill="none"
      stroke="${color}"
      stroke-width="1"
      stroke-dasharray="${dashed}"
      d="${drawArc(x1, y1, radius * xScale, from, to)}"
    />
    ${drawLabel({ text: label, x: xL, y: yL, size, color }, opts)}
  `;
};

// Draws a set of two lines going from the point "to" to the origin axis
const drawCoordinates = ({ x, y, color }, opts) => {
  const { xScale, yScale } = opts;
  const width = 1;
  const dashed = true;
  const size = "small";
  return [
    drawLine({ from: [x, 0], to: [x, y], width, dashed, color }, opts),
    drawLine({ from: [0, y], to: [x, y], width, dashed, color }, opts),
    drawLabel({ text: x, x, y: -12 / yScale, color, size }, opts),
    drawLabel({ text: y, x: -12 / xScale, y, color, size }, opts)
  ].join("");
};

const drawVector = ({ from, to, label, axis, color }, opts) => {
  const { height, x, y, xScale, yScale, colors } = opts;

  const id = globalId++;
  if (!from) from = [0, 0];
  if (!color) color = colors.black;

  const x1 = xScale * (from[0] - x[0]);
  const y1 = height - yScale * (from[1] - y[0]);

  const arrSize = 10;

  const toPix = [(to[0] - from[0]) * xScale, (to[1] - from[1]) * yScale];
  const mag = Math.sqrt(toPix[0] ** 2 + toPix[1] ** 2);
  const angle = Math.atan2(toPix[1], toPix[0]);

  const new_mag = mag - 2 * arrSize;

  const x2 = x1 + new_mag * Math.cos(angle);
  const y2 = y1 - new_mag * Math.sin(angle);

  const labelX = (to[0] + from[0]) / 2;
  const labelY = (to[1] + from[1]) / 2;

  return `
    <defs>
      <marker
        id="h-${id}"
        markerWidth="10"
        markerHeight="5"
        refY="2.5"
        orient="auto"
      >
        <polygon points="0 0, 10 2.5, 0 5" fill="${color}" />
      </marker>
    </defs>
    <line
      x1="${x1}"
      y1="${y1}"
      x2="${x2}"
      y2="${y2}"
      stroke="${color}"
      stroke-width="2"
      marker-end="url(#h-${id})"
    />
    ${drawLabel({ text: label, color, x: labelX, y: labelY }, opts)}
    ${axis ? drawCoordinates({ x: to[0], y: to[1], color }, opts) : ""}
  `;
};

const defaultOptions = {
  width: 200,
  height: 200,
  x: [0, 10],
  y: [0, 10],
  labels: ["x", "y"],
  grid: 1,
  dark: detectDarkmode(),
  pad: 24,
  axis: true
};

export default function graph(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let { width, height, x, y, labels, units, grid, dark, axis, pad } = {
    ...defaultOptions,
    ...parseOptions(doc.querySelector("vector-graph").attributes)
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
    `${-pad} ${-pad * 0.6} ${width + 1.6 * pad} ${height + 1.6 * pad}`
  );
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.style.background = colors.light;
  svg.style.borderRadius = "8px";

  const elements = [
    { type: "grid", color: colors.gray, fill: colors.light, size: grid },
    { type: "units", size: grid, from: x[0], to: x[1], axis: "x" },
    { type: "units", size: grid, from: y[0], to: y[1], axis: "y" },
    axis ? { type: "vector", color: colors.dark, to: [x[1], 0] } : null,
    axis ? { type: "vector", color: colors.dark, to: [0, y[1]] } : null,
    {
      type: "text",
      text: axis && labels?.[0],
      color: colors.dark,
      x: x[1],
      y: 12 / yScale
    },
    {
      type: "text",
      text: axis && labels?.[1],
      color: colors.dark,
      x: 12 / xScale,
      y: y[1]
    }
  ];
  elements.push(
    ...[...doc.querySelector("vector-graph").children].map(item => {
      const type = item.nodeName.toLowerCase();
      const attrs = parseOptions(item.attributes);
      return { type, ...attrs };
    })
  );

  // RENDER EACH OF THE CHILDREN
  const options = { width, height, x, y, xScale, yScale, colors, pad };

  elements.filter(Boolean).forEach(({ type, ...attrs }) => {
    // Special classes
    if (units && type === "units") {
      svg.innerHTML += drawUnits(attrs, options);
    }
    if (type === "grid") {
      svg.innerHTML += drawGrid(attrs, options);
    }

    if (type === "vector") {
      svg.innerHTML += drawVector(attrs, options);
    }
    if (type === "line") {
      svg.innerHTML += drawLine(attrs, options);
    }
    if (type === "circle") {
      svg.innerHTML += drawCircle(attrs, options);
    }
    if (type === "angle") {
      svg.innerHTML += drawAngle(attrs, options);
    }
    if (type === "point") {
      svg.innerHTML += drawPoint(attrs, options);
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

// Initialize the module. This attaches the whole graph() function to the
// custom element `<vector-graph>`, so that in the browser the constructore()
// will be called. This allows for <script> to be anywhere in the page; if it's
// before the <vector-graph> component, it's defined and called later
if (typeof HTMLElement !== "undefined") {
  class PlaneGraph extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = graph(this.outerHTML);
    }
  }

  // Attach the <PlaneGraph> class to all elements called <vector-graph>
  customElements.define("vector-graph", PlaneGraph);
}
