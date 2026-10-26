(function () {
	const container = document.querySelector("#scatter-chart");
	if (!container) return;

	const technologyColors = {
		LCD: "#4e79a7",
		LED: "#f28e2b",
		OLED: "#59a14f"
	};

	// Load the television energy dataset.
	d3.csv("data/Ex5_TV_energy.csv")
		.then(function (rows) {
			// Format the measurements and normalize the LED source label.
			const data = rows.map(function (row) {
				return {
					brand: row.brand,
					screenSize: +row.screensize,
					technology: row.screen_tech === "LCD (LED)" ? "LED" : row.screen_tech,
					energy: +row.energy_consumpt,
					stars: +row.star2,
					count: +row.count
				};
			}).filter(function (row) {
				return Number.isFinite(row.energy) && Number.isFinite(row.stars) && technologyColors[row.technology];
			});
			if (!data.length) throw new Error("The television dataset has no valid observations.");

			let lastWidth = 0;
			function render() {
				const measuredWidth = container.clientWidth;
				if (measuredWidth === lastWidth) return;
				lastWidth = measuredWidth;
				container.replaceChildren();
				const width = Math.max(280, measuredWidth);
				const height = Math.max(380, Math.min(420, width * 0.78));
				const margin = { top: 44, right: 18, bottom: 78, left: 68 };
				const plotWidth = width - margin.left - margin.right;
				const plotHeight = height - margin.top - margin.bottom;

				const svg = d3.select(container)
					.append("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("preserveAspectRatio", "xMidYMid meet");

				// Scales map star ratings and annual consumption into the plot.
				const maxStars = Math.max(1.5, Math.ceil(d3.max(data, function (row) { return row.stars; }) * 2) / 2);
				const maxEnergy = Math.ceil(d3.max(data, function (row) { return row.energy; }) / 200) * 200;
				const starTicks = d3.range(1.5, maxStars + 0.25, 0.5);
				const energyTicks = d3.range(0, maxEnergy + 1, 200);
				const x = d3.scaleLinear()
					.domain([1.5, maxStars])
					.range([0, plotWidth]);
				const y = d3.scaleLinear()
					.domain([0, maxEnergy])
					.range([plotHeight, 0]);

				// Axes show each measurement with its unit.
				const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
				const grid = plot.append("g")
					.attr("class", "grid")
					.attr("aria-hidden", "true")
					.call(d3.axisLeft(y).tickValues(energyTicks).tickSize(-plotWidth).tickFormat("").tickSizeOuter(0));
				grid.select(".domain").remove();
				grid.selectAll(".tick line").attr("stroke", "#ded5ca").attr("stroke-width", 0.8);
				const xAxis = plot.append("g")
					.attr("transform", `translate(0,${plotHeight})`)
					.call(d3.axisBottom(x).tickValues(starTicks).tickFormat(d3.format(".1f")).tickSizeOuter(0));
				const yAxis = plot.append("g")
					.call(d3.axisLeft(y).tickValues(energyTicks).tickSizeOuter(0));
				[xAxis, yAxis].forEach(function (axis) {
					axis.selectAll("text").attr("font-family", "Arial, sans-serif").attr("font-size", 12).attr("fill", "#4b4b4b");
					axis.selectAll(".domain, .tick line").attr("stroke", "#8c8176");
				});
				const starTickSpacing = plotWidth / Math.max(1, starTicks.length - 1);
				if (starTickSpacing < 34) {
					xAxis.selectAll(".tick text")
						.attr("transform", "rotate(-45)")
						.attr("text-anchor", "end")
						.attr("dx", "-0.45em")
						.attr("dy", "0.2em")
						.attr("font-size", 10);
				}
				svg.append("text")
					.attr("x", margin.left + plotWidth / 2)
					.attr("y", height - 12)
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 13)
					.attr("fill", "#3f3025")
					.text("Star rating");
				svg.append("text")
					.attr("transform", `translate(17,${margin.top + plotHeight / 2}) rotate(-90)`)
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 13)
					.attr("fill", "#3f3025")
					.text("Energy consumption (kWh/year)");

				// Draw observations above the grid so dense regions remain readable.
				plot.selectAll("circle.observation")
					.data(data)
					.join("circle")
					.attr("class", "observation")
					.attr("cx", function (row) { return x(row.stars); })
					.attr("cy", function (row) { return y(row.energy); })
					.attr("r", 2.7)
					.attr("fill", function (row) { return technologyColors[row.technology]; })
					.attr("fill-opacity", 0.45)
					.append("title")
					.text(function (row) { return `${row.technology} | ${row.stars} stars | ${d3.format(".1f")(row.energy)} kWh/year | listed count: ${row.count}`; });

				const legend = svg.append("g").attr("transform", `translate(${margin.left},16)`);
				Object.entries(technologyColors).forEach(function (entry, index) {
					const item = legend.append("g")
						.attr("transform", `translate(${index * (plotWidth / 3)},0)`);
					item.append("circle").attr("r", 4).attr("cy", 4).attr("fill", entry[1]);
					item.append("text")
						.attr("x", 9)
						.attr("y", 8)
						.attr("font-family", "Arial, sans-serif")
						.attr("font-size", 12)
						.attr("fill", "#3f3025")
						.text(entry[0]);
				});
			}

			render();
			new ResizeObserver(render).observe(container);
		})
		.catch(function (error) {
			console.error("Could not load scatter chart data:", error);
			container.innerHTML = '<p class="chart-error">Scatter chart data could not be loaded. Check that the page is served from the project folder and the CSV file is available.</p>';
		});
}());
