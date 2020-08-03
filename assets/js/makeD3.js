import * as d3 from 'd3';

// the 200 is to account for the width of the side panel
const width = window.innerWidth - 200;
const height = window.innerHeight;
const margin = {top: 10, right: 10, bottom: 10, left: 10};

const splitId = (id) => {
  let words = id.split(' ');
  let halfPoint = Math.ceil(words.length / 2);
  let firstHalf = words.slice(0, halfPoint).join(' ');
  let secondHalf = words.slice(halfPoint).join(' ');
  return [firstHalf, secondHalf];
}

const makeGraph = data => {
  const [initRef, firstDegree, secondDegree] = data;
  const graph = {nodes : [], links: []};
  graph.nodes.push({id: initRef, group: 1, lines: splitId(initRef)});
  firstDegree.forEach(ref => {
      graph.nodes.push({id: ref.ref, group: 2, lines: splitId(ref.ref)});
      graph.links.push({source: initRef, target: ref.ref, group: 2});
  });
  secondDegree.forEach(ref => {
    graph.nodes.push({id: ref.ref, group: 3, lines: splitId(ref.ref)});
    ref.anchorRefExpanded.forEach(anc => {
      graph.nodes.push({id: anc, group: 2, lines: splitId(ref.ref)});
      graph.links.push({source: anc, target: ref.ref, group:3});
    })
  });
  // removes duplicates
  // this is a workaround because Set() won't recognize two objects as identical
  // unless they are the same object
  const unique = new Set();
  const uniqueNodes = graph.nodes.filter(node => {
    const duplicate = unique.has(node.id);
    unique.add(node.id);
    return !duplicate;
  });
  graph.nodes = uniqueNodes;
  return graph;
}

const run = graph => {
  // ========= operational logic =========== //
  const nodeFillColor = node => node.group === 1 ? '#e0a5f0' : node.group === 2 ? '#f5a676' : '#8ccef3';
  // const nodeStrokeColor = node => node.group === 1 ? '#3b4c63' : node.group === 2 ? '#435869' : '#32495c';

  const dragstarted = d => {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }
  
  const dragged = d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  const dragended = d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    if (!d3.event.active) {
      simulation.alphaTarget(0)
    }
  }

  const ticked = () => {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
    
    label
      .attr("x", function(d) { return d.x; })
      .attr("y", function (d) { return d.y; })
      
  }

  // check the dictionary to see if nodes are linked
  const isConnected= (a, b) => {
    return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index == b.index;
  }

  // fade nodes on hover
  const mouseOver = (opacity) => {
    return function(d) {
        // check all other nodes to see if they're connected
        // to this one. if so, keep the opacity at 1, otherwise
        // fade
        node.style("stroke-opacity", function(o) {
            let thisOpacity = isConnected(d, o) ? 1 : opacity;
            return thisOpacity;
        });
        node.style("fill-opacity", function(o) {
            let thisOpacity = isConnected(d, o) ? 1 : opacity;
            return thisOpacity;
        });
        // also style link accordingly
        link.style("stroke-opacity", function(o) {
            return o.source === d || o.target === d ? 1 : opacity;
        });
        link.style("stroke", function(o){
            return o.source === d || o.target === d ? "#000" : "#ddd";
        });
        label.style("visibility", function(o) {
          let display = isConnected(d, o) ? "visible" : "hidden";
          return display;
        }
        )
    };
  }

  const mouseOut = () => {
    node.style("stroke-opacity", 1);
    node.style("fill-opacity", 1);
    link.style("stroke-opacity", 1);
    link.style("stroke", "#ddd");
    label.style("visibility", "visible");
  }

  // ======================================= //

  d3.select('svg').remove();
  // create an svg to draw in
  const svg = d3.select('main')
                .append('svg')
                .attr('width', width - margin.left - margin.right)
                .attr('height', height - margin.top - margin.bottom)
                .attr("transform", "translate(" + margin.left + ", " + margin.right + ")")
                .call(d3.zoom().on("zoom", function() {
                  svg.attr("transform", d3.event.transform)
                }))
                .append("g")
                .attr("class", "main");

  const simulation = d3.forceSimulation()
                      // draw them around the center of the space
                      .force("center", d3.forceCenter(width/2, height/2))
                      // push nodes apart to space them out
                      .force('charge', d3.forceManyBody().strength(-500).theta(0.8).distanceMax(250))
                      // pull nodes together based on the links between them
                      .force("link", d3.forceLink().id(function(d) {return d.id;}))
                      .on("tick", ticked);

  const link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")                
                .data(graph.links)
                .enter()
                .append("line")
                .style("stroke", "#ddd");

  const node = svg.append("g")
              .attr("class", "nodes")
              .selectAll("circle")              
              .data(graph.nodes)
              .enter()
              .append("circle")
              .attr("r", "2rem")
              .attr("id", function(d) { return d.id; })
              .style("fill", nodeFillColor)
              .style("stroke", "#ddd")
              .style("stroke-width", "1px")
              .on("mouseover", mouseOver(.2))
              .on("mouseout", mouseOut)
              .call(d3.drag()
                      .on("start", dragstarted)
                      .on("drag", dragged)
                      .on("end", dragended));
  
  const label = svg.append("g")
                  .attr("class", "labels")
                  .selectAll("text")
                  .data(graph.nodes)
                  .enter()
                  .append("a")
                  .attr("xlink:href", function(d) { return `https://www.sefaria.org/${d.id}`})
                  .attr("target", "_blank")
                  .append("svg")
                  .attr("class", "label")
                  .attr("overflow", "visible")
                  // .style("font-size", "1.2rem")
                  // .style("fill", "#333")
                  // .append("tspan")
                  // .text(function(d) {return d.lines[0]})
                  // .append("tspan")
                  // .text(function(d) {return d.lines[1]});
                  .html(function(d){
                    return `
                    <text class="label-text" text-anchor="middle">${d.lines[0]}</text>
                    <text class="label-text" text-anchor="middle" dy="1rem">${d.lines[1]}</text>
                    `
                  })
   
  // add the nodes to the simulation
  simulation.nodes(graph.nodes);
  // add the links to the simulation
  simulation.force("link").links(graph.links);

  // build a dictionary of nodes that are linked
  const linkedByIndex = {};
  graph.links.forEach(function(d) {
    linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
  });
}

export const makeD3 = data => {
  const graph = makeGraph(data);
  run(graph);
}