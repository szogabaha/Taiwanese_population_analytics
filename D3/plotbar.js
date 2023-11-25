

function getAgeDistributionData(data) {
  data.forEach(function (d) {
    d.Age = Number(d.Age);
  });
  // Use reduce to transform the array
  return data.reduce((acc, obj) => {
    const existingObject = acc.find(item => item.Age === obj.Age);
    if (existingObject) {
      existingObject.Count++;
      if(obj.selected) {
        existingObject.SelectedCount++;
      }
    } else {
      const newObj = { Age: obj.Age, Count: 1, SelectedCount: obj.selected ? 1 : 0 };
      acc.push(newObj);
    }
    return acc;
  }, []).sort((a, b) => a.Age - b.Age);

}

var BARCHART_CONFIG = null;

//Receives the filtered data!
function updateBarChart(data) {
  const selectedAgeCounts = getAgeDistributionData(data);
  const t = d3.transition().duration(TRANSITION_TIME);

  BARCHART_CONFIG.filledBars
    .data(selectedAgeCounts)
    .transition(t)
    .attr("y", (d) => BARCHART_CONFIG.yTick(d.SelectedCount))
    .attr("x", (d) => BARCHART_CONFIG.xTick(d.Age))
    .attr("width", 7)
    .attr("height", (d) => BARCHART_CONFIG.barHeight - BARCHART_CONFIG.yTick(d.SelectedCount))
    .attr("fill", "lightblue");
}

function plotBar(x, y, width, height, margin, data) {
  let barWidth = width - margin.left - margin.right,
    barHeight = height - margin.top - margin.bottom;

  const allAgeCounts = getAgeDistributionData(data)

  const g = svg.append("g")
    .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)


  // Title and labels
  addLabel(g, "Age Distribution", barWidth / 2, 10, false)
  addLabel(g, "Age", barWidth / 2, barHeight + 40, false)
  addLabel(g, "Count", -(barHeight / 2), -40, true)

  // X ticks
  const xTick = d3.scaleLinear()
    .domain([0, d3.max(allAgeCounts, d => d.Age)])
    .range([0, barWidth])

  const xAxisCall = d3.axisBottom(xTick)
  g.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(xAxisCall)
    .selectAll("text")
    .attr("x", "2")
    .attr("y", "10")

  // Y ticks
  const yTick = d3.scaleLinear()
    .domain([0, d3.max(allAgeCounts, d => d.Count)])
    .range([barHeight, 0])

  const yAxisCall = d3.axisLeft(yTick)
    .ticks(8)
  g.append("g").call(yAxisCall)


  //Rectangles
  const rects = g.append("g").selectAll("rect").data(allAgeCounts)
    .enter().append("rect")
    .attr("y", d => yTick(d.Count))
    .attr("x", d => xTick(d.Age))
    .attr("width", 7)
    .attr("height", d => barHeight - yTick(d.Count))
    .attr("stroke", "black");

    //Rectangle filling
    const selectedItemsRects = g.append("g").selectAll("rect").data(allAgeCounts)
    .enter().append("rect")
    .attr("y", d => yTick(d.Count))
    .attr("x", d => xTick(d.Age))
    .attr("width", 7)
    .attr("height", d => barHeight - yTick(d.Count))
    .attr("fill", "lightblue");
  
  var brush = d3.brushX()
  .extent([[0, 0], [barWidth, barHeight]])
  .on("end", endbrushed);

  g.call(brush);

  BARCHART_CONFIG = {
    "filledBars": selectedItemsRects,
    "xTick": xTick,
    "yTick": yTick,
    "barHeight": barHeight
  }

  function endbrushed() {
    

    var extent = d3.event.selection;
    if(extent == null) {
      data.map(d => d["barSelected"] = true)
      updateCharts(data)
      return;
    }

    data.map(original => {
      original["barSelected"] =
          xTick(original.Age) >= extent[0] &&
          xTick(original.Age) <= extent[1];
    });

    updateCharts(data);
  }
}


