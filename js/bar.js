d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv", d => ({
    tech: d.Screen_Tech,
    energy: +d["Mean(Labelled energy consumption (kWh/year))"]
})).then(data => {

    const width = 700;
    const height = 450;
    const margin = { top: 30, right: 30, bottom: 60, left: 80 };

    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto");

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.tech))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.energy)])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => xScale(d.tech))
        .attr("y", d => yScale(d.energy))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.energy))
        .attr("fill", "#c46a32");

    svg.selectAll(".label")
        .data(data)
        .join("text")
        .attr("x", d => xScale(d.tech) + xScale.bandwidth()/2)
        .attr("y", d => yScale(d.energy) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.energy.toFixed(0));
});