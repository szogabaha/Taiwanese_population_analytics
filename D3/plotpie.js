
function getEducationalData(data) {
    data.forEach(function(d){
        d.Education = Number(d.Education);
    });
    // Use reduce to transform the array
    return data.reduce((acc, obj) => {
      let eLevel;

      if (obj.Education == 0) {
          eLevel = "No";
      } else if (obj.Education >= 1 && obj.Education <= 6) {
          eLevel = "Elementary";
      } else if (obj.Education >= 7 && obj.Education <= 9) {
          eLevel = "Junior high school";
      } else if (obj.Education >= 10 && obj.Education <= 12) {
          eLevel = "Senior high school";
      } else if (obj.Education >= 13) {
          eLevel = "College+";
      } else {
          // Handle other cases if needed
          eLevel = "Unknown"; // Default value if obj.Education doesn't match any condition
      }
      
      const existingObject = acc.find(item => item.eLevel === eLevel);
      if (existingObject) {
        existingObject.Count++;
      } else {
        acc.push({ eLevel: eLevel, Count: 1 });
      }
      return acc;
    }, []);
}



function plotPie(x, y, width, height, margin, data){
    let pieWidth = width - margin.left - margin.right,
    pieHeight = height - margin.top - margin.bottom;

    const radius = Math.min(pieWidth, pieHeight) / 2;
    const educationalData = getEducationalData(data);

    const g = svg.append("g")
                .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)


    // Title
    g.append("text")
        .attr("x", pieWidth / 2)
        .attr("y",  0)
        .attr("font-size", `${fontSize}px`)
        .attr("text-anchor", "middle")
        .text("Education")

    let pie = d3.pie();
    
    var arcGenerator = d3.arc()
                          .innerRadius(5 * radius / 8)
                          .outerRadius(radius);
    
    let color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

    g.selectAll('path')
        .data(pie(educationalData.map(x => x.Count)))
        .enter()
        .append('path')
        .attr("transform", `translate(${pieWidth / 2}, ${radius + 20})`)
        .attr('d', arcGenerator)
        .attr('fill', (d,i) => color(i));

    //Legend
    const legend = g
      .append('g')
      .attr('transform', `translate(${pieWidth / 2 + radius + 15}, ${radius})`);

    legend
    .selectAll(null)
    .data(educationalData)
    .enter()
    .append('rect')
    .attr('y', (d, i) => fontSize * i * 1.8)
    .attr('width', fontSize)
    .attr('height', fontSize)
    .attr('fill', (d, i) => color(i))
    .attr('stroke', 'grey')
    .style('stroke-width', '1px');

  legend
    .selectAll(null)
    .data(educationalData)
    .enter()
    .append('text')
    .text(d => d.eLevel)
    .attr('x', fontSize * 1.4)
    .attr('y', (d, i) => fontSize * i * 1.8 + fontSize - 2)
    .style('font-size', `${fontSize}px`);

}