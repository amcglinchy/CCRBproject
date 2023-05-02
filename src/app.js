import * as d3 from 'd3'

  /**
 * CONSTANTS AND GLOBALS
 * */
const h = 1300
const w = 1300
const m = {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30,
}
const width = w - (m.left + m.right)
const height = h - (m.top + m.bottom)
let svg, gridContainer, barsContainer, barCircles;
let numRows = 185
let numCols = 184
let circleRadius = 2

let gridRows = 8
let gridCols = 200

/**
* APPLICATION STATE
* */
let state = {

};

/**
* LOAD DATA
* */
import('../data/ccrbPO_active_0401.json').then(data => {
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
    // let activeData = state.data.filter((d)=> (d.Active_Per_Last_Reported_Status) == 'Yes')
    let complaintNums = state.data.map((d)=>d.Total_Complaints)

    // Scales for grid
    // const yScale = d3.scaleBand()
    //     .range([0,1100])
    //     .domain(d3.range(numRows));

    // const xScale = d3.scaleBand()
    //     .range([0, 1100])
    //     .domain(d3.range(numCols));

    // const colorScale = d3.scaleOrdinal()
    //     .domain(['Police Officer', 'Detective', 'Sergeant', 'Lieutenant', 'Captain', 'Inspector', 'Chiefs and other ranks'])
    //     .range(["red", 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'])
    
    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(complaintNums)])
        .range(["#FFFFFF", "#0089FF"]);

    let officersByRace = d3.group(state.data, d=>d.Officer_Race)
    let uniqueRaces = Array.from(officersByRace.keys())
    // console.log("races", uniqueRaces);

    let raceBand = d3.scaleBand()
    .domain(uniqueRaces)
    .range([m.top, height])
    .padding(0.2)


    //Scales for bars
    let raceScales = {};
    uniqueRaces.forEach(race => {
        let gridXScale = d3.scaleBand()
            .domain(d3.range(gridCols))
            .range([m.left, width - m.right])

        let gridYScale = d3.scaleBand()
            .domain(d3.range(gridRows))
            .range([raceBand(race) + 10, raceBand(race) + raceBand.bandwidth()])

        // saves all the scales inside of the object
        raceScales[race] = {
            x: gridXScale,
            y: gridYScale
        }
    })


    //create svg
    svg = d3.select("#container")
        .append("svg")
        .attr("viewBox", [0, 0, w, h]);
        // .attr("width", width)
        // .attr("height", height);

    // gridContainer = svg.append("g")
    //     .attr("align-items", "center")
    //     .attr("transform", "translate(140,140)")
    //     .attr("class", "grid-container");
    let diagramContainer = svg.append("g")
        .attr("class", "diagram-container")
        .attr("transform", `translate(${m.left},${m.top})`)

    let chartContainer = diagramContainer.append('g')
        .attr("class", "chartContainer")

    // barsContainer = svg.append("g")
    //     .attr("align-items", "center")
    //     .attr("transform", "translate(140,140)")
    //     .attr("class", "bars-container");

    for (const race of officersByRace) {
            let raceData = race[1]
            let xScale = raceScales[race[0]].x
            let yScale = raceScales[race[0]].y

            console.log("racedata", raceData)

    barCircles = chartContainer.selectAll(`.circles-${race[0]}`)
        .data(raceData)
        .join(
            enter => enter.append('circle')
            .classed(`circles-${race[0]}`, true)
            .attr("cx", d=> xScale(Math.floor((d.Num) / gridRows)))
            .attr("cy", d=> yScale((d.Num) % gridRows))
            // .attr('cx', (d)=>xScale((d.Num)%gridCols))
            // .attr('cy', (d)=>yScale(Math.floor((d.Num)/gridCols)))
            .attr('r', circleRadius)
            .attr('fill', (d)=>colorScale(d.Total_Complaints))
        )
    }

    // gridCircles = gridContainer.selectAll("circle")
    //     .data(state.data)
    //     .join("circle")
    //     .attr("class", "circle")
    //     .attr('cx', (d)=>xScale((d.Num)%numCols))
    //     .attr('cy', (d)=>yScale(Math.floor((d.Num)/numCols)))
    //     .attr('r', circleRadius)
    //     .attr('fill', (d)=>colorScale(d.Current_Rank))
    //     // .style('stroke', 'gray');

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
            + "<br>" + "Race: "+d.Officer_Race
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

    barCircles
    .on("mouseover", mouseOver)
    .on("mousemove", mouseMove)
    .on("mouseout", mouseOut)

}