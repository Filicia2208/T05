(function () {
	const container = document.querySelector("#donut-chart");
	if (!container) return;

	const technologyColors = {
		LCD: "#4e79a7",
		LED: "#f28e2b",
		OLED: "#59a14f"
	};

	// Load the all-screen-size summary dataset.
	d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv")
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
			if (!data.length) throw new Error("The all-size dataset has no valid mean values.");

			let lastWidth = 0;
			function render() {
				const measuredWidth = container.clientWidth;
				if (measuredWidth === lastWidth) return;
				lastWidth = measuredWidth;
				container.replaceChildren();
				const width = Math.max(280, measuredWidth);
				const height = Math.max(350, Math.min(390, width * 0.74));
				const radius = Math.min(width * 0.28, height * 0.29);
				const centerX = width / 2;
				const centerY = height * 0.39;
				const svg = d3.select(container)
					.append("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("preserveAspectRatio", "xMidYMid meet");

				// Scales define proportional slices; the legend retains the original units.
				const pie = d3.pie().sort(null).value(function (row) { return row.value; });
				const arc = d3.arc().innerRadius(radius * 0.58).outerRadius(radius);

				// Axes are not meaningful for a donut, so each category label includes its value and unit.
				const chart = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);
				chart.append("text")
					.attr("text-anchor", "middle")
					.attr("y", -3)
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 12)
					.attr("fill", "#66584d")
					.text("Mean annual");
				chart.append("text")
					.attr("text-anchor", "middle")
					.attr("y", 16)
					.attr("font-family", "Arial, sans-serif")
					.attr("font-size", 13)
					.attr("fill", "#3f3025")
					.text("kWh/year");

				// Draw the technology segments and a value-labeled legend.
				chart.selectAll("path.segment")
					.data(pie(data))
					.join("path")
					.attr("class", "segment")
					.attr("d", arc)
					.attr("fill", function (slice) { return technologyColors[slice.data.technology]; })
					.attr("stroke", "#fffaf2")
					.attr("stroke-width", 2);

				const legend = svg.append("g").attr("transform", `translate(${Math.max(12, (width - 205) / 2)},${height * 0.76})`);
				data.forEach(function (row, index) {
					const item = legend.append("g").attr("transform", `translate(0,${index * 21})`);
					item.append("rect")
						.attr("x", 0)
						.attr("y", -9)
						.attr("width", 10)
						.attr("height", 10)
						.attr("fill", technologyColors[row.technology]);
					item.append("text")
						.attr("x", 17)
						.attr("y", 0)
						.attr("font-family", "Arial, sans-serif")
						.attr("font-size", 12)
						.attr("fill", "#3f3025")
						.text(`${row.technology}: ${d3.format(".1f")(row.value)} kWh/year`);
				});
			}

			render();
			new ResizeObserver(render).observe(container);
		})
		.catch(function (error) {
			console.error("Could not load donut chart data:", error);
			container.innerHTML = '<p class="chart-error">Donut chart data could not be loaded. Check that the page is served from the project folder and the CSV file is available.</p>';
		});
}());
