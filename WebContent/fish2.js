var w = 1600,
    h = 800,
    /**
     * d3.scale: provides a new instance of the scale
     * category20: is a scale of colors
     *  0   #1f77b4
		1   #aec7e8
		2   #ff7f0e
		3   #ffbb78
		4   #2ca02c
		5   #98df8a
		6   #d62728
		7   #ff9896
		8   #9467bd
		9   #c5b0d5
		10  #8c564b
		11  #c49c94
		12  #e377c2
		13  #f7b6d2
		14  #7f7f7f
		15  #c7c7c7
		16  #bcbd22
		17  #dbdb8d
		18  #17becf
		19  #9edae5
     */
    fill = d3.scale.category20()
    trans=[0,0]
    scale=1;

var fisheye = d3.fisheye()
    .radius(100)
    .power(3);

/* g: is a container used to group other SVG elements.
 * Transformations applied to the <g> element are performed on all of its child elements.*/

/* d3.selcect: select an element in the page, in this case the <div> con id=chart */
var vis = d3.select("#chart")
  .append("svg:svg") //agrega un svg a div element called chart
    .attr("width", w)
    .attr("height", h)
    .attr("pointer-events", "all")
  .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", redraw))
  .append('svg:g');

//Notation: the notation above is the same that:
/*
 * var vis = d3.select("#chart");
 * append("svg:svg");
 * attr("width", w);
 * etc...
 *
 * If a value is passed as parameter, it is a setter function
 * If none value is passed as parameter, it is a getter function
 * */

vis.append('svg:rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'white'); //fill is a scale of colors

//Function called when zoom change
function redraw() {
  trans=d3.event.translate;
  scale=d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");

  /*TEST*/
  console.log("redraw=" + "transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

var jsonNodes = {}; //JSON
var jsonLinks = {}; //JSON
//@elahe: passing nodes and links to dra the diagram
var draw = function(nodesResults, linkResults) {

  var force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .nodes(nodesResults)
      .links(linkResults)
      .size([w, h]);
      //.start();

  //@ameza: to configure links
  var link = vis.selectAll("line.link") //CSS class
      .data(linkResults)
    .enter().append("svg:line") //Add link to the svg container
      .attr("class", "link") //CSS class
      //.style("stroke-width", function(d) { return Math.sqrt(d.value); }) //OLD
      //.style("stroke-width", 1)
      //Declare link's attributes: source and target coordinates
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      //Assign events to the link
    .on("click", clickLink)
    .on ("mouseover",moverLink) //TO DO: Not working right
    .on ("mouseout",moutLink)
    ;

  //@ameza: to configure nodes
  var node = vis.selectAll("circle.node") //CSS class
      .data(nodesResults)
    .enter().append("svg:circle") //Add node to the svg container
      .attr("class", "node") //CSS class
      //Declare node's attributes
      .attr("cx", function(d) { return d.x; }) //center position
      .attr("cy", function(d) { return d.y; })
      .attr("r", 5) //radious length
      //.attr("component", function(d) { return d.component;}) //To delete
      .style("fill", function(d) { return fill(d.Package); }) //Assign the color to each node based on the app name
    //Assign events to the node
	.on("click", clickNode)
    .on ("mouseover",moverNode)
    .on ("mouseout",moutNode)
    ;
//      .call(force.drag);

    var n = data.nodes.length;


  vis.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 1);

    force.start();
    for (var i = n; i > 0; --i) force.tick();
    force.stop();

    //@ameza:on click event for link
	function clickLink(d) {
		console.log("Communication/Permission: "+d.type); //TO DO: Display in a specific area in the layout
	}
    //@ameza:on click event for nodes
	function clickNode(d) {
		console.log("click on node: "+d.id); //TO DO: Method to get the component info from the app XML file
	}

	//@ameza: on mouse over event this method paints the pop-up next to the node manipulating the CSS of the div object
    function moverNode(d) {
        $("#pop-up").fadeOut(100,function () {
        	    $("#pop-up-title").html("Package: "+d.Package);
        	    $("#pop-up-subtitle").html("Component: "+d.Component);
            /*$("#pop-img").html("23");
            $("#pop-desc").html("M+T: text text test"); */ //TO DO: Method to get the component info from the app XML file

            // Popup position
        	    console.log(scale);
        	    console.log("trans[0]="+trans[0]);
        	    console.log("d.x="+d.x);
        	    console.log("trans[1]="+trans[1]);
        	    console.log("d.y="+d.y);

            var popLeft = (d.x*scale)+trans[0]+20;//lE.cL[0] + 20;
            var popTop = (d.y*scale)+trans[1]+20;//lE.cL[1] + 70;
            $("#pop-up").css({"left":popLeft,"top":popTop});
            $("#pop-up").fadeIn(100);
        });

    }
    //@ameza: on mouse over event this method paints the pop-up next to the link manipulating the CSS of the div object
    function moverLink(d) {
        $("#pop-up-link").fadeOut(100,function () {
        	    var cType = "Permission: ";
        	    if ((d.type =="implicit") || (d.type=="explicit")) {
        	    		cType = "Communication: ";
        	    }

        	    $("#pop-up-link-type").html(cType+d.type);
            var popLeft = (d.source.x); //TO DO: Improve to display pop-up next to the line
            var popTop = (d.source.y);
            $("#pop-up-link").css({"left":popLeft,"top":popTop});
            $("#pop-up-link").fadeIn(100);
        });

    }
    //@ameza: on mouseout the pop-up disappears
    function moutNode(d) {
        $("#pop-up").fadeOut(50);
        d3.select(this).attr("fill","url(#ten1)");
    }
    //@ameza: on mouseout the pop-up disappears
    function moutLink(d) {
        $("#pop-up-link").fadeOut(50);
        d3.select(this).attr("fill","url(#ten1)");
    }
   //This on mousemove event is for the vis object. It applies the fisheye effect
   vis.on("mousemove", function() {

       fisheye.center(d3.mouse(this));
       //To get data from the node us "d"
       node
           .each(function(d) { d.display = fisheye(d); })
           .attr("cx", function(d) { return d.display.x; }) //center x coordinate does not change
           .attr("cy", function(d) { return d.display.y; }) //center y coordinate does not change
           .attr("r", function(d) { return d.display.z * 4.5; }); //circle radious does change, thus the point size change

       link
           .attr("x1", function(d) { return d.source.display.x; }) //start point x coordinate does not change
           .attr("y1", function(d) { return d.source.display.y; }) //start point y coordinate does not change
           .attr("x2", function(d) { return d.target.display.x; }) //end point x coordinate does not change
           .attr("y2", function(d) { return d.target.display.y; });//end point y coordinate does not change
    });
};

//@elahe: function to convert csv to json file and parse it data for nodes and links
fileInput.addEventListener('change', function(e) {
  var file = fileInput.files[0];
  var textType = /text.*/;

  if (file.type.match(textType)) {
    var reader = new FileReader();

    reader.onload = function(e) {
      var csv = reader.result;

      var lines=csv.split("\n");

      var nodes = [];
      var links = [];
      var linkResults = [];

      var headers=lines[0].split(",");

      for(var i=1;i<lines.length;i++){

        var obj = {};
        var obj1 = {};
        var currentline=lines[i].split(",");

        for(var j=0;j<3;j++){ //only need the first 3: package, component, ID
          obj[headers[j]] = currentline[j];
        }

        nodes.push(obj);

        for(var j=3;j<headers.length;j++){
          obj1[headers[j]] = currentline[j];
        }
        links.push(obj1);
      }

      for (var i=0 ; i < links.length ; i++)
      {
        for (var j=0 ; j < links.length ; j++) {
          if (links[i][j] === "1") {
              linkResults.push(
                {
                  source: i,
                  target:j,
                  type: file.name.substring(0,file.name.lastIndexOf("."))
                }
              );
          }
        }

      }

      draw(nodes, linkResults)
    }

    reader.readAsText(file);
  }
});

//This is an array of objects structure
var data = {"nodes":[{"component":"LevelUp", "Package": "edu.uci.seal.fungame", "id":0},	//TO DO: Assign the JSON parsing function to data.
	                 {"component":"Main", "Package": "edu.uci.seal.fungame", "id":1},
	                 {"component":"ListMsgs", "Package": "edu.uci.seal.messaging", "id":2},
	                 {"component":"Composer", "Package": "edu.uci.seal.messaging", "id":3},
	                 {"component":"Sender", "Package": "edu.uci.seal.messaging", "id":4},
	                 {"component":"SystemService", "Package": "system", "id":5}],
	        "links":[{"source":0,"target":1, "type":"explicit"}]};
//OLD
//var data = {"nodes":[{"name":"Myriel","group":1},{"name":"Napoleon","group":1},{"name":"Mlle.Baptistine","group":1},{"name":"Mme.Magloire","group":1},{"name":"CountessdeLo","group":1},{"name":"Geborand","group":1},{"name":"Champtercier","group":1},{"name":"Cravatte","group":1},{"name":"Count","group":1},{"name":"OldMan","group":1},{"name":"Labarre","group":2},{"name":"Valjean","group":2},{"name":"Marguerite","group":3},{"name":"Mme.deR","group":2},{"name":"Isabeau","group":2},{"name":"Gervais","group":2},{"name":"Tholomyes","group":3},{"name":"Listolier","group":3},{"name":"Fameuil","group":3},{"name":"Blacheville","group":3},{"name":"Favourite","group":3},{"name":"Dahlia","group":3},{"name":"Zephine","group":3},{"name":"Fantine","group":3},{"name":"Mme.Thenardier","group":4},{"name":"Thenardier","group":4},{"name":"Cosette","group":5},{"name":"Javert","group":4},{"name":"Fauchelevent","group":0},{"name":"Bamatabois","group":2},{"name":"Perpetue","group":3},{"name":"Simplice","group":2},{"name":"Scaufflaire","group":2},{"name":"Woman1","group":2},{"name":"Judge","group":2},{"name":"Champmathieu","group":2},{"name":"Brevet","group":2},{"name":"Chenildieu","group":2},{"name":"Cochepaille","group":2},{"name":"Pontmercy","group":4},{"name":"Boulatruelle","group":6},{"name":"Eponine","group":4},{"name":"Anzelma","group":4},{"name":"Woman2","group":5},{"name":"MotherInnocent","group":0},{"name":"Gribier","group":0},{"name":"Jondrette","group":7},{"name":"Mme.Burgon","group":7},{"name":"Gavroche","group":8},{"name":"Gillenormand","group":5},{"name":"Magnon","group":5},{"name":"Mlle.Gillenormand","group":5},{"name":"Mme.Pontmercy","group":5},{"name":"Mlle.Vaubois","group":5},{"name":"Lt.Gillenormand","group":5},{"name":"Marius","group":8},{"name":"BaronessT","group":5},{"name":"Mabeuf","group":8},{"name":"Enjolras","group":8},{"name":"Combeferre","group":8},{"name":"Prouvaire","group":8},{"name":"Feuilly","group":8},{"name":"Courfeyrac","group":8},{"name":"Bahorel","group":8},{"name":"Bossuet","group":8},{"name":"Joly","group":8},{"name":"Grantaire","group":8},{"name":"MotherPlutarch","group":9},{"name":"Gueulemer","group":4},{"name":"Babet","group":4},{"name":"Claquesous","group":4},{"name":"Montparnasse","group":4},{"name":"Toussaint","group":5},{"name":"Child1","group":10},{"name":"Child2","group":10},{"name":"Brujon","group":4},{"name":"Mme.Hucheloup","group":8}],"links":[{"source":1,"target":0,"value":1},{"source":2,"target":0,"value":8},{"source":3,"target":0,"value":10},{"source":3,"target":2,"value":6},{"source":4,"target":0,"value":1},{"source":5,"target":0,"value":1},{"source":6,"target":0,"value":1},{"source":7,"target":0,"value":1},{"source":8,"target":0,"value":2},{"source":9,"target":0,"value":1},{"source":11,"target":10,"value":1},{"source":11,"target":3,"value":3},{"source":11,"target":2,"value":3},{"source":11,"target":0,"value":5},{"source":12,"target":11,"value":1},{"source":13,"target":11,"value":1},{"source":14,"target":11,"value":1},{"source":15,"target":11,"value":1},{"source":17,"target":16,"value":4},{"source":18,"target":16,"value":4},{"source":18,"target":17,"value":4},{"source":19,"target":16,"value":4},{"source":19,"target":17,"value":4},{"source":19,"target":18,"value":4},{"source":20,"target":16,"value":3},{"source":20,"target":17,"value":3},{"source":20,"target":18,"value":3},{"source":20,"target":19,"value":4},{"source":21,"target":16,"value":3},{"source":21,"target":17,"value":3},{"source":21,"target":18,"value":3},{"source":21,"target":19,"value":3},{"source":21,"target":20,"value":5},{"source":22,"target":16,"value":3},{"source":22,"target":17,"value":3},{"source":22,"target":18,"value":3},{"source":22,"target":19,"value":3},{"source":22,"target":20,"value":4},{"source":22,"target":21,"value":4},{"source":23,"target":16,"value":3},{"source":23,"target":17,"value":3},{"source":23,"target":18,"value":3},{"source":23,"target":19,"value":3},{"source":23,"target":20,"value":4},{"source":23,"target":21,"value":4},{"source":23,"target":22,"value":4},{"source":23,"target":12,"value":2},{"source":23,"target":11,"value":9},{"source":24,"target":23,"value":2},{"source":24,"target":11,"value":7},{"source":25,"target":24,"value":13},{"source":25,"target":23,"value":1},{"source":25,"target":11,"value":12},{"source":26,"target":24,"value":4},{"source":26,"target":11,"value":31},{"source":26,"target":16,"value":1},{"source":26,"target":25,"value":1},{"source":27,"target":11,"value":17},{"source":27,"target":23,"value":5},{"source":27,"target":25,"value":5},{"source":27,"target":24,"value":1},{"source":27,"target":26,"value":1},{"source":28,"target":11,"value":8},{"source":28,"target":27,"value":1},{"source":29,"target":23,"value":1},{"source":29,"target":27,"value":1},{"source":29,"target":11,"value":2},{"source":30,"target":23,"value":1},{"source":31,"target":30,"value":2},{"source":31,"target":11,"value":3},{"source":31,"target":23,"value":2},{"source":31,"target":27,"value":1},{"source":32,"target":11,"value":1},{"source":33,"target":11,"value":2},{"source":33,"target":27,"value":1},{"source":34,"target":11,"value":3},{"source":34,"target":29,"value":2},{"source":35,"target":11,"value":3},{"source":35,"target":34,"value":3},{"source":35,"target":29,"value":2},{"source":36,"target":34,"value":2},{"source":36,"target":35,"value":2},{"source":36,"target":11,"value":2},{"source":36,"target":29,"value":1},{"source":37,"target":34,"value":2},{"source":37,"target":35,"value":2},{"source":37,"target":36,"value":2},{"source":37,"target":11,"value":2},{"source":37,"target":29,"value":1},{"source":38,"target":34,"value":2},{"source":38,"target":35,"value":2},{"source":38,"target":36,"value":2},{"source":38,"target":37,"value":2},{"source":38,"target":11,"value":2},{"source":38,"target":29,"value":1},{"source":39,"target":25,"value":1},{"source":40,"target":25,"value":1},{"source":41,"target":24,"value":2},{"source":41,"target":25,"value":3},{"source":42,"target":41,"value":2},{"source":42,"target":25,"value":2},{"source":42,"target":24,"value":1},{"source":43,"target":11,"value":3},{"source":43,"target":26,"value":1},{"source":43,"target":27,"value":1},{"source":44,"target":28,"value":3},{"source":44,"target":11,"value":1},{"source":45,"target":28,"value":2},{"source":47,"target":46,"value":1},{"source":48,"target":47,"value":2},{"source":48,"target":25,"value":1},{"source":48,"target":27,"value":1},{"source":48,"target":11,"value":1},{"source":49,"target":26,"value":3},{"source":49,"target":11,"value":2},{"source":50,"target":49,"value":1},{"source":50,"target":24,"value":1},{"source":51,"target":49,"value":9},{"source":51,"target":26,"value":2},{"source":51,"target":11,"value":2},{"source":52,"target":51,"value":1},{"source":52,"target":39,"value":1},{"source":53,"target":51,"value":1},{"source":54,"target":51,"value":2},{"source":54,"target":49,"value":1},{"source":54,"target":26,"value":1},{"source":55,"target":51,"value":6},{"source":55,"target":49,"value":12},{"source":55,"target":39,"value":1},{"source":55,"target":54,"value":1},{"source":55,"target":26,"value":21},{"source":55,"target":11,"value":19},{"source":55,"target":16,"value":1},{"source":55,"target":25,"value":2},{"source":55,"target":41,"value":5},{"source":55,"target":48,"value":4},{"source":56,"target":49,"value":1},{"source":56,"target":55,"value":1},{"source":57,"target":55,"value":1},{"source":57,"target":41,"value":1},{"source":57,"target":48,"value":1},{"source":58,"target":55,"value":7},{"source":58,"target":48,"value":7},{"source":58,"target":27,"value":6},{"source":58,"target":57,"value":1},{"source":58,"target":11,"value":4},{"source":59,"target":58,"value":15},{"source":59,"target":55,"value":5},{"source":59,"target":48,"value":6},{"source":59,"target":57,"value":2},{"source":60,"target":48,"value":1},{"source":60,"target":58,"value":4},{"source":60,"target":59,"value":2},{"source":61,"target":48,"value":2},{"source":61,"target":58,"value":6},{"source":61,"target":60,"value":2},{"source":61,"target":59,"value":5},{"source":61,"target":57,"value":1},{"source":61,"target":55,"value":1},{"source":62,"target":55,"value":9},{"source":62,"target":58,"value":17},{"source":62,"target":59,"value":13},{"source":62,"target":48,"value":7},{"source":62,"target":57,"value":2},{"source":62,"target":41,"value":1},{"source":62,"target":61,"value":6},{"source":62,"target":60,"value":3},{"source":63,"target":59,"value":5},{"source":63,"target":48,"value":5},{"source":63,"target":62,"value":6},{"source":63,"target":57,"value":2},{"source":63,"target":58,"value":4},{"source":63,"target":61,"value":3},{"source":63,"target":60,"value":2},{"source":63,"target":55,"value":1},{"source":64,"target":55,"value":5},{"source":64,"target":62,"value":12},{"source":64,"target":48,"value":5},{"source":64,"target":63,"value":4},{"source":64,"target":58,"value":10},{"source":64,"target":61,"value":6},{"source":64,"target":60,"value":2},{"source":64,"target":59,"value":9},{"source":64,"target":57,"value":1},{"source":64,"target":11,"value":1},{"source":65,"target":63,"value":5},{"source":65,"target":64,"value":7},{"source":65,"target":48,"value":3},{"source":65,"target":62,"value":5},{"source":65,"target":58,"value":5},{"source":65,"target":61,"value":5},{"source":65,"target":60,"value":2},{"source":65,"target":59,"value":5},{"source":65,"target":57,"value":1},{"source":65,"target":55,"value":2},{"source":66,"target":64,"value":3},{"source":66,"target":58,"value":3},{"source":66,"target":59,"value":1},{"source":66,"target":62,"value":2},{"source":66,"target":65,"value":2},{"source":66,"target":48,"value":1},{"source":66,"target":63,"value":1},{"source":66,"target":61,"value":1},{"source":66,"target":60,"value":1},{"source":67,"target":57,"value":3},{"source":68,"target":25,"value":5},{"source":68,"target":11,"value":1},{"source":68,"target":24,"value":1},{"source":68,"target":27,"value":1},{"source":68,"target":48,"value":1},{"source":68,"target":41,"value":1},{"source":69,"target":25,"value":6},{"source":69,"target":68,"value":6},{"source":69,"target":11,"value":1},{"source":69,"target":24,"value":1},{"source":69,"target":27,"value":2},{"source":69,"target":48,"value":1},{"source":69,"target":41,"value":1},{"source":70,"target":25,"value":4},{"source":70,"target":69,"value":4},{"source":70,"target":68,"value":4},{"source":70,"target":11,"value":1},{"source":70,"target":24,"value":1},{"source":70,"target":27,"value":1},{"source":70,"target":41,"value":1},{"source":70,"target":58,"value":1},{"source":71,"target":27,"value":1},{"source":71,"target":69,"value":2},{"source":71,"target":68,"value":2},{"source":71,"target":70,"value":2},{"source":71,"target":11,"value":1},{"source":71,"target":48,"value":1},{"source":71,"target":41,"value":1},{"source":71,"target":25,"value":1},{"source":72,"target":26,"value":2},{"source":72,"target":27,"value":1},{"source":72,"target":11,"value":1},{"source":73,"target":48,"value":2},{"source":74,"target":48,"value":2},{"source":74,"target":73,"value":3},{"source":75,"target":69,"value":3},{"source":75,"target":68,"value":3},{"source":75,"target":25,"value":3},{"source":75,"target":48,"value":1},{"source":75,"target":41,"value":1},{"source":75,"target":70,"value":1},{"source":75,"target":71,"value":1},{"source":76,"target":64,"value":1},{"source":76,"target":65,"value":1},{"source":76,"target":66,"value":1},{"source":76,"target":63,"value":1},{"source":76,"target":62,"value":1},{"source":76,"target":48,"value":1},{"source":76,"target":58,"value":1}]};

//draw(data);
