
function getAgeDistributionData(data) {
  data.forEach(function (d) {
    d.Age = Number(d.Age);
  });
  // Use reduce to transform the array
  return data.reduce((acc, obj) => {
    const existingObject = acc.find(item => item.Age === obj.Age);
    if (existingObject) {
      existingObject.Count++;
    } else {
      acc.push({ Age: obj.Age, Count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.Age - b.Age);

}

function plotBar(x, y, width, height, margin, data) {
  let barWidth = width - margin.left - margin.right,
    barHeight = height - margin.top - margin.bottom;

  const ageCounts = getAgeDistributionData(data)



  const g = svg.append("g")
    .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)


  // Title
  g.append("text")
    .attr("x", barWidth / 2)
    .attr("y", 0)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Age Distribution")

  // X label
  g.append("text")
    .attr("x", barWidth / 2)
    .attr("y", barHeight + 40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Age")

  // Y label
  g.append("text")
    .attr("x", -(barHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Count")

  // X ticks
  const xTick = d3.scaleLinear()
    .domain([0, d3.max(ageCounts, d => d.Age)])
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
    .domain([0, d3.max(ageCounts, d => d.Count)])
    .range([barHeight, 0])

  const yAxisCall = d3.axisLeft(yTick)
    .ticks(8)
  g.append("g").call(yAxisCall)

  //Rectangles
  const rects = g.selectAll("rect").data(ageCounts)

  rects.enter().append("rect")
    .attr("y", d => yTick(d.Count))
    .attr("x", d => xTick(d.Age))
    .attr("width", 7)
    .attr("height", d => barHeight - yTick(d.Count))
    .attr("fill", "lightblue")
}