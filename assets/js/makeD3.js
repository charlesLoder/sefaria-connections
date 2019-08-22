import * as d3 from 'd3';

const width = window.innerWidth;
const height = window.innerHeight;
const margin = {top: 20, right: 20, bottom: 20, left: 20};

const makeGraph = (data) => {
  const [ref, firstDegree, secondDegree] = data;
  const graph = {nodes : [], links: []};

  graph.nodes.push({id: ref, group: 1});

  firstDegree.forEach(ref => {
      graph.nodes.push({id: ref.ref, group: 2});
      graph.links.push({source: ref.anchorRef, target: ref.ref, group: 2});
  });
  secondDegree.forEach(ref => {
    graph.nodes.push({id: ref.ref, group: 3});
    graph.links.push({source: ref.anchorRef, target: ref.ref, group: 3});
  });
  return graph;
}

const simulation = d3.forceSimulation()
  .force("center", d3.forceCenter(width/2, height/2))
  .force('charge', d3.forceManyBody().strength(-200).theta(0.8).distanceMax(150)) 
  .force("link", d3.forceLink().id(function(d) { return d.id; }));

const dragstarted = d => {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

const dragged = d => {
  d.fx = d3.event.x
  d.fy = d3.event.y
}

const dragended = d => {
  d.fx = d3.event.x
  d.fy = d3.event.y
  if (!d3.event.active) simulation.alphaTarget(0);
}

function run(graph, svg) {
  let link = svg.append("g")
                .selectAll("line")                
                .data(graph.links)
                .enter()
                .append("line")
                .style("stroke", "#aaa");

  let node = svg.append("g")
              .attr("class", "nodes")
              .selectAll("circle")
              .data(graph.nodes)
              .enter().append("circle")
              .attr("r", 20)
              .call(d3.drag()
                      .on("start", dragstarted)
                      .on("drag", dragged)
                      .on("end", dragended));
  
  let label = svg.append("g")
                  .attr("class", "labels")
                  .selectAll("text")
                  .data(graph.nodes)
                  .enter().append("text")
                  .attr("class", "label")
                  .text(function(d) { return d.id; });

  simulation.nodes(graph.nodes).on("tick", ticked);
  simulation.force("link").links(graph.links);

  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("r", 16)
      .style("fill", "#efefef")
      .style("stroke", "#424242")
      .style("stroke-width", "1px")
      .attr("cx", function (d) { return d.x+5; })
      .attr("cy", function(d) { return d.y-3; });
    
    label
      .attr("x", function(d) { return d.x; })
      .attr("y", function (d) { return d.y; })
      .style("font-size", "10px").style("fill", "#333");
  }
}

export const makeD3 = (data) => {
  const graph = makeGraph(data);
  const svg = d3.select('main').append('svg')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height -margin.top - margin.bottom);
  run(graph, svg);
}