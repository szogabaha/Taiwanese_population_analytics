
function getScatterData(data) {
    data.forEach(function (d) {
        let hba1c = Number(d["Hb-A1C"]);
        hba1c = hba1c < 4 ? 4 : hba1c;
        hba1c = hba1c > 12 ? 12 : hba1c;
        d["Hb-A1C"] = hba1c;

        d.Age = Number(d.Age);
        d.MMSE = Number(d.MMSE);
    });
    // Use reduce to transform the array
    groupby = data.reduce((acc, obj) => {
        const selected = Number(obj.selected)
        const existingObject = acc.find(item => item.age === obj.Age && item.mmse === obj.MMSE);
        if (existingObject) {
            existingObject.count++;
            existingObject.selectedCount += selected;
            existingObject.hba1c = obj["Hb-A1C"];
        } else {
            acc.push({
                age: obj.Age,
                mmse: obj.MMSE,
                hba1c: obj["Hb-A1C"],
                count: 1,
                selectedCount: selected
            });
        }
        return acc;
    }, []);

    groupby.forEach(d => d.hba1c = Math.round(d.hba1c));
    return groupby.sort((x, y) => x.hba1c > y.hba1c);
}


function updateScatterPlot(data) {
    filtered = getScatterData(data);
    let t = d3.transition().duration(TRANSITION_TIME);

    //Update X ticks
    const xTick = d3.scaleLinear()
        .domain([d3.min(filtered, d => d.selectedCount == 0 ? Infinity : d.age), d3.max(filtered, d => d.selectedCount == 0 ? -Infinity : d.age)])
        .range([0, SCATTER_CONFIG.scatterWidth])
    const newXAxis = d3.axisBottom(xTick);
    SCATTER_CONFIG.xAxis.transition(t).call(newXAxis);

    //Update Y ticks
    const yTick = d3.scaleLinear()
        .domain([d3.min(filtered, d => d.selectedCount == 0 ? Infinity : d.mmse), d3.max(filtered, d => d.selectedCount == 0 ? -Infinity : d.mmse)])
        .range([SCATTER_CONFIG.scatterHeight, 0]);

    const newYAxis = d3.axisLeft(yTick);
    SCATTER_CONFIG.yAxis.transition(t).call(newYAxis);

    SCATTER_CONFIG.points.data(filtered).transition(t)
        .attr("cx", d => xTick(d.age))
        .attr("cy", d => yTick(d.mmse))
        .attr("r", d => d.selectedCount == 0 ? 0 : SCATTER_CONFIG.circleSize(d.selectedCount))
        .style("fill", d => SCATTER_CONFIG.color(d.hba1c))


}



var SCATTER_CONFIG = null;
function plotScatter(x, y, width, height, margin, data) {
    let scatterWidth = width - margin.left - margin.right,
        scatterHeight = height - margin.top - margin.bottom;
    const scatterData = getScatterData(data);
    const g = svg.append("g")
        .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)


    // Title and labels
    addLabel(g,"Age-MMSE-HbA1C(Size: patient count)", scatterWidth / 2, -margin.top, false);
    addLabel(g,"Age", scatterWidth / 2, scatterHeight + 40, false);
    addLabel(g,"MMSE", -(scatterHeight / 2), -40, true);
    
    // X ticks
    const xTick = d3.scaleLinear()
        .domain(d3.extent([d3.min(scatterData, d => d.age), d3.max(scatterData, d => d.age)]))
        .range([0, scatterWidth])

    const xAxisCall = d3.axisBottom(xTick).ticks(10)
    const xAxis = g.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(xAxisCall)

    // Y ticks
    const yTick = d3.scaleLinear()
        .domain([d3.min(scatterData, d => d.mmse), d3.max(scatterData, d => d.mmse)])
        .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(yTick)
    const yAxis = g.append("g").call(yAxisCall)

    //Color and size
    colorDomain = [...new Set(scatterData.map(d => d.hba1c))];
    color = d3.scaleOrdinal()
        .domain(colorDomain.slice().sort((a, b) => b - a))
        .range(d3.schemeSpectral[8]);

    circleSize = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d.count)])
        .range([3, 10]);


    // Tip
    let tip = d3.tip().attr('class', 'd3-tip').html(d =>("Hb-A1c: " + d.hba1c + " #People: " + d.count + " #MMSE: " + d.mmse + " #Age: " + d.age));
    g.call(tip);

    // Scatter
    let points = g.append('g')
        .selectAll("dot")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("cx", d => xTick(d.age))
        .attr("cy", d => yTick(d.mmse))
        .attr("r", d => circleSize(d.count))
        .style("fill", d => color(d.hba1c))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);



    //Legend
    const legend = g
        .append('g')
        .attr('transform', `translate(${scatterWidth + 10}, 0)`)
        .attr('width', 3 * FONT_SIZE);

    legend
        .selectAll(null)
        .data(colorDomain)
        .enter()
        .append('rect')
        .attr('y', (d, i) => FONT_SIZE * i)
        .attr('width', FONT_SIZE)
        .attr('height', FONT_SIZE)
        .attr('fill', (d, i) => color(d));

    legend
        .selectAll(null)
        .data(colorDomain)
        .enter()
        .append('text')
        .text(d => d)
        .attr('x', FONT_SIZE * 1.4)
        .attr('y', (d, i) => FONT_SIZE * i + FONT_SIZE)
        .style('font-size', `${FONT_SIZE}px`);


    legend.append("text")
        .attr("x", FONT_SIZE * 2)
        .attr("y", -margin.top)
        .attr("font-size", `${FONT_SIZE}px`)
        .attr("text-anchor", "middle")
        .text("Hb-A1C");


    SCATTER_CONFIG = {
        "points": points,
        "color": color,
        "circleSize": circleSize,
        "xAxis": xAxis,
        "yAxis": yAxis,
        "scatterHeight": scatterHeight,
        "scatterWidth": scatterWidth
    }
}