var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");
const littleRedButton = document.querySelector('.red-button');
const littleGreenButton = document.querySelector('.green-button');

//var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.screen_name; }))
    .force("charge", d3.forceManyBody().strength(() => -200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .alphaTarget(1);

var link = svg.append("g")
          .attr("class", "links").selectAll(".links");
        
var node = svg.append("g")
      .attr("class", "nodes").selectAll(".nodes");


fetch("data/my friend neighborhood_higher_cutoff.json")
    .then(response => response.json())
    .then(workerFunction)
    .catch(e => console.log(e));

function workerFunction(data) {
    //if (error) throw error;

    links = data.edges;
    nodes = data.vertices;    
    
    restart(nodes, links);
    littleRedButton.addEventListener('click',fireRedButton);
    littleGreenButton.addEventListener('click',fireGreenButton);
    
     function fireRedButton() {         
         console.log('trimming celebrity nodes');
         
         [newNodes, newLinks] = trimCelebHelper(nodes, links);
                  
         restart(newNodes,newLinks); 
     }
    
    function fireGreenButton() {
        console.log('restore full population');        
        restart(nodes,links);
    }
    
    function restart(nodesData, linksData) {
        // update the nodes
        node = node.data(nodesData) // update
            .attr("r", d => {
             if (d.celebrity) {
                 return 20;
             } else return 10;            
          })
          .attr("fill", function(d) { 
              if (d.gulper) {
                  return "#c24";
              } else return "#0c7"; 
          })
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
        
        node.exit().remove();   // exit
        
        node = node.enter()   // enter
          .append("circle")
          .attr("r", d => {
             if (d.celebrity) {
                 return 20;
             } else return 10;            
          })
          .attr("fill", function(d) { 
              if (d.gulper) {
                  return "#c24";
              } else return "#0c7"; 
          })
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended))
        .merge(node);
        
        node.append("title")
            .text(function(d) { 
            return d.screen_name;
            });

        // todo update the links        
        link = link.data(linksData)
        .attr("stroke-width", function(d) { return 3*d.weight; });
        link.exit().remove();
        link = link.enter().append("line")
          .attr("stroke-width", function(d) { return 3*d.weight; })
        .merge(link);
        
        
        simulation.nodes(nodesData)
            .on("tick",ticked);
        simulation.force("link").links(linksData);
        simulation.alpha(0).restart();
    }

      function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }
    
    
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function trimCelebHelper(nodes, links) {
    celebrityNodes = nodes.filter(node => node.celebrity);
    
    celebrityNodeNames = celebrityNodes.map(node => node.screen_name);
        
    newLinks = links.filter(link => {
        source_name = link.source.screen_name;
        target_name = link.target.screen_name;
        if (celebrityNodeNames.includes(source_name)) {
            return false;
        } else if (celebrityNodeNames.includes(target_name)) {
            return false;
        } else return true;
    });    
    
    newNodes = nodes.filter(node => !node.celebrity);
    
    console.log(newNodes);
    
    return [newNodes, newLinks];
}




