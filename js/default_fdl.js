var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height")-50; // offset st it does not over; limit the amount of space

// var color = d3.scaleOrdinal(d3.schemeCategory20);
var color = d3.scaleOrdinal() // these are the colors defined in the paper
  .range(['#000000',
'#0000ff',
'#00ffff',
'#00cc00',
'#ff9900',
'#ff0000',
'#F20BCE',
'#999966',
'#ccffff',
'#ffffb3', // yellow
'#e6e6ff'])

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(20).id(function(d) {
        return d.id;
    }))
    // .force('lowerbound', d3.forceY(height/2).strength(0.001))
    .force("charge", d3.forceManyBody().strength(-10).distanceMax(height/4))
    .force("center", d3.forceCenter(width / 2, height / 2));

// simulation.alpha

function checkWeighted(graph){
    if (graph.links[0]["weight"]){
        return true;
    } else {
        return false;
    }
}

d3.json("infnet6yr.json", function(error, graph) {
    if (error) throw error;

    var weighted = checkWeighted(graph);
    console.log(weighted);
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) {
            if (weighted){
                return (d.weight * 2); // scale the weights by 2
            } else{
                return 1.5 //
            }

        });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 5) // radius of circle
        .attr("fill", function(d) {
            // color the nodes according to the color of the group
            return color(d.group);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // add node label
    node.append("title")
        .text(function(d) {
            var _str = d.name + '\n' + d.institute;
            return _str
        });
    // add node location
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked); // call ticked to get the source!

    simulation.force("link")
        .links(graph.links);

    // var aspect = width / height,
    //     chart = d3.select('#chart');

    // d3.select(window)
    //     .on("resize", function() {
    //         var targetWidth = chart.node().getBoundingClientRect().width;
    //         var targetWidth = chart.node().getBoundingClientRect().width;
    //         chart.attr("width", targetWidth);
    //         chart.attr("height", targetWidth / aspect);
    //     });



    function ticked() {
        // This is called and the links and node's location are set.
        var rx = 10.;
        var ry = 10;
        link
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });
        // bound the nodes
        node
            .attr("cx", function(d) {
                return d.x = Math.max(rx, Math.min(width - rx, d.x)); }
            )

            .attr("cy", function(d) {
                return d.y = Math.max(ry, Math.min(height-ry, d.y)); });
    }
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    // console.log(d.fx,d.fy);
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
