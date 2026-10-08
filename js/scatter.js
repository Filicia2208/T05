d3.csv("data/Ex5_TV_energy.csv", d => ({
    energy: +d.energy_consumpt,
    star: +d.star2
})).then(data => {

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };

    const svg = d3.select("#scatter-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto");

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.energy)])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.star)])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d.energy))
        .attr("cy", d => yScale(d.star))
        .attr("r", 4)
        .attr("fill", "#c46a32")
        .attr("opacity", 0.7);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 15)
        .attr("text-anchor", "middle")
        .text("Energy Consumption (kWh/year)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Star Rating");
});