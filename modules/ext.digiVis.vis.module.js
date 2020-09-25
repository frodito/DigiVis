/*jshint esversion: 6 */
/* global console*/
/* global d3*/
/* global mw */
/* global self */
(function () {

	// pairedBarChart();
	// barChartSVG();
	// bubbleChart();
	withAxis();

	// getTopicsOfArguments();

}());


/**
 * Calculate a histogram for a given array of strings
 * @param arr
 * @returns {Array}
 */
function histogram(arr) {

	let hist = [];
	$.each(arr, function (d, i) {
		if (i in hist) {
			hist[i] += 1;
		} else {
			hist[i] = 1;
		}
	});
	return hist;
}

/**
 * Retrieve all topics from pages category argument
 * @returns {Array}
 */
function getTopicsOfArguments() {

	let topics = [];

	const query = "/api.php?action=ask&format=json&query=%5B%5BIst%20Thema%3A%3A%2B%5D%5D%7C%3FIst%20Thema";
	const url = mw.config.get('wgScriptPath') + query;
	$.ajax({
		url: url,
		dataType: 'json',
		async: false,
		success: function (json) {
			// loop over key, value pairs of api-result
			$.each(json.query.results, function (k, v) {
				let title = k.replace(/^Annotation:/, '');
				const index = title.lastIndexOf("/");
				title = title.substring(0, index);
				// const published = getPublishedOfPage(title);
				$.each(v.printouts["Ist Thema"], function (k, v) {
					topics.push(v.fulltext);
				});
			});
		}
	});
	return topics;
}

/**
 * Retrieve SMW-property Published for a specific page
 * @param pagetitle
 * @returns {string}
 */
function getPublishedOfPage(pagetitle) {

	let published = "";

	const query = "/api.php?action=ask&format=json&query=[[" + pagetitle + "]]%7C%3FPublished";
	const url = mw.config.get('wgScriptPath') + query;
	$.ajax({
		url: url,
		dataType: 'json',
		async: false,
		success: function (json) {
			published = json.query.results[pagetitle].printouts.Published[0].fulltext;
		}
	});
	return published;
}

function withAxis() {

	let widthSVG = 1200,
		heightSVG = 600;

	let parseTime = d3.timeParse("%Y");

	const margin = 50;

	let topics = getTopicsOfArguments().sort();
	const yData = new Set(topics);

	const hist = histogram(topics);

	let divChart = d3.select('.withAxis');

	const svg = divChart.append("svg")
		.attr("width", widthSVG)
		.attr("height", heightSVG)
		.attr("class", "svgChart");

	const chart = svg.append("g").attr('transform', 'translate(' + margin + ',' + margin + ')');
	const width = 1100 - margin * 2;
	const height = 500 - margin * 2;

	const xAxisScale = d3.scaleTime()
		.range([0, width])
		.domain([parseTime("1945"), parseTime("2005")]);
	const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.timeFormat("%Y"));

	const yAxisScale = d3.scaleLinear().range([height, 0]).domain([0, yData.size + 1]);
	const yAxis = d3.axisLeft(yAxisScale).ticks(5).tickFormat(function (d) {
		if (d > 0) {
			return Array.from(yData)[d - 1];
		}
	});

	const lineData1 =
		[
			{"y": 2.8, "title": "Title1", "year": "1950"},
			{"y": 3.5, "title": "Title2", "year": "1975"},
			{"y": 3.1, "title": "Title3", "year": "2000"}
		];

	const lineData2 =
		[
			{"y": 0.8, "title": "Title4", "year": "1950"},
			{"y": 3.8, "title": "Title5", "year": "1975"},
			{"y": 1.5, "title": "Title6", "year": "2000"}
		];

	const lineData3 =
		[
			{"y": 4.2, "title": "Title7", "year": "1950"},
			{"y": 1.2, "title": "Title8", "year": "1975"},
			{"y": 3.8, "title": "Title9", "year": "2000"}
		];

	console.log(hist);

	drawLine(chart, lineData1, "#ff1111", "data1", xAxisScale, yAxisScale, 3, hist[Array.from(yData)[2]]);
	drawLine(chart, lineData2, "#1111ff", "data2", xAxisScale, yAxisScale, 1, hist[Array.from(yData)[0]]);
	drawLine(chart, lineData3, "#11ff11", "data3", xAxisScale, yAxisScale, 4, hist[Array.from(yData)[3]]);
	addTooltipToPoints(chart, xAxisScale, yAxisScale);

	chart.append('g')
		.call(xAxis)
		.attr("transform", 'translate(' + margin + ',' + (height + margin) + ')');
	chart.append('g')
		.call(yAxis)
		.attr("transform", 'translate(' + margin + ',' + margin + ')');
}



function drawLine(parent, data, color, name, x, y, index, thickness) {

	lData = JSON.parse(JSON.stringify(data));
	lData.unshift({"y": index, "year": x.domain()[0]});
	lData.push({"y": index, "year": x.domain()[1]});

	const line = d3.line()
		.x(function (d) { return x(new Date(d.year)) + 50; })
		.y(function (d) { return y(d.y) + 50; })
		.curve(d3.curveMonotoneX);

	console.log(thickness);

	parent.append("path")
		.datum(lData)
		.attr("class", "line")
		.attr("stroke", color)
		.attr("fill", "none")
		.attr("stroke-width", 5*thickness)
		.attr("d", line);

	drawDot(parent, data, name, x, y);
}

function drawDot(parent, data, name, x, y) {

	parent.selectAll(".dot-" + name)
		.data(data)
		.enter().append("circle")
		.attr("class", "dot-" + name)
		.attr("cx", function (d) { return x(new Date(d.year)) + 50; })
		.attr("cy", function (d) { return y(d.y) + 50; })
		.attr("r", 5);
}

function addTooltipToPoints(parent, x, y) {

	const offsetX = 70;
	const offsetY = 100;

	const circles = parent.selectAll("circle");
	circles.each(function (d, i) {
		const tooltip = d3.select(".withAxis")
			.append("div")
			.attr("class", "tooltip" + i);
		tooltip.html(d.title)
			.style("left", (x(new Date(d.year)) + offsetX) + "px")
			.style("top", (y(d.y) + offsetY) + "px")
			.style("visibility", "hidden");
	})
		.on("click", function (d, i) {
			const tooltip = d3.select(".tooltip" + i);
			tooltip
				.transition()
				.style("left", (x(new Date(d.year)) + offsetX) + "px")
				.style("top", (y(d.y) + offsetY) + "px")
				.style("visibility", tooltip.style("visibility") === "hidden" ? "visible" : "hidden")
			;
		});
}

function bubbleChart() {

	const dataset = {
		"children": [{"Name": "Olives", "Count": 4319},
			{"Name": "Tea", "Count": 4159},
			{"Name": "Mashed Potatoes", "Count": 2583},
			{"Name": "Boiled Potatoes", "Count": 2074},
			{"Name": "Milk", "Count": 1894},
			{"Name": "Chicken Salad", "Count": 1809},
			{"Name": "Vanilla Ice Cream", "Count": 1713},
			{"Name": "Cocoa", "Count": 1636},
			{"Name": "Lettuce Salad", "Count": 1566},
			{"Name": "Lobster Salad", "Count": 1511},
			{"Name": "Chocolate", "Count": 1489},
			{"Name": "Apple Pie", "Count": 1487},
			{"Name": "Orange Juice", "Count": 1423},
			{"Name": "American Cheese", "Count": 1372},
			{"Name": "Green Peas", "Count": 1341},
			{"Name": "Assorted Cakes", "Count": 1331},
			{"Name": "French Fried Potatoes", "Count": 1328},
			{"Name": "Potato Salad", "Count": 1306},
			{"Name": "Baked Potatoes", "Count": 1293},
			{"Name": "Roquefort", "Count": 1273},
			{"Name": "Stewed Prunes", "Count": 1268}]
	};

	const diameter = 600;
	const color = d3.scaleOrdinal(d3.schemeCategory10);

	const bubble = d3.pack(dataset)
		.size([diameter, diameter])
		.padding(1.5);

	const svg = d3.select(".bubblechart")
		.append("svg")
		.attr("width", diameter)
		.attr("height", diameter)
		.attr("class", "bubble");

	const nodes = d3.hierarchy(dataset)
		.sum(function (d) {
			return d.Count;
		});

	const node = svg.selectAll(".node")
		.data(bubble(nodes).descendants())
		.enter()
		.filter(function (d) {
			return !d.children;
		})
		.append("g")
		.attr("class", "node")
		.attr("transform", function (d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	node.append("title")
		.text(function (d) {
			return d.Name + ": " + d.Count;
		});

	node.append("circle")
		.attr("r", function (d) {
			return d.r;
		})
		.style("fill", function (d, i) {
			return color(i);
		});

	node.append("text")
		.attr("dy", ".2em")
		.style("text-anchor", "middle")
		.text(function (d) {
			return d.data.Name.substring(0, d.r / 3);
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", function (d) {
			return d.r / 5;
		})
		.attr("fill", "white");

	node.append("text")
		.attr("dy", "1.3em")
		.style("text-anchor", "middle")
		.text(function (d) {
			return d.data.Count;
		})
		.attr("font-family", "Gill Sans", "Gill Sans MT")
		.attr("font-size", function (d) {
			return d.r / 5;
		})
		.attr("fill", "white");

	d3.select(self.frameElement)
		.style("height", diameter + "px");
}

function barChartSVG() {

	const width = 960,
		height = 500;

	const y = d3.scaleLinear()
		.range([height, 0]);

	// const color = d3.scaleOrdinal(d3.schemeCategory10);

	const chart = d3.select(".chart")
		.attr("width", width)
		.attr("height", height);

	d3.tsv("/data/data.tsv", type)
		.then(function (data) {
			y.domain([0, d3.max(data, function (d) {
				return d.value;
			})]);

			const barWidth = width / data.length;

			const bar = chart.selectAll("g")
				.data(data)
				.enter().append("g")
				.attr("transform", function (d, i) {
					return "translate(" + i * barWidth + ",0)";
				});

			bar.append("rect")
				.classed("bar", true)
				.attr("y", function (d) {
					return y(d.value);
				})
				.attr("height", function (d) {
					return height - y(d.value);
				})
				.attr("width", barWidth - 1)
				.attr("fill", "green");

			bar.append("text")
				.attr("x", barWidth / 2)
				.attr("y", function (d) {
					return y(d.value) + 3;
				})
				.attr("dy", ".75em")
				.text(function (d) {
					return d.value;
				});
		});
}

function type(d) {
	d.value = +d.value; // coerce to number
	return d;
}

function pairedBarChart() {
	const data = [4, 8, 15, 16, 23, 42];
	const x = d3.scaleLinear()
		.domain([0, d3.max(data)])
		.range([0, 420]);

	d3.select("#digiVis-vis")
		.selectAll("div")
		.data(data)
		.enter()
		.append("div")
		.classed("barChartDiv", true)
		.style("width", function (d) {
			return x(d) + "px";
		})
		.text(function (d) {
			return d;
		});
}
