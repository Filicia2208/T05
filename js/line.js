d3.csv("data/Ex5_ARE_Spot_Prices.csv", d => ({
    year: +d.Year,
    price: +d["Average Price (notTas-Snowy)"]
})).then(data => {

    const width = 800;
    const height = 450;
    const margin = { top: 30, right: 30, bottom: 60, left: 70 };

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto");

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.price)])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.price));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#c46a32")
        .attr("stroke-width", 3)
        .attr("d", line);

    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.price))
        .attr("r", 3)
        .attr("fill", "#5a3e2b");
});