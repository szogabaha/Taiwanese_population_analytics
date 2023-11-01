
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

        const existingObject = acc.find(item => item.age === obj.Age && item.mmse === obj.MMSE);
        if (existingObject) {
            existingObject.count++;
            existingObject.hba1c = obj["Hb-A1C"];
        } else {
            acc.push({
                age: obj.Age,
                mmse: obj.MMSE,
                hba1c: obj["Hb-A1C"],
                count: 1
            });
        }
        return acc;
    }, []);

    groupby.forEach(d => d.hba1c = Math.round(d.hba1c));
    return groupby.sort((x, y) => x.hba1c > y.hba1c);
}

function plotScatter(x, y, width, height, margin, data) {
    let scatterWidth = width - margin.left - margin.right,
        scatterHeight = height - margin.top - margin.bottom;
    const scatterData = getScatterData(data);
    const g = svg.append("g")
        .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)


    // Title
    g.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -margin.top)
        .attr("font-size", `${fontSize}px`)
        .attr("text-anchor", "middle")
        .text("Age-MMSE-HbA1C(Size: patient count)")

    // X label
    g.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 40)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Age")

    // Y label
    g.append("text")
        .attr("x", -(scatterHeight / 2))
        .attr("y", -40)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Count")

    // X ticks
    const xTick = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d.age)])
        .range([0, scatterWidth])

    const xAxisCall = d3.axisBottom(xTick)
    g.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(xAxisCall)
        .selectAll("text")
        .attr("x", "2")
        .attr("y", "10")

    // Y ticks
    const yTick = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d.mmse)])
        .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(yTick)
        .ticks(10)
    g.append("g").call(yAxisCall)

    //Color and size
    colorDomain = [...new Set(scatterData.map(d => d.hba1c))];
    color = d3.scaleOrdinal()
        .domain(colorDomain.slice().sort((a, b) => b - a))
        .range(d3.schemeSpectral[8]);

    circleSize = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d.count)])
        .range([3, 10]);

    // Scatter
    g.append('g')
        .selectAll("dot")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("cx", d => xTick(d.age))
        .attr("cy", d => yTick(d.mmse))
        .attr("r", d => circleSize(d.count))
        .style("fill", d => color(d.hba1c))



    //Legend
    const legend = g
        .append('g')
        .attr('transform', `translate(${scatterWidth + 10}, 0)`)
        .attr('width', 3 * fontSize);

    legend
        .selectAll(null)
        .data(colorDomain)
        .enter()
        .append('rect')
        .attr('y', (d, i) => fontSize * i)
        .attr('width', fontSize)
        .attr('height', fontSize)
        .attr('fill', (d, i) => color(d));

    legend
        .selectAll(null)
        .data(colorDomain)
        .enter()
        .append('text')
        .text(d => d)
        .attr('x', fontSize * 1.4)
        .attr('y', (d, i) => fontSize * i + fontSize)
        .style('font-size', `${fontSize}px`);


    legend.append("text")
        .attr("x", fontSize * 2)
        .attr("y", -margin.top)
        .attr("font-size", `${fontSize}px`)
        .attr("text-anchor", "middle")
        .text("Hb-A1C")

}