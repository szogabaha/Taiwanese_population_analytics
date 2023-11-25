const FONT_SIZE = 20;
const TRANSITION_TIME = 1000;

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

    

const svg = d3.select("#chart-area").append("svg")
    .attr("width", 2000)
    .attr("height", 2000);

d3.csv("data_loc.csv").then(data =>{
    //Show all data in the beginning
    data.map(d => {
        d["barSelected"] = true;
        d["pieSelected"] = true;
        d["mapSelected"] = true;
        d["selected"] = true;
    })

    plotBar(barLeft, barTop, barTotalWidth, barTotalHeight, barMargin, data);
    plotPie(pieLeft, pieTop, pieTotalWidth, pieTotalHeight, pieMargin, data);
    plotScatter(scatterLeft, scatterTop, scatterTotalWidth, scatterTotalHeight, scatterMargin, data);
    plotTaiwan(mapLeft, mapTop, mapTotalWidth, mapTotalHeight, mapMargin, data);
}).catch(function(error){
    console.log(error);
});


// Common functions

//Transition view into the updated state
function updateCharts(updated_selection) {
    updated_selection.map(x => x["selected"] = x.barSelected && x.pieSelected && x.mapSelected);
    updateBarChart(updated_selection);
    updatePieChart(updated_selection);
    updateMap(updated_selection);
    updateScatterPlot(updated_selection);
}

//Add a lable to the view. to indicates what we add the label to
function addLabel(to, label, x, y, rotated) {
    let newLabel = to.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("fill", "black")
        .attr("font-size", `${FONT_SIZE}px`)
        .attr("text-anchor", "middle")

    if(rotated) {
        newLabel.attr("transform", "rotate(-90)");
    }
    return newLabel.text(label);
}