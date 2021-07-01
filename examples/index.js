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
  <vector-graph width="200" height="200" units>
    <vector label="vector" to="8,4" axis></vector>
    <line label="line" from="1,8" to="6,5"></line>
    <point label="point" x="7" y="7"></point>
  </vector-graph>
`);

render.scale(`
  <vector-graph width="200" height="200" x="3" y="3" axis="false">
    <line from="0,0" to="3,1"></line>
    <line from="3,1" to="1,3"></line>
    <line from="0,0" to="1,3"></line>
    <angle label="α" x="0" y="0" from="71.6" to="18.4" dashed></angle>
    <angle label="β" x="1" y="3" from="251.6" to="315" dashed></angle>
    <angle label="γ" x="3" y="1" from="135" to="198.4" dashed></angle>
  </vector-graph>
`);

render.complete(`
  <vector-graph width="200" height="200" x="4.9" y="4.9">
    <vector label="b" color="blue" from="3,4" to="4,2" axis></vector>
    <vector label="a" color="red" from="0,0" to="3,4" axis></vector>
    <vector label="c" from="0,0" to="4,2"></vector>
  </vector-graph>
`);

render.full(`
  <vector-graph width="400" height="400" x="-5,5" y="-5,5">
    <point x="0" y="0"></point>

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
  </vector-graph>
`);

render.dark(`
  <vector-graph width="200" height="200" dark>
    <vector label="u" to="8,4"></vector>
    <vector label="v" to="4,8"></vector>
  </vector-graph>
`);

render.darkcolor(`
  <vector-graph width="200" height="200" x="4.9" y="4.9" dark>
    <vector label="b" color="#88f" from="3,4" to="4,2" axis></vector>
    <vector label="a" color="#f88" from="0,0" to="3,4" axis></vector>
    <vector label="c" from="0,0" to="4,2"></vector>
  </vector-graph>
`);
