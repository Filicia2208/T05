(function () {
	const container = document.querySelector("#line-chart");
	if (!container) return;

	// Load the Australian spot-price dataset.
	d3.csv("data/Ex5_ARE_Spot_Prices.csv")
		.then(function (rows) {
			// Format yearly average prices and discard rows without valid values.
			const data = rows.map(function (row) {
				return {
					year: Number(row.Year),
					price: Number(row["Average Price (notTas-Snowy)"])
				};
			}).filter(function (row) {
				return Number.isFinite(row.year) && Number.isFinite(row.price);
			}).sort(function (a, b) {
				return a.year - b.year;
			});
			if (!data.length) throw new Error("The spot-price dataset has no valid yearly averages.");

			let lastWidth = 0;
			function render() {
				const measuredWidth = container.clientWidth;
				if (measuredWidth === lastWidth) return;
				lastWidth = measuredWidth;
				container.replaceChildren();
				const width = Math.max(280, measuredWidth);
				const height = Math.max(350, Math.min(400, width * 0.74));
				const margin = { top: 24, right: 14, bottom: 86, left: 58 };
				const plotWidth = width - margin.left - margin.right;
				const plotHeight = height - margin.top - margin.bottom;
				const svg = d3.select(container)
					.append("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("preserveAspectRatio", "xMidYMid meet");

				// Scales map calendar year and average spot price to plot coordinates.
				const xTicks = d3.range(1998, 2025, 2);
				const yMax = Math.ceil(d3.max(data, function (row) { return row.price; }) / 20) * 20;
				const yTicks = d3.range(0, yMax + 1, 20);
				const x = d3.scaleLinear()
					.domain([1998, 2024])
					.range([0, plotWidth]);
				const y = d3.scaleLinear()
					.domain([0, yMax])
					.range([plotHeight, 0]);

				// Axes label the time period and price unit.
				const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
				const xAxis = plot.append("g")
					.attr("transform", `translate(0,${plotHeight})`)
					.call(d3.axisBottom(x).tickValues(xTicks).tickFormat(d3.format("d")).tickSizeOuter(0));
				const yAxis = plot.append("g")
					.call(d3.axisLeft(y).tickValues(yTicks).tickSize(-plotWidth).tickSizeOuter(0));
				[xAxis, yAxis].forEach(function (axis) {
					axis.selectAll("text").attr("font-family", "Arial, sans-serif").attr("font-size", 12).attr("fill", "#4b4b4b");
					axis.selectAll(".domain").attr("stroke", "#8c8176");
				});
				yAxis.selectAll(".tick line").attr("stroke", "#ded5ca");
				xAxis.selectAll(".tick line").attr("stroke", "#8c8176");
				if (plotWidth / (xTicks.length - 1) < 26) {
					xAxis.selectAll(".tick text")
						.attr("transform", "rotate(-90)")
						.attr("text-anchor", "end")
						.attr("dx", "-0.45em")
						.attr("dy", "0.2em")
						.attr("font-size", 10);
				}
				svg.append("text")
					.attr("x", margin.left + plotWidth / 2)
					.attr("y", height - 24)
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 13)
					.attr("fill", "#3f3025")
					.text("Year");
				svg.append("text")
					.attr("transform", `translate(17,${margin.top + plotHeight / 2}) rotate(-90)`)
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 13)
					.attr("fill", "#3f3025")
					.text("Average spot price ($/MWh)");

				// Draw the yearly average-price line and individual observations.
				const line = d3.line()
					.x(function (row) { return x(row.year); })
					.y(function (row) { return y(row.price); });
				plot.append("path")
					.datum(data)
					.attr("fill", "none")
					.attr("stroke", "#c46a32")
					.attr("stroke-width", 2.5)
					.attr("d", line);
				plot.selectAll("circle.price-point")
					.data(data)
					.join("circle")
					.attr("class", "price-point")
					.attr("cx", function (row) { return x(row.year); })
					.attr("cy", function (row) { return y(row.price); })
					.attr("r", 3)
					.attr("fill", "#c46a32")
					.append("title")
					.text(function (row) { return `${row.year}: $${d3.format(",.2f")(row.price)} / MWh`; });
			}

			render();
			new ResizeObserver(render).observe(container);
		})
		.catch(function (error) {
			console.error("Could not load line chart data:", error);
			container.innerHTML = '<p class="chart-error">Spot-price data could not be loaded. Check that the page is served from the project folder and the CSV file is available.</p>';
		});
}());
