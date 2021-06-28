# Plane Graph

Render simple euclidian plane graphics in SVG:

```html
<plane-graph width="200" height="200" grid>
  <vector label="u" to="8,4"></vector>
  <vector label="v" to="4,8"></vector>
</plane-graph>

<plane-graph width="200" height="200" x="390" y="390" grid="100">
  <vector label="v" to="300,320" axis />
</plane-graph>
```

<table>
  <tr>
    <td>
      <img width="300px" src="./examples/simple.svg" />
    </td>
    <td>
      <img width="300px" src="./examples/scale.svg" />
    </td>
    <td>
      <img width="300px" src="./examples/complete.svg" />
    </td>
  </tr>
</table>
