import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(["stars", "forks"]);
  const [chartType, setChartType] = useState("bar");
  const [theme, setTheme] = useState("light");
  const [selectedRepos, setSelectedRepos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/trending")
      .then((response) => response.json())
      .then(setData)
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    if (data.length > 0 && selectedKeys.length > 0) {
      createChart();
    }
  }, [data, selectedKeys, chartType, theme, selectedRepos]);

  const createChart = () => {
    d3.select("#chart").selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const filteredData = selectedRepos.length > 0 ? data.filter(repo => selectedRepos.includes(repo.name)) : data;

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(filteredData.map((d) => d.name));
    y.domain([0, d3.max(filteredData, (d) => Math.max(...selectedKeys.map((key) => d[key])))]);

    const color = d3.scaleOrdinal(theme === "light" ? d3.schemeCategory10 : d3.schemeDark2);

    switch (chartType) {
      case "bar":
        createBarChart(svg, x, y, color, filteredData);
        break;
      case "line":
        createLineChart(svg, x, y, color, filteredData);
        break;
      case "scatter":
        createScatterPlot(svg, x, y, color, filteredData);
        break;
      case "area":
        createAreaChart(svg, x, y, color, filteredData);
        break;
      default:
        createBarChart(svg, x, y, color, filteredData);
    }

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d3.format(".2s")))
      .selectAll("text")
      .style("font-size", "12px");

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .text("Repository Name")
      .style("font-size", "14px");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Value")
      .style("font-size", "14px");

    // Add legend
    const legend = svg.selectAll(".legend")
      .data(selectedKeys)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d);
  };

  const createBarChart = (svg, x, y, color, data) => {
    selectedKeys.forEach((key, i) => {
      svg.selectAll(`.bar-${key}`)
        .data(data)
        .enter().append("rect")
        .attr("class", `bar bar-${key}`)
        .attr("x", d => x(d.name) + (x.bandwidth() / selectedKeys.length) * i)
        .attr("width", x.bandwidth() / selectedKeys.length)
        .attr("y", d => y(d[key]))
        .attr("height", d => y(0) - y(d[key]))
        .attr("fill", color(key))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
    });
  };

  const createLineChart = (svg, x, y, color, data) => {
    selectedKeys.forEach(key => {
      const line = d3.line()
        .x(d => x(d.name) + x.bandwidth() / 2)
        .y(d => y(d[key]));

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color(key))
        .attr("stroke-width", 2)
        .attr("d", line);

      svg.selectAll(`.dot-${key}`)
        .data(data)
        .enter().append("circle")
        .attr("class", `dot dot-${key}`)
        .attr("cx", d => x(d.name) + x.bandwidth() / 2)
        .attr("cy", d => y(d[key]))
        .attr("r", 4)
        .attr("fill", color(key))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
    });
  };

  const createScatterPlot = (svg, x, y, color, data) => {
    selectedKeys.forEach(key => {
      svg.selectAll(`.dot-${key}`)
        .data(data)
        .enter().append("circle")
        .attr("class", `dot dot-${key}`)
        .attr("cx", d => x(d.name) + x.bandwidth() / 2)
        .attr("cy", d => y(d[key]))
        .attr("r", 5)
        .attr("fill", color(key))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
    });
  };

  const createAreaChart = (svg, x, y, color, data) => {
    selectedKeys.forEach(key => {
      const area = d3.area()
        .x(d => x(d.name) + x.bandwidth() / 2)
        .y0(y(0))
        .y1(d => y(d[key]));

      svg.append("path")
        .datum(data)
        .attr("fill", color(key))
        .attr("fill-opacity", 0.5)
        .attr("stroke", color(key))
        .attr("stroke-width", 2)
        .attr("d", area);
    });
  };

  const showTooltip = (event, d) => {
    const tooltip = d3.select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
    tooltip.html(`${d.name}<br/>${selectedKeys.map(key => `${key}: ${d[key]}`).join("<br/>")}`)
      .style("left", (event.pageX) + "px")
      .style("top", (event.pageY - 28) + "px");
  };

  const hideTooltip = () => {
    d3.select("#chart").selectAll(".tooltip").remove();
  };

  const handleKeyChange = (key) => {
    setSelectedKeys(prevKeys =>
      prevKeys.includes(key) ? prevKeys.filter(k => k !== key) : [...prevKeys, key]
    );
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepos(prevRepos =>
      prevRepos.includes(repo) ? prevRepos.filter(r => r !== repo) : [...prevRepos, repo]
    );
  };

  return (
    <div className={`App ${theme}`}>
      <header>
        <h1>GitHub Trending Repositories Dashboard</h1>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Toggle Theme
        </button>
      </header>
      <div className="dashboard">
        <div className="controls">
          <div className="control-group">
            <h3>Select Repositories:</h3>
            <div className="checkbox-group">
              {data.map(repo => (
                <label key={repo.name} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedRepos.includes(repo.name)}
                    onChange={() => handleRepoSelect(repo.name)}
                  />
                  {repo.name}
                </label>
              ))}
            </div>
          </div>
          <div className="control-group">
            <h3>Select data to display:</h3>
            <div className="checkbox-group">
              {Object.keys(data[0] || {})
                .filter(key => !["name", "full_name", "description", "language", "cluster"].includes(key))
                .map((key) => (
                  <label key={key} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(key)}
                      onChange={() => handleKeyChange(key)}
                    />
                    {key}
                  </label>
                ))}
            </div>
          </div>
          <div className="control-group">
            <h3>Chart Type:</h3>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="chart-select"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
        </div>
        <div id="chart" className="chart-container"></div>
      </div>
    </div>
  );
};

export default App;
