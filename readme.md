# Plane Graph

Generate beautiful euclidian graphs with HTML:

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

```html
<plane-graph width="200" height="200">
  <point label="point" x="7" y="7"></point>
  <line label="line" from="0,0" to="4,8"></line>
  <vector label="vector" to="8,4"></vector>
</plane-graph>

<plane-graph width="200" height="200" x="3.9" y="3.9" units>
  <vector label="v" to="3,3.2" axis></vector>
</plane-graph>

<plane-graph width="200" height="200" x="4.9" y="4.9" units>
  <vector label="b" color="blue" from="3,4" to="4,2" axis></vector>
  <vector label="a" color="red" from="0,0" to="3,4" axis></vector>
  <vector label="c" from="0,0" to="4,2"></vector>
</plane-graph>
```

## Getting started

To use this library as usual you'll need three things. First, import it from a CDN; put this line anywhere in your HTML:

```
<script src="https://cdn.jsdelivr.net/npm/plane-graph"></script>
```

Now let's draw a graph anywhere within your HTML:

```html
<plane-graph width="200" height="200" grid>
  <vector label="u" to="8,4"></vector>
  <vector label="v" to="4,8"></vector>
</plane-graph>
```

Finally, if this is going to be included in a commercial or for-profit project make sure to buy a license:

\$9 BUY A LICENSE

## Documentation

### <plane-graph>

### <vector>

### <line>

### <point>

### <label>

### <text>

## Examples
