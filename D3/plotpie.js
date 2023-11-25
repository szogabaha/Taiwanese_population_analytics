
function getEducationLevel(obj) {
    switch (true) {
        case obj.Education === 0:
            return "No";
        case obj.Education >= 1 && obj.Education <= 6:
            return "Elementary";
        case obj.Education >= 7 && obj.Education <= 9:
            return "Junior high school";
        case obj.Education >= 10 && obj.Education <= 12:
            return "Senior high school";
        case obj.Education >= 13:
            return "College+";
        default:
            return "Unknown"; // Default value if obj.Education doesn't match any condition
    }
}

function getEducationValue(elevel) {
    const educationMapping = {
        "No": 0,
        "Elementary": 1,
        "Junior high school": 7,
        "Senior high school": 10,
        "College+": 13,
    };
    return educationMapping[elevel] || -1;
}


function getEducationalData(data) {
    data.forEach(function (d) {
        d.Education = Number(d.Education);
    });

    // Use reduce to transform the array
    unsorted = data.reduce((acc, obj) => {
        let eLevel = getEducationLevel(obj);
        const existingObject = acc.find(item => item.eLevel === eLevel);
        if (existingObject) {
            existingObject.Count++;
            if (obj.selected) {
                existingObject.SelectedCount++;
            }
        } else {
            const newObj = { eLevel: eLevel, Count: 1, SelectedCount: obj.selected ? 1 : 0 };
            acc.push(newObj);
        }
        return acc;
    }, []);

    return unsorted.sort((a,b) => getEducationValue(a.eLevel) - getEducationValue(b.eLevel))
}

function updatePieChart(data) {
    updatedData = getEducationalData(data);
    let oldAngles = PIECHART_CONFIG["sections"].data();
    
    PIECHART_CONFIG["sections"]
        .data(PIECHART_CONFIG["pie"](updatedData.map(x => x.SelectedCount)))
        .transition()
        .duration(TRANSITION_TIME)
        .attrTween('d', function(d) {
            let starti = d3.interpolate(oldAngles[d.index].startAngle, d.startAngle);
            let endi = d3.interpolate(oldAngles[d.index].endAngle, d.endAngle);
            return function(t) {
                d.startAngle = starti(t);
                d.endAngle = endi(t);
                return PIECHART_CONFIG["arcGenerator"](d);
            }
        });


}

var PIECHART_CONFIG = null;

function plotPie(x, y, width, height, margin, data) {
    let pieWidth = width - margin.left - margin.right,
        pieHeight = height - margin.top - margin.bottom;

    const radius = Math.min(pieWidth, pieHeight) / 2;
    const educationalData = getEducationalData(data);

    const g = svg.append("g")
        .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)


    // Title
    addLabel(g,"Education", pieWidth / 2, 0, false);
    
    let pie = d3.pie().sort((a,b) => (getEducationValue(a) - getEducationValue(b)));

    var arcGenerator = d3.arc()
        .innerRadius(5 * radius / 8)
        .outerRadius(radius);

    let color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);


    let path = g.selectAll('path')
        .data(pie(educationalData.map(x => x.Count)))
        .enter()
        .append('path')
        .attr("transform", `translate(${pieWidth / 2}, ${radius + 20})`)
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => color(i));

    //Legend
    const legend = g
        .append('g')
        .attr('transform', `translate(${pieWidth / 2 + radius + 15}, ${radius})`);

    let legendBoxes = legend.append('g')
        .selectAll("rect")
        .data(educationalData)
        .enter()
        .append('rect')
        .attr('y', (d, i) => FONT_SIZE * i * 1.8)
        .attr('width', FONT_SIZE)
        .attr('height', FONT_SIZE)
        .attr('fill', (d, i) => color(i))
        .attr('stroke', 'black')
        .style('stroke-width', '1px')
        .on('click', function (event, d) {
            const isSelected = d3.select(this).style('stroke-width') === '3px';

            // Reset stroke width of all rectangles
            legendBoxes.style('stroke-width', '1px');
            data.map(e => e["pieSelected"] = true);

            if (!isSelected) {// Set stroke width of the clicked rectangle to '5px'
                d3.select(this).style('stroke-width', '3px');
                data.map(e => {
                    e["pieSelected"] = event.eLevel === getEducationLevel(e);
                });
            }

            updateCharts(data);

        });


    legend.append('g')
        .selectAll(null)
        .data(educationalData)
        .enter()
        .append('text')
        .text(d => d.eLevel)
        .attr('x', FONT_SIZE * 1.4)
        .attr('y', (d, i) => FONT_SIZE * i * 1.8 + FONT_SIZE - 2)
        .style('font-size', `${FONT_SIZE}px`);

    PIECHART_CONFIG = {
        "pie" : pie,
        "arcGenerator" : arcGenerator,
        "sections": path
    }
}