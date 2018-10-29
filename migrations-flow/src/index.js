const d3 = require('d3')
// const s = require('d3-sankey')
window.d3 = d3
require('./sankey.js')

function dataToGraph(data) {
  const cols = Object.keys(data)
  const rows = Object.keys(data[Object.keys(data)[0]])
  const links = []
  const nodes = cols
    .map(col => 'new ' + col)
    .concat(rows.map(row => row === '-1' ? 'no plan' : 'old ' + row))
    .map((name, i) => ({node: i, name}))
  cols.forEach((col, i) => {
    rows.forEach((row, j) => {
      const value = data[col][row]
      if (value === 0 || value == null) return
      const link = {
        source: cols.length + j,
        target: i,
        value,
      }
      links.push(link)
    })
  })
  const graph = {nodes, links}
  return graph
}

// const graph = {
//   "nodes": [
//     { "node": 0, "name": "node0" },
//     { "node": 1, "name": "node1" },
//     { "node": 2, "name": "node2" },
//     { "node": 3, "name": "node3" },
//     { "node": 4, "name": "node4" }
//   ],
//   "links": [
//     { "source": 0, "target": 2, "value": 2 },
//     { "source": 1, "target": 2, "value": 2 },
//     { "source": 1, "target": 3, "value": 2 },
//     { "source": 0, "target": 4, "value": 2 },
//     { "source": 2, "target": 3, "value": 2 },
//     { "source": 2, "target": 4, "value": 2 },
//     { "source": 3, "target": 4, "value": 4 }
//   ]
// }

// const sankey = d3.sankey()

function drawSankey(graph) {
  var units = "Widgets";

  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 700 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;
  window.width = width


  var formatNumber = d3.format(",.0f"),    // zero decimal places
      format = function(d) { return formatNumber(d) + " " + units; },
      color = d3.scale.category20();

  // append the svg canvas to the page
  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(36)
      .nodePadding(40)
      .size([width, height]);

  var path = sankey.link();

  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

  // add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

  // add the link titles
  link.append("title")
        .text(function(d) {
        return d.source.name + " → " + 
                d.target.name + "\n" + format(d.value); });

  // add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
      return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { 
      this.parentNode.appendChild(this); })
      .on("drag", dragmove));

  // add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { 
      return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { 
      return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { 
      return d.name + "\n" + format(d.value); });

  // add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  // the function for moving the nodes
  function dragmove(d) {
    d3.select(this).attr("transform", 
        "translate(" + d.x + "," + (
                d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
}


async function main() {
  const dataResp = await fetch(DATA_PATH + 'migrations.json')
  const data = await dataResp.json()
  const graph = dataToGraph(data)
  drawSankey(graph)
}

main()