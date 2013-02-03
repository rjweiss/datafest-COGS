var sunlightapi = "5ee3fecf84784ccf8bfbd61a67c82750";
var root = "http://api.realtimecongress.org/api/v1/";
var svg;


var bill = {
	svg : null,
	data : null,
	init : function() {
		
	},
	request : function(billID) {
		var request_url = function(collection, parameters) { return root + collection + ".json?apikey=" + sunlightapi + "&callback=?&" + parameters; }
		var bill_request = request_url("bills", "bill_id=hr"+billID+"-112");

		$.getJSON(bill_request, function(data) {
			bill.data = data.bills[0];
			bill.cleanup();
			bill.draw();
		});
	},
	draw : function() {
		var weeks = [];

		var actions = [];

		_.each(bill.data.actions, function(action) {
			//console.log(action);

			if(!bill.isMajorAction(action)) { return; }

			action.date = bill.convertDate(action.acted_at);
			action.week = graphics.week(action.date);

			action.x = width/104*action.week;

			if(typeof weeks[action.week] != "number") {
				weeks[action.week] = 0;
			} else {
				weeks[action.week]++;
			}
			action.y = height - 20 - weeks[action.week]*20;

		
			actions.push(action);

		});

		bill.svg.selectAll("circle")
			.data(actions).enter().append("circle")
			.attr("r", 3)
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y
			})
			.attr("fill", "#000")
	},
	cleanup : function() {

	},
	// Helpers
	convertDate : function(str) {
		a = str.split("T");
		date = a[0].split("-");

		return new Date(date[0], date[1], date[2]).getTime();
	},
	isMajorAction : function(action) {

		if(action.in_committee) {
			return true;
		}
		if(typeof action.status == "string") { 
			return true; 
		}
		if(action.type == "signed" || action.type == "referral") { 
			return true; 
		}
		if(action.how == "roll") { 
			return true; 
		}
		//if(action.text.indexOf("Held") > 0) { return true; }

		return false;
	}
}

var words = {
	svg : null,
	stack : null,
	data : null,
	init : function() {
		words.stack = d3.layout.stack().offset("zero");
	},
	request : function() {
		var root = "http://capitolwords.org/api/1/";

		var request_url = function(collection, parameters) { return root + collection + ".json?apikey=" + sunlightapi + "&callback=?&" + parameters; }

		var month = "201111";
		var interval = width / 24;

		for(var i = 0; i < 24; i++) {
			var y = Math.floor(i/12) + 2011;
			var m = i%12 + 1;
			if(m < 10) { m = "0"+m; }

			var month = ""+y+m;

			var words_request = request_url("phrases", "entity_type=month&entity_value="+month+"&n=2");

			//console.log(words_request);
			/*
			$.getJSON(words_request, function(data) {
				console.log(data);
			});
			*/

		}
		
	},
	draw : function() {


	},
	cleanup : function() {

	},
}

cf = {
	svg : null,
	data : null,
	stack : null,
	area : null,
	scale : {
		x : null,
		y : null
	},
	highlighted : false,
	init : function() {
		// fake data
		function fakeData(n) {

		  function bump(a) {
		    var x = 1 / (.1 + Math.random()),
		        y = 2 * Math.random() - .5,
		        z = 10 / (.1 + Math.random());
		    for (var i = 0; i < n; i++) {
		      var w = (i / n - y) * z;
		      a[i] += x * Math.exp(-w * w);
		    }
		  }

		  var a = [], i;
		  for (i = 0; i < n; ++i) a[i] = 0;
		  for (i = 0; i < 5; ++i) bump(a);
		  return a.map(function(d, i) { 
		  	yvalue = Math.max(0, d);
		  	return {x: i, y: yvalue, value: yvalue }; 
		  });
		}



		n = 5, // number of layers
	    m = 104, // number of samples per layer

	    cf.stack = d3.layout.stack().offset("zero").values(function(d) { return d.values; });
	    cf.data = d3.range(n).map(function() { return { values : fakeData(m) }; });
	    cf.layer = cf.stack(cf.data);

	    cf.scale.x = d3.scale.linear()
		    .domain([0, m - 1])
		    .range([0, width]);

		cf.scale.y = d3.scale.linear()
		    .domain([0, d3.max(cf.data, function(layer) { 
		    	return d3.max(layer.values, function(d) {  return d.y0 + d.y; }); 
		    })])
		    .range([height/2, height]);

	    
	    cf.area = d3.svg.area()
		    .x(function(d) { return cf.scale.x(d.x); })
		    .y0(function(d) { return cf.scale.y(d.y0); })
		    .y1(function(d) { return cf.scale.y(d.y0 + d.y); });

	    
	 
		cf.draw();   
	},
	draw : function() {

		var color = d3.scale.linear()
		    .range(["#aad", "#556"]);

		cf.svg.selectAll("path")
		    .data(cf.data)
		  .enter().append("path")
		    .attr("d", function(d) {
		    	return cf.area(d.values);
		    })
		    .on("click", function(d, i) {
		    	if(cf.highlighted) {
		    		cf.cleanup();	
		    	} else {
		    		cf.highlight(i);
		    	}
		    })
		    .style("fill", function() { return color(Math.random()); });
	},
	highlight : function(x) {
		cf.highlighted = true;

		_.each(cf.data, function(layer, i) {
			if(x != i) {
				_.each(layer.values, function(datum) {
					datum.y = 0;
				});
			}
		});

		cf.transition();
	},
	cleanup : function() {
		cf.highlighted = false;

		_.each(cf.data, function(layer, i) {
			_.each(layer.values, function(datum) {
				datum.y = datum.value;
			});
		});

		cf.transition();
	},
	transition : function(x) {
		cf.stack(cf.data);

		cf.svg.selectAll("path")
		  .data(cf.data)
		.transition()
		  .duration(500)
		  .attr("d", function(d) {
		    	return cf.area(d.values);
		    });
	}
}

background = {
	svg : null,
	months : [ "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" ],
	init : function() {
		var interval = width / 24;

		for(var i = 0; i < 24; i++) {

			background.svg.append("svg:text")
				.attr("class", "month-label")
				.attr("dx", interval*i + 3)
				.attr("dy", height - 30)
				.text(background.months[i%12])

			background.svg.append("svg:line")
				.attr("x1", interval*i - 3)
				.attr("x2", interval*i - 3)
				.attr("y1", 0)
				.attr("y2", height)
				.attr("style", "stroke:rgb(240,240,240);stroke-width:1")

		}
	}
}

var graphics = {
	timescale : null,
	week : null,
	init : function() {
		width = $("#streamgraph").width() * 2;
    	height = $(window).height() - 100;

		svg = d3.select("#streamgraph").append("svg")
		    .attr("width", width)
		    .attr("height", height);

		cf.svg = svg.append("g");
		background.svg = svg.append("g");
		bill.svg = svg.append("g");
		
		words.svg = svg.append("g");

		startof112 = new Date(2011, 1, 3).getTime();
		endof112 = new Date(2013, 1, 3).getTime();

		graphics.timescale = d3.scale.linear()
		    .domain([startof112, endof112])
		    .range([0, width]);

		graphics.week = function(date) {
			interval = (endof112 - startof112)/104; // 104 being number of weeks
			relative = date - startof112;

			return Math.floor(relative/interval);
		}

		// Hacky Initialization
		background.init();

		bill.init();
		bill.request("3606");

		cf.init();

		words.request();
		
	}
}

$(document).ready(graphics.init);