
//taiwan.features[0].properties["ISO3166"]
function getmapData(data) {
    mapData = new Map();
    data.forEach(function (d) {
        d.location = Number(d.location);
        if (mapData.has(d.location)) {
            currentCnt = mapData.get(d.location);
            mapData.set(d.location, currentCnt + 1);
        } else {
            mapData.set(d.location, 1);
        }
    });
    return mapData
}



const DATASET_CONNECTOR = new Map([
    ['ILA', 1], ['HSQ', 2], ['MIA', 3],
    ['CHA', 4], ['NAN', 5], ['YUN', 6],
    ['CYQ', 7], ['PIF', 8], ['TTT', 9],
    ['HUA', 10], ['KEE', 11], ['HSZ', 12],
    ['CYI', 13], ['TPE', 14], ['KHH', 15],
    ['TPQ', 16], ['TXG', 17], ['TNN', 18],
    ['TAO', 19]]);


function plotTaiwan(x, y, width, height, margin, data, legendLabels) {
    let mapWidth = width - margin.left - margin.right,
        mapHeight = height - margin.top - margin.bottom;
    let mapData = getmapData(data);
    d3.json("taiwan.json").then(taiwan => {
        const g = svg.append("g")
            .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)

        // Title
        g.append("text")
            .attr("x", mapWidth / 2)
            .attr("y", -margin.top)
            .attr("font-size", `${fontSize}px`)
            .attr("text-anchor", "middle")
            .text("Sample Count Map");

        // Colors
        colorDomain = [...new Set(mapData.values())].sort((a, b) => a - b);
        color = d3.scaleQuantize()
            .domain([d3.min(colorDomain), d3.max(colorDomain)])
            .range(d3.schemeGnBu[7]);


        // Map
        var projection = d3.geoMercator()
            .fitExtent([[0, 0], [width, height]], taiwan);

        var geoGenerator = d3.geoPath()
            .projection(projection);

        const m = g.append("g");
        var paths = m
            .selectAll('path')
            .data(taiwan.features)
            .enter()
            .append('path')
            .attr('stroke', "black")
            .attr('fill', d => {
                let locCode = DATASET_CONNECTOR.get(d.properties["ISO3166"]);
                if (locCode === undefined) {
                    locCode = DATASET_CONNECTOR.get("TPE");
                }
                let relatedCount = mapData.get(locCode);
                return color(relatedCount);
            })
            .attr('d', geoGenerator);

        //Legend
        const legend = g
            .append('g')
            .attr('transform', `translate(${mapWidth + 10}, ${mapHeight / 2})`)
            .attr('width', 3 * fontSize);

        legend
            .selectAll(null)
            .data(legendLabels)
            .enter()
            .append('rect')
            .attr('y', (d, i) => fontSize * i)
            .attr('width', fontSize)
            .attr('height', fontSize)
            .attr('fill', (d, i) => color(d));

        legend
            .selectAll(null)
            .data(legendLabels)
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
            .text("Population")
    }).catch(function (error) {
        console.log(error);
    });
};