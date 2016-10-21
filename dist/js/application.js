"use strict";

console.log('the start of something beautiful');

//Width and height
var w = 700;
var h = 500;
var padding = 30;

//Dynamic, random dataset
var dataset = [];
var numDataPoints = 50;
var xRange = Math.random() * 1000;
var yRange = Math.random() * 1000;
for (var i = 0; i < numDataPoints; i++) {
                var newNumber1 = Math.floor(Math.random() * xRange);
                var newNumber2 = Math.floor(Math.random() * yRange);
                dataset.push([newNumber1, newNumber2]);
}

//Create scale functions
var xScale = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
                return d[0];
})]).range([padding, w - padding * 2]);

var yScale = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
                return d[1];
})]).range([h - padding, padding]);

var rScale = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
                return d[1];
})]).range([2, 5]);

//var formatAsPercentage = d3.format(".1%");

//new V4 way
//var xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(formatAsPercentage);
var xAxis = d3.axisBottom(xScale).ticks(5);
var yAxis = d3.axisLeft(yScale).ticks(5);

//Create SVG element
var svg = d3.select("#salary-pie-chart").append("svg").attr("width", w).attr("height", h);

//Create Clip Path
svg.append("clipPath") //Make a new clipPath
.attr("id", "chart-area") //Assign an ID
.append("rect") //Within the clipPath, create a new rect
.attr("x", padding) //Set rect's position and size…
.attr("y", padding).attr("width", w - padding * 3).attr("height", h - padding * 2);

//Create circles
svg.append("g").attr("id", "circles").attr("clip-path", "url(#chart-area)").selectAll("circle").data(dataset).enter().append("circle").attr("cx", function (d) {
                return xScale(d[0]);
}).attr("cy", function (d) {
                return yScale(d[1]);
}).attr("r", 5);

//Create X axis
svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (h - padding) + ")").call(xAxis);

//Create Y axis
svg.append("g").attr("class", "y axis").attr("transform", "translate(" + padding + ",0)").call(yAxis);