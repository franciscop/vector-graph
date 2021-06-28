import { useState, createContext, useContext } from "react";

const Context = createContext({});

let globalId = 0;

export const Text = ({ x, y, color, small, large, children, ...props }) => {
  const { light, black, width, height, xScale, yScale, ...rest } = useContext(
    Context
  );
  const charSize = small ? 6 : large ? 12 : 10;
  const textWidth = ("" + children.length) * charSize + 10;
  const xm = xScale * (x - rest.x[0]);
  const ym = yScale * (y - rest.y[0]) - 1;
  color = color || black;
  return (
    <text
      x={xm}
      y={height - ym}
      width={textWidth}
      fill={color}
      style={{
        dominantBaseline: "middle",
        textAnchor: "middle",
        font: `normal ${small ? 12 : large ? 20 : 16}px sans-serif`,
        ...props.style
      }}
      {...props}
    >
      {children}
    </text>
  );
};

export const Label = ({ x, y, color, small, large, children, ...props }) => {
  const { light, black, width, height, xScale, yScale, ...rest } = useContext(
    Context
  );
  const size = small ? 8 : large ? 12 : 10;
  const textWidth = props.width || ("m" + children).length * size;
  const xm = xScale * (x - rest.x[0]);
  const ym = yScale * (y - rest.y[0]);
  color = color || black;
  const strokeWidth = small ? 1 : large ? 2 : 1.75;
  return (
    <>
      <rect
        x={xm - textWidth / 2}
        y={height - ym - size}
        width={textWidth}
        height={size * 2 + "px"}
        fill={light}
        stroke={color}
        strokeWidth={strokeWidth}
        rx="5"
        {...props}
      />
      <Text x={x} y={y} color={color} small={small} large={large}>
        {children}
      </Text>
    </>
  );
};

export const Vector = ({ from = [0, 0], to, cap, label, axis, ...props }) => {
  const { black, height, x, y, xScale, yScale } = useContext(Context);

  const [id] = useState(globalId++);

  const x1 = xScale * (from[0] - x[0]);
  const y1 = yScale * (from[1] - y[0]);

  const arrSize = 10;

  const toPix = [(to[0] - from[0]) * xScale, (to[1] - from[1]) * yScale];
  const mag = Math.sqrt(toPix[0] ** 2 + toPix[1] ** 2);
  const angle = Math.atan2(toPix[1], toPix[0]);

  const new_mag = mag - 2 * arrSize;

  const x2 = x1 + new_mag * Math.cos(angle);
  const y2 = y1 + new_mag * Math.sin(angle);

  const color = props.color || black;

  return (
    <>
      <marker
        id={`arrowhead-${id}`}
        markerWidth="10"
        markerHeight="5"
        refY="2.5"
        orient="auto"
      >
        <polygon points="0 0, 10 2.5, 0 5" fill={color} />
      </marker>
      <marker
        id={`arrowbutt-${id}`}
        markerWidth="4"
        markerHeight="4"
        refX="2"
        refY="2"
        orient="auto"
      >
        <circle cx="2" cy="2" r={cap ? 2 : 0.5} fill={color} />
      </marker>
      <line
        x1={x1}
        y1={height - y1}
        x2={x2}
        y2={height - y2}
        stroke={color}
        strokeWidth="2"
        markerEnd={`url(#arrowhead-${id})`}
        markerStart={`url(#arrowbutt-${id})`}
      />
      {label && (
        <Label
          color={color}
          x={(to[0] + from[0]) / 2}
          y={(to[1] + from[1]) / 2}
        >
          {label}
        </Label>
      )}
      {axis && (
        <>
          <Line from={[to[0], 0]} to={to} color={color} dashed />
          <Line from={[0, to[1]]} to={to} color={color} dashed />
          <Label x={to[0] + 0 / xScale} y={0 / yScale} small color={color}>
            {to[0]}
          </Label>
          <Label x={0 / xScale} y={to[1] + 0 / yScale} small color={color}>
            {to[1]}
          </Label>
        </>
      )}
    </>
  );
};

export const Line = ({ from = [0, 0], to, dashed, ...props }) => {
  const { black, height, x, y, xScale, yScale } = useContext(Context);

  const [id] = useState(globalId++);

  const x1 = xScale * (from[0] - x[0]);
  const y1 = yScale * (from[1] - y[0]);

  const x2 = (to[0] - x[0]) * xScale;
  const y2 = (to[1] - y[0]) * yScale;

  const color = props.color || black;

  return (
    <line
      x1={x1}
      y1={height - y1}
      x2={x2}
      y2={height - y2}
      stroke={color}
      strokeWidth="1"
      strokeDasharray={dashed ? "5,3" : null}
      markerEnd={`url(#arrowhead-${id})`}
      markerStart={`url(#arrowbutt-${id})`}
      {...props}
    />
  );
};

const Grid = ({ size, color, fill }) => {
  const { width, height, xScale, yScale } = useContext(Context);

  // Generate a unique ID for the style of this pattern, because
  // otherwise two different SVGs might conflict
  const id = `grid-${size}-${color}-${fill}-${width}-${height}-${xScale}-${yScale}`;

  const x = size * xScale;
  const y = size * yScale;
  const flipV = {
    transform: "scaleY(-1)",
    transformOrigin: `0 ${height / 2}px`
  };

  if (!size) return null;

  return (
    <>
      <defs>
        <pattern id={id} width={x} height={y} patternUnits="userSpaceOnUse">
          <path
            d={`M 0 0 L 0 ${y} ${x} ${y} ${x} 0 0 0`}
            fill={fill}
            stroke={color}
            stroke-width="0.5"
          />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} style={flipV} />
    </>
  );
};

const detectDarkmode = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export default function Graph({
  width,
  height,
  x = [0, 10],
  y = [0, 10],
  labels = ["x", "y"],
  grid = 1,
  darkMode = detectDarkmode(),
  padding = 20,
  children
}) {
  // Fix some defaults and shorthands
  if (typeof x === "number") x = [0, x];
  if (typeof y === "number") y = [0, y];
  if (grid === true) grid = 1;
  const light = darkMode ? "#000" : "#fff";
  const gray = darkMode ? "#666" : "#ccc";
  const dark = darkMode ? "#aaa" : "#aaa";
  const black = darkMode ? "#fff" : "#000";

  // Define the axis scales, which is useful all across the board
  const xScale = width / (x[1] - x[0]);
  const yScale = height / (y[1] - y[0]);

  // Give the SVG some padding for the axis and whatnot. Since we do it with
  // the viewBox, we don't need to worry about modifying the values according
  // to this since it's transparent (similar to a transform())
  const gap = padding;
  const viewBox = `-${gap} -${gap} ${width + gap * 2} ${height + gap * 2}`;

  return (
    <svg width={width} height={height} viewBox={viewBox}>
      {/* Send the props straight into the context */}
      <Context.Provider
        value={{
          x,
          y,
          width,
          height,
          xScale,
          yScale,
          light,
          gray,
          dark,
          black
        }}
      >
        {/* The backgroung grid */}
        <Grid color={gray} fill={light} size={grid} />

        {/* The Axis XY */}
        <Vector label={labels?.[0]} color={dark} to={[x[1], 0]} cap />
        <Vector label={labels?.[1]} color={dark} to={[0, y[1]]} cap />

        {/* User Components */}
        {children}
      </Context.Provider>
    </svg>
  );
}
