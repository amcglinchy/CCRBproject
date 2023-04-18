import * as d3 from 'd3'

  /**
 * CONSTANTS AND GLOBALS
 * */
const h = 1000
const w = 1000
const m = {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30,
}
const width = w - (m.left + m.right)
const height = h - (m.top + m.bottom)
let svg, container;
let numRows = 185
let numCols = 184
let circleRadius = 2

/**
* APPLICATION STATE
* */
let state = {

};

/**
* LOAD DATA
* */
import('../data/ccrbPO_0401.json').then(data => {
    console.log("loaded data:", data);
    state.data = data;
    init();
  });

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {

    //Filters
    let activeData = state.data.filter((d)=> (d.Active_Per_Last_Reported_Status) == 'Yes')
    let complaintNums = activeData.map((d)=>d.Total_Complaints)

    // Scales
    const yScale = d3.scaleBand()
        .range([0,800])
        .domain(d3.range(numRows));

    const xScale = d3.scaleBand()
        .range([0, 800])
        .domain(d3.range(numCols));

    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(complaintNums)])
        .range(["#FFFFFF", "#2596be"]);

    //create svg
    svg = d3.select("#container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    container = svg.append("g")
        .attr("transform", "translate(120,120)");


    circles = container.selectAll("circle")
        .data(activeData)
        .join("circle")
        .attr("class", "circle")
        .attr('cx', (d)=>xScale((d.Num)%numCols))
        .attr('cy', (d)=>yScale(Math.floor((d.Num)/numCols)))
        .attr('r', circleRadius)
        .attr('fill', (d)=>colorScale(d.Total_Complaints))
        .style('stroke', 'black');


  draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {

    //Mouse functions
   const mouseOver = function (d){
        tooltip.style("visibility", "visible");
}

    const mouseMove = (event, d) =>{
        tooltip.style("top", (event.y)+10 + "px")
        .style("left", (event.x)+20 + "px")
        .html(d.Officer_First_Name + " " + d.Officer_Last_Name
            + "<br>" + "Rank: " + d.Current_Rank 
            + "<br>" + "Complaints: "+ d.Total_Complaints
        )
        .transition().duration(400)
        .style("opacity", 1);
    }

    const mouseOut = (e) =>{
        tooltip.transition().duration(300)
        .style("opacity", 0);
    }
  // Tooltip
    const tooltip = d3.select("#container")
    .append("div")
    .attr("class", "tooltip");

    circles
    .on("mouseover", mouseOver)
    .on("mousemove", mouseMove)
    .on("mouseout", mouseOut)


}