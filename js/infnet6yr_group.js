var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height")-50; // offset st it does not over; limit the amount of space

var pos_group_x = d3.scaleOrdinal()
.domain([0,1,2,3,4,5,6,7,8,9,10,11])
  .range([width/8, width*2/8, width*3/8, width*4/8,width*5/8,width*6/8,width*7/8,width,width,width]);

var pos_group_y = d3.scaleOrdinal()
.domain([0,1,2,3,4,5,6,7,8,9,10,11])
  .range([height/8, height*2/8, height*3/8, height*4/8,height*5/8,height*6/8,height*7/8,height,height,height]);

// var color = d3.scaleOrdinal(d3.schemeCategory20);
var color = d3.scaleOrdinal() // these are the colors defined in the paper
  .domain(['UNKNOWN',
'centre for intelligent systems and their applications',
'institute of language cognition and computation',
'laboratory for foundations of computer science',
'institute for adaptive and neural computation',
'institute for computing systems architecture',
'neuroinformatics dtc',
'institute of perception action and behaviour',
'school of philosophy psychology and language sciences',
'deanery of clinical science',
'?'])
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
'#e6e6ff']);

var _radius = 10; // constant radius for force radial; might want to shape this according to size of group!

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(20).id(function(d) {
        return d.id;
    }))
    .force("boundary", d3.forceCollide(2).strength(0.01))
    .force("charge", d3.forceManyBody().strength(-10).distanceMax(height/4))
    .force("group_x", d3.forceX(function(d){
        return pos_group_x(d.group);
    }).strength(0.05))
    .force("group_y", d3.forceY(function(d){
        return pos_group_y(d.group);
    }).strength(0.01))
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
        .attr("r", 9) // radius of circle
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

    var aspect = width / height,
        chart = d3.select('#chart');
    d3.select(window)
        .on("resize", function() {
            var targetWidth = chart.node().getBoundingClientRect().width;
            var targetHeight = chart.node().getBoundingClientRect().height;
            chart.attr("width", targetWidth/aspect);
            chart.attr("height", targetHeight/aspect);
        });



    function ticked() {
        // This is called and the links and node's location are set.
        var rx = 10.;
        var ry = 0;
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
                return d.y = Math.max(ry, Math.min(height - ry, d.y)); });
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
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
