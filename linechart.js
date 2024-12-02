// Load CSV file
d3.csv("crime_cleaned.csv").then((data) => {
  // Parse necessary fields
  data.forEach((d) => {
    d.YEAR = +d.YEAR;
    d.MONTH = +d.MONTH;
    d.VIOLENT_CRIME = +d.VIOLENT_CRIME;
  });

  // Filter data for years 2016, 2017, and 2018
  const filteredData = data.filter(
    (d) => d.YEAR >= 2015 && d.YEAR <= 2018 && d.VIOLENT_CRIME === 1
  );

  // Aggregate total violent crimes by month and year
  const aggregatedData = d3.rollups(
    filteredData,
    (v) => v.length,
    (d) => d.YEAR,
    (d) => d.MONTH
  );

  const aggregatedArray = Array.from(aggregatedData, ([year, months]) => ({
    year,
    values: Array.from(months, ([month, count]) => ({ month, count })).sort(
      (a, b) => a.month - b.month // Sort months in ascending order
    ),
  }));

  // Set up SVG dimensions and margins
  const width = 1000,
    height = 600,
    margin = { top: 50, right: 150, bottom: 50, left: 100 };

  const svg = d3
    .select("body")
    .append("svg")
    .attr("id", "violent-crime-chart") // Added ID for the SVG
    .attr("width", width)
    .attr("height", height)
    .style("background", "white");

  // Define scales
  const xScale = d3
    .scaleLinear()
    .domain([1, 12]) // Months range from 1 to 12
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(aggregatedArray, (d) => d3.max(d.values, (v) => v.count)),
    ])
    .range([height - margin.bottom, margin.top]);

  const colorScale = d3
    .scaleOrdinal()
    .domain([2015, 2016, 2017, 2018])
    .range(["blue", "orange", "red", "skyblue"]);

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(12))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .style("font-size", "14px")
    .style("text-anchor", "middle")
    .text("Month");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  // Add y-axis label
  svg
    .append("text")
    .attr("transform", `rotate(-90)`)
    .attr("x", -(height - margin.top - margin.bottom) / 2)
    .attr("y", margin.left - 50)
    .attr("fill", "black")
    .style("font-size", "14px")
    .style("text-anchor", "middle")
    .text("Number of Violent Crimes Reported Via 911");

  // Draw lines
  const line = d3
    .line()
    .x((d) => xScale(d.month))
    .y((d) => yScale(d.count));

  svg
    .selectAll(".line")
    .data(aggregatedArray)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => line(d.values))
    .attr("fill", "none")
    .attr("stroke", (d) => colorScale(d.year))
    .attr("stroke-width", 2);

  // Add legend
  const legend = svg
    .selectAll(".legend")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr(
      "transform",
      (d, i) => `translate(${width - margin.right + 20}, ${i * 20 + 50})`
    );

  legend
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d) => colorScale(d));

  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text((d) => d)
    .style("font-size", "12px")
    .style("text-anchor", "start");
});
