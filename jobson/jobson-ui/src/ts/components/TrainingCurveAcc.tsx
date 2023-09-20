import React, { useRef, useEffect } from 'react';
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

function TrainingCurveAcc({ validationData, trainingData }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

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
        .text("Time in seconds"));

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
        .text("Accuracy"));

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    // Legend
    const legend = svg.append("g")
      .attr("font-family", "IBM Plex Mono")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(["Validation Accuracy", "Training Accuracy"])
      .enter().append("g")
      .attr("transform", (d, i) => `translate(-20,${20 * i})`);

    legend.append("line")
      .attr("x1", width - 19)
      .attr("x2", width - 5)
      .attr("stroke", d => d === "Validation Accuracy" ? "black" : "gray")
      .attr("stroke-dasharray", d => d === "Training Accuracy" ? "5 5" : "");

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d);

  }, [validationData, trainingData]);

  return <svg ref={svgRef} viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" />;

}

export default TrainingCurveAcc;
