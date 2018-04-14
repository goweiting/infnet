var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"); // offset st it does not over; limit the amount of space


//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
var optArray = [];

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
    .force("link", d3.forceLink().distance(8).id(function(d) {
        return d.id;
    }))
    .force("boundary", d3.forceCollide(8).strength(.5))
    // .force('lowerbound', d3.forceY(height/2).strength(0.001))
    .force("charge", d3.forceManyBody().strength(-50).distanceMax(height/3).distanceMin(10))
    .force("center", d3.forceCenter(width / 2, height / 2));

// simulation.alpha

function checkWeighted(graph){
    if (graph.links[0]["weight"]){
        return true;
    } else {
        return false;
    }
}

//Set up tooltip
// var tip = d3.tip()
//     .attr('class', 'd3-tip')
//     .offset([-10, 0])
//     .html(function (d) {
//     return  d.name + "";
// })
// svg.call(tip);


d3.json("infnet6yr.json", function(error, graph) {
    if (error) throw error;

    var weighted = checkWeighted(graph);
    // console.log(weighted);
    //
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
            .on("end", dragended))
        .on('dblclick', connectedNodes)
        // .on('mouseover', tip.show) //Added
        // .on('mouseout', tip.hide); //Added

    // add node label
    node.append("title")
        .text(function(d) {
            var _str = d.name + '\n' + d.institute;
            return _str
        });

    // var texts = svg.selectAll("text.label")
    //             .data(graph.nodes)
    //             .enter().append("text")
    //             .attr("class", "label")
    //             .attr("fill", "black")
    //             .text(function(d) {  return d.name;  });

    // add node location
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked); // call ticked to get the source!

    simulation
        .force("link")
        .links(graph.links);

    var aspect = width / height,
        chart = d3.select('#chart');

    d3.select(window)
        .on("resize", function() {
            var targetWidth = chart.node().getBoundingClientRect().width;
            var targetWidth = chart.node().getBoundingClientRect().width;
            chart.attr("width", targetWidth);
            chart.attr("height", targetWidth / aspect);
        });

    // for doubleclicked
    for (i = 0; i < graph.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };
    graph.links.forEach(function (d) {
        // console.log(d.source.index);
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });


    for (var i = 0; i < graph.nodes.length - 1; i++) {
        optArray.push(graph.nodes[i].name);
    }
    optArray = optArray.sort();

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

        // texts.attr("transform", function(d) { // this works to show thename on the node; not v nice
        //     return "translate(" + d.x + "," + d.y + ")";
        // });
    }


    //This function looks up whether a pair are neighbours
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }

    function connectedNodes() {

        if (toggle == 0) {
            //Reduce the opacity of all but the neighbouring nodes
            d = d3.select(this).node().__data__;

            node.style("opacity", function (o) {

                if ( linkedByIndex[d.index +"," + o.index] || linkedByIndex[o.index + "," + d.index]){
                    return 1;
                } else {
                    return 0.1;
                }
                // return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
            });
            link.style("opacity", function (o) {
                return d.index==o.source.index || d.index==o.target.index ? 1 : 0.1;
            });
            //Reduce the op
            toggle = 1;

        } else {
            // console.log('toggle0');
            //Put them back to opacity=1
            node.style("opacity", 1);
            link.style("opacity", 1);
            toggle = 0;
        }
    }

    $(function () {
        $("#search").autocomplete({
            source: optArray
        });
    });



});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    // console.log(d.__proto__);
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}







