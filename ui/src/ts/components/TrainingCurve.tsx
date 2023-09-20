import React, { useRef, useEffect, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import * as d3 from 'd3';

function exponentialSmoothing(data, alpha) {
  let smoothed = [];
  let current = data[0]; // Initializing with the first data point

  for (let i = 0; i < data.length; i++) {
    current = alpha * data[i] + (1 - alpha) * current;
    smoothed.push(current);
  }
  return smoothed;
}

function TrainingCurve({ validationData, trainingData, xAxisLabel = "Time in seconds", yAxisLabel = "Loss"  }) {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Define the resize observer
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    // Attach the observer to the SVG
    resizeObserver.observe(svgRef.current);

    // Cleanup
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return; // Skip if width or height is not yet set

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;  // Use dynamic width and height
    const margin = { top: 15, right: 15, bottom: 20, left: 40 };


    const smoothedValidationData = exponentialSmoothing(validationData, 0.2);
    const smoothedTrainingData = exponentialSmoothing(trainingData, 0.2);

    const allData = smoothedValidationData.concat(smoothedTrainingData);


    const x = d3.scaleLinear()
      .domain([0, Math.max(validationData.length, trainingData.length) - 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(allData), d3.max(allData)]).nice()
      .range([height - margin.bottom, margin.top]);

    const makeLine = (data, color, dashArray) => {
      const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("stroke-dasharray", dashArray);
      
      svg.selectAll()
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => x(i))
        .attr("cy", d => y(d))
        .attr("r", 3)
        .attr("fill", color)
    };

    // Draw the two lines
    makeLine(smoothedValidationData, "black", "");
    makeLine(smoothedTrainingData, "gray", "5 5");

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .call(g => g.append("text")
        .attr("x", width - margin.right)
        .attr("y", -10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .attr("font-family", "IBM Plex Mono")
        .attr("font-size", "12px")
        .text(xAxisLabel));

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
      .call(g => g.append("text")
        .attr("x", 4)
        .attr("y", 12)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-family", "IBM Plex Mono")
        .attr("font-size", "12px")
        .text(yAxisLabel));

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    // Legend
    const legend = svg.append("g")
      .attr("font-family", "IBM Plex Mono")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(["Validation Loss", "Training Loss"])
      .enter().append("g")
      .attr("transform", (d, i) => `translate(-20,${20 * i})`);

    legend.append("line")
      .attr("x1", width - 19)
      .attr("x2", width - 5)
      .attr("stroke", d => d === "Validation Loss" ? "black" : "gray")
      .attr("stroke-dasharray", d => d === "Training Loss" ? "5 5" : "");

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d);

  }, [validationData, trainingData, dimensions]);

  return <svg ref={svgRef} width="100%" height="100%" />;
}

export default TrainingCurve;