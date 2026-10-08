d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv", d => ({
    tech: d.Screen_Tech,
    energy: +d["Mean(Labelled energy consumption (kWh/year))"]
})).then(data => {

    const width = 500;
    const height = 500;
    const radius = 200;

    const svg = d3.select("#donut-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.tech))
        .range(["#c46a32", "#5a3e2b", "#d8c7b0"]);

    const pie = d3.pie()
        .value(d => d.energy);

    const arc = d3.arc()
        .innerRadius(80)
        .outerRadius(radius);

    svg.selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.tech))
        .attr("stroke", "white");

    svg.selectAll("text")
        .data(pie(data))
        .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => d.data.tech);
});