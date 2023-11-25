const CURRENT_COUNT_PROPERTY = 'currentCnt';
const SELECTED_COUNT_PROPERTY = 'selectedCnt';
const DEFAULT_LOCATION_CODE = -1;
const MAP_TITLE = 'Sample Count Map';
const LEGEND_TITLE = 'Population (normalized by Max)';
var MAP_CONFIG = null;
const DATASET_CONNECTOR = new Map([
    ['ILA', 1], ['HSQ', 2], ['MIA', 3],
    ['CHA', 4], ['NAN', 5], ['YUN', 6],
    ['CYQ', 7], ['PIF', 8], ['TTT', 9],
    ['HUA', 10], ['KEE', 11], ['HSZ', 12],
    ['CYI', 13], ['TPE', 14], ['KHH', 15],
    ['TPQ', 16], ['TXG', 17], ['TNN', 18],
    ['TAO', 19]]);


//Transform received data into a format that is needed for the plot
function _getMapData(data) {
    const mapData = new Map();

    data.forEach(d => {
        const county = Number(d.location);
        const selected = Number(d.selected);

        if (!mapData.has(county)) {
            mapData.set(county, {
                [CURRENT_COUNT_PROPERTY]: 0,
                [SELECTED_COUNT_PROPERTY]: 0
            });
        }

        const counters = mapData.get(county);
        counters[CURRENT_COUNT_PROPERTY] += 1;
        counters[SELECTED_COUNT_PROPERTY] += selected;

        mapData.set(county, counters);
    });

    function __getMinMaxValues(dataMap, property) {
        const values = Array.from(dataMap.values(), obj => obj[property]);
        let min = Math.min(...values);
        let max = Math.max(...values);
        if (min === max) {
            min = 0;
            max = 1;
        }
        return { min, max };
    }

    const currentValueRange = __getMinMaxValues(mapData, CURRENT_COUNT_PROPERTY);
    const selectedValueRange = __getMinMaxValues(mapData, SELECTED_COUNT_PROPERTY);

    mapData.forEach(function (value, key, map) {
        const normalizedValue = (value[CURRENT_COUNT_PROPERTY] - currentValueRange.min) / (currentValueRange.max - currentValueRange.min);
        const normalizedSelected = (value[SELECTED_COUNT_PROPERTY] - selectedValueRange.min) / (selectedValueRange.max - selectedValueRange.min);

        value[CURRENT_COUNT_PROPERTY] = normalizedValue;
        value[SELECTED_COUNT_PROPERTY] = normalizedSelected;

        map.set(key, value);
    });

    mapData.set(DEFAULT_LOCATION_CODE, { [CURRENT_COUNT_PROPERTY]: currentValueRange.min, [SELECTED_COUNT_PROPERTY]: selectedValueRange.min });

    return mapData;
}

function updateMap(data) {
    let t = d3.transition().duration(TRANSITION_TIME);
    let mapData = _getMapData(data);
    MAP_CONFIG["paths"]
        .transition(t)
        .attr('fill', d => {
            let locCode = _getLocationCode(d.properties["ISO3166"]);
            let relatedCount = mapData.get(locCode)[SELECTED_COUNT_PROPERTY];
            return MAP_CONFIG["color"](relatedCount);
        });
}

function _getLocationCode(locISO) {
    let locCode = DATASET_CONNECTOR.get(locISO);
    return locCode === undefined ? DEFAULT_LOCATION_CODE : locCode;
}

function plotTaiwan(x, y, width, height, margin, data) {
    let mapWidth = width - margin.left - margin.right,
        mapHeight = height - margin.top - margin.bottom;
    let mapData = _getMapData(data);
    d3.json("taiwan.json").then(taiwan => {
        taiwan.features = taiwan.features.filter(x => DATASET_CONNECTOR.has(x.properties["ISO3166"]));

        const g = svg.append("g")
            .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`);

        addLabel(g, MAP_TITLE, mapWidth / 2, -margin.top, false);

        colorDomain = [...new Set(mapData.values())].map(x => x[CURRENT_COUNT_PROPERTY]).sort((a, b) => a - b);
        color = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]);

        var projection = d3.geoMercator().fitExtent([[0, 0], [width, height]], taiwan);
        var geoGenerator = d3.geoPath().projection(projection);

        const m = g.append("g");

        var paths = m
            .selectAll('path')
            .data(taiwan.features)
            .enter()
            .append('path')
            .attr('stroke', "black")
            .attr('fill', d => {
                let locCode = _getLocationCode(d.properties["ISO3166"]);
                let relatedCount = mapData.get(locCode)[CURRENT_COUNT_PROPERTY];
                return color(relatedCount);
            })
            .attr('d', geoGenerator)
            .on('click', function (event, d) {
                selectedCountyISO = event.properties["ISO3166"];

                if (MAP_CONFIG?.selected === selectedCountyISO) {
                    MAP_CONFIG["selected"] = null;
                    data.map(x => x["mapSelected"] = true);
                    updateCharts(data);
                    return;
                }

                MAP_CONFIG["selected"] = selectedCountyISO;
                data.map(x => {
                    x["mapSelected"] = x.location == _getLocationCode(selectedCountyISO);
                });
                updateCharts(data);
            });

        //1.001 so that 1 stays in range
        let legendLabels = d3.range(0, 1.001, 1 / 6).map(x => x.toFixed(2));

        const legend = g
            .append('g')
            .attr('transform', `translate(${mapWidth + 10}, ${mapHeight / 2})`)
            .attr('width', 3 * FONT_SIZE);

        legend
            .selectAll(null)
            .data(legendLabels)
            .enter()
            .append('rect')
            .attr('y', (d, i) => FONT_SIZE * i)
            .attr('width', FONT_SIZE)
            .attr('height', FONT_SIZE)
            .attr('fill', (d, i) => color(d));

        legend
            .selectAll(null)
            .data(legendLabels)
            .enter()
            .append('text')
            .text(d => d)
            .attr('x', FONT_SIZE * 1.4)
            .attr('y', (d, i) => FONT_SIZE * i + FONT_SIZE)
            .style('font-size', `${FONT_SIZE}px`);

        addLabel(legend, LEGEND_TITLE, FONT_SIZE * 2, -margin.top);

        MAP_CONFIG = {
            "paths": paths,
            "color": color,
            "selected": null
        };
    }).catch(function (error) {
        console.log(error);
    });
};
