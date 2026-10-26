(function () {
	const container = document.querySelector("#bar-chart");
	if (!container) return;

	const technologyColors = {
		LCD: "#4e79a7",
		LED: "#f28e2b",
		OLED: "#59a14f"
	};

	// Load the 55-inch television summary dataset.
	d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv")
		.then(function (rows) {
			// Format the mean annual consumption for each screen technology.
			const data = rows.map(function (row) {
				return {
					technology: row.Screen_Tech,
					value: Number(row["Mean(Labelled energy consumption (kWh/year))"])
				};
			}).filter(function (row) {
				return Number.isFinite(row.value) && technologyColors[row.technology];
			});
			if (!data.length) throw new Error("The 55-inch dataset has no valid mean values.");

			let lastWidth = 0;
			function render() {
				const measuredWidth = container.clientWidth;
				if (measuredWidth === lastWidth) return;
				lastWidth = measuredWidth;
				container.replaceChildren();
				const width = Math.max(280, measuredWidth);
				const height = Math.max(350, Math.min(390, width * 0.74));
				const margin = { top: 52, right: 18, bottom: 62, left: 68 };
				const plotWidth = width - margin.left - margin.right;
				const plotHeight = height - margin.top - margin.bottom;
				const svg = d3.select(container)
					.append("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("preserveAspectRatio", "xMidYMid meet");

				// Scales map screen technology and mean energy consumption to plot coordinates.
				const x = d3.scaleBand()
					.domain(data.map(function (row) { return row.technology; }))
					.range([0, plotWidth])
					.padding(0.36);
				const yMax = 400;
				const yTicks = d3.range(0, yMax + 1, 50);
				const y = d3.scaleLinear()
					.domain([0, yMax])
					.range([plotHeight, 0]);

				// Axes identify the category and the annual-energy unit.
				const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
				const xAxis = plot.append("g")
					.attr("transform", `translate(0,${plotHeight})`)
					.call(d3.axisBottom(x).tickSizeOuter(0));
				const yAxis = plot.append("g")
					.call(d3.axisLeft(y).tickValues(yTicks).tickSizeOuter(0));
				[xAxis, yAxis].forEach(function (axis) {
					axis.selectAll("text").attr("font-family", "Arial, sans-serif").attr("font-size", 12).attr("fill", "#4b4b4b");
					axis.selectAll(".domain, .tick line").attr("stroke", "#8c8176");
				});
				svg.append("text")
					.attr("x", margin.left + plotWidth / 2)
					.attr("y", height - 12)
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 13)
					.attr("fill", "#3f3025")
					.text("Screen technology");
				svg.append("text")
					.attr("transform", `translate(17,${margin.top + plotHeight / 2}) rotate(-90)`)
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 13)
					.attr("fill", "#3f3025")
					.text("Mean energy consumption (kWh/year)");

				// Draw one technology-colored bar per mean value.
				plot.selectAll("rect.bar")
					.data(data)
					.join("rect")
					.attr("class", "bar")
					.attr("x", function (row) { return x(row.technology); })
					.attr("y", function (row) { return y(row.value); })
					.attr("width", x.bandwidth())
					.attr("height", function (row) { return plotHeight - y(row.value); })
					.attr("fill", function (row) { return technologyColors[row.technology]; });

				plot.selectAll("text.bar-label")
					.data(data)
					.join("text")
					.attr("class", "bar-label")
					.attr("x", function (row) { return x(row.technology) + x.bandwidth() / 2; })
					.attr("y", function (row) { return y(row.value) - 8; })
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 12)
					.attr("font-weight", 700)
					.attr("fill", "#3f3025")
					.text(function (row) { return d3.format(".1f")(row.value); });
			}

			render();
			new ResizeObserver(render).observe(container);
		})
		.catch(function (error) {
			console.error("Could not load bar chart data:", error);
			container.innerHTML = '<p class="chart-error">Bar chart data could not be loaded. Check that the page is served from the project folder and the CSV file is available.</p>';
		});
}());
