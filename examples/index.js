import { JSDOM } from "jsdom";
import { write } from "files";
import graph from "../index.js";

const dom = new JSDOM();
global.window = dom.window;
global.document = window.document;
global.DOMParser = window.DOMParser;

const get = (orig, key) => src => write(`./examples/${key}.svg`, graph(src));
const render = new Proxy({}, { get });

render.simple(`
  <plane-graph width="200" height="200" grid>
    <vector label="u⃗" to="8,4"></vector>
    <vector label="v⃗" to="4,8"></vector>
  </plane-graph>
`);

render.scale(`
  <plane-graph width="200" height="200" x="390" y="390" grid="100">
    <vector label="v⃗" to="300,320" axis />
  </plane-graph>
`);

render.complete(`
  <plane-graph width="400" height="400" x="4.9" y="4.9">
    <vector label="b⃗" color="blue" from="3,4" to="4,2" axis></vector>
    <vector label="a⃗" color="red" from="0,0" to="3,4" axis></vector>
    <vector label="c⃗" from="0,0" to="4,2"></vector>
    <label text="c⃗ = a⃗ + b⃗" x="1" y="3" width="100" large></label>
  </plane-graph>
`);

render.full(`
  <plane-graph width="400" height="400" x="-5,5" y="-5,5">
    <text text="Electric Field" x="-2.7" y="2.4" color="red"></text>
    <label text="Right Hand Rule" x="2.5" y="-4"></label>

    <vector color="red" from="-0.5,-1" to="0.5,-1"></vector>
    <vector color="red" from="0.5,1" to="-0.5,1"></vector>
    <vector color="red" from="1,-0.5" to="1,0.5"></vector>
    <vector color="red" from="-1,0.5" to="-1,-0.5"></vector>

    <vector color="red" from="-1,-2" to="1,-2"></vector>
    <vector color="red" from="1,2" to="-1,2"></vector>
    <vector color="red" from="2,-1" to="2,1"></vector>
    <vector color="red" from="-2,1" to="-2,-1"></vector>

    <vector color="red" from="-1.5,-3" to="1.5,-3"></vector>
    <vector color="red" from="1.5,3" to="-1.5,3"></vector>
    <vector color="red" from="3,-1.5" to="3,1.5"></vector>
    <vector color="red" from="-3,1.5" to="-3,-1.5"></vector>
  </plane-graph>
`);

render.dark(`
  <plane-graph width="200" height="200" dark>
    <vector label="u⃗" to="8,4"></vector>
    <vector label="v⃗" to="4,8"></vector>
  </plane-graph>
`);

render.darkcolor(`
  <plane-graph width="200" height="200" x="4.9" y="4.9" dark>
    <vector label="b⃗" color="#88f" from="3,4" to="4,2" axis></vector>
    <vector label="a⃗" color="#f88" from="0,0" to="3,4" axis></vector>
    <vector label="c⃗" from="0,0" to="4,2"></vector>
  </plane-graph>
`);
