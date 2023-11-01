let fontSize = 18;

let barLeft = 0, barTop = 10;
let barTotalWidth = 1000, barTotalHeight = 250;
let barMargin = {top: 30, right: 30, bottom: 40, left: 100};

let pieLeft = 1000, pieTop = 10;
let pieTotalWidth = 600, pieTotalHeight = 250;
let pieMargin = {top: 30, right: 30, bottom: 40, left: 20};
    

let scatterLeft = 0, scatterTop = 300;
let scatterTotalWidth = 800, scatterTotalHeight = 500
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 100};

let mapLeft = 800, mapTop = 300;
let mapTotalWidth = 700, mapTotalHeight = 600
let mapMargin = {top: 10, right: 30, bottom: 30, left: 100};
let legendLabels = [157, 168, 180, 191, 203, 214, 226];

    

const svg = d3.select("#chart-area").append("svg")
    .attr("width", 2000)
    .attr("height", 2000);

d3.csv("data_loc.csv").then(data =>{
    plotBar(barLeft, barTop, barTotalWidth, barTotalHeight, barMargin, data);
    plotPie(pieLeft, pieTop, pieTotalWidth, pieTotalHeight, pieMargin, data);
    plotScatter(scatterLeft, scatterTop, scatterTotalWidth, scatterTotalHeight, scatterMargin, data);
    plotTaiwan(mapLeft, mapTop, mapTotalWidth, mapTotalHeight, mapMargin, data, legendLabels);
}).catch(function(error){
    console.log(error);
});