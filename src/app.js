import * as d3 from 'd3'
import $ from "jquery";

  /**
 * CONSTANTS AND GLOBALS
 * */
const h = 1300
const w = 1300
const m = {
    top: 30,
    bottom: 30,
    left: 80,
    right: 30,
}
const width = w - (m.left + m.right)
const height = h - (m.top + m.bottom)
let svg, gridContainer, barsContainer, barCircles,
 chartContainer, diagramContainer, colorScale;
let officersByFilter = [];
let numRows = 90;
let numCols = 200;
let circleRadius = 3;
let filterScales = {};
let filterAxis;

// let filter;

let gridRows = 90
let gridCols = 210
let tDuration = 600

/**
* APPLICATION STATE
* */
let state = {
    data: [],
    filteredData: [],
    btnFilter: "Num",
    filterData: [],
};

/**
* LOAD DATA
* */
import('../data/ccrbPO_0401_active_TC1.json').then(data => {
    state.data = data;
    // console.log("data", data)
    init();
  });

  function filterF (){
    let xScale, yScale, filterBand;
    if (state.btnFilter === "Current_Rank" || state.btnFilter === "Officer_Race"
    || state.btnFilter === "Officer_Gender"){

        officersByFilter = d3.group(state.data, d=>d[state.btnFilter]);
        let uniqueFilter = Array.from(officersByFilter.keys());
        console.log("big", uniqueFilter);
        console.log("lil", officersByFilter);
    
        filterBand = d3.scaleBand()
        .domain(uniqueFilter)
        .range([m.top, height])
        .padding(0.1);
    
        uniqueFilter.forEach(filter => {
            // let gridXScale 
            xScale = d3.scaleBand()
                .domain(d3.range(gridCols))
                .range([m.left, width - m.right])
    
            // let gridYScale 
            yScale = d3.scaleBand()
                .domain(d3.range(gridRows))
                .range([filterBand(filter) + 10, filterBand(filter) + filterBand.bandwidth()])
        
            // saves all the scales inside of the object
            filterScales[filter] = {
                x: xScale,
                y: yScale
            }
        })

        filterAxis = svg.append('g')
        .classed("filter-axis", true)
        .call(d3.axisLeft(filterBand)
            .tickPadding(5)
            .tickSize(0)
        )
        .style('opacity', 0)
        .attr("transform", `translate(${m.left * 1.5},${m.top})`);
        filterAxis.select(".domain").remove();    
    }

    else if (state.btnFilter === null || state.btnFilter === "Num"){
        yScale = d3.scaleBand()
        .range([height-m.top, m.bottom])
        .domain(d3.range(gridRows));

        xScale = d3.scaleBand()
        .domain(d3.range(gridCols))
        .range([m.left, width - m.right])
  }

  state.filterData = state.data.map((d,i)=>({
    ...d,
    officerFullName: d.Officer_First_Name + " " + d.Officer_Last_Name,
    position: [xScale(Math.floor((i) / gridRows)), yScale((i) % gridRows)]
}))

draw();
}

function filterFun (uFilter){
    let xScale, yScale, filterBand;
    if (uFilter === "Current_Rank" || uFilter === "Officer_Race"
    || uFilter === "Officer_Gender"){

        officersByFilter = d3.group(state.data, d=>d[uFilter]);
        let uniqueFilter = Array.from(officersByFilter.keys());
    
        filterBand = d3.scaleBand()
        .domain(uniqueFilter)
        .range([m.top, height])
        .padding(0.1);

        // Object.entries(officersByFilter).forEach(entry=>{
        //     xScale = d3.scaleBand()
        //         .domain(d3.range(gridCols))
        //         .range([m.left, width - m.right])
    
        //     yScale = d3.scaleBand()
        //         .domain(d3.range(gridRows))
        //         .range([filterBand(entry) + 10, filterBand(entry) + filterBand.bandwidth()])
        //     })

        for (const [key] of officersByFilter.entries()) {
            xScale = d3.scaleBand()
            .domain(d3.range(gridCols))
            .range([m.left, width - m.right])

            yScale = d3.scaleBand()
            .domain(d3.range(gridRows))
            .range([filterBand(key) + 10, filterBand(key) + filterBand.bandwidth()])
        }

        console.log("filtereddata2", officersByFilter)

        filterAxis = svg.append('g')
        .classed("filter-axis", true)
        .call(d3.axisLeft(filterBand)
            .tickPadding(5)
            .tickSize(0)
        )
        .style('opacity', 0)
        .attr("transform", `translate(${m.left * 1.5},${m.top})`);
        filterAxis.select(".domain").remove();    
    }

    else if (uFilter === "Num"){
        yScale = d3.scaleBand()
        .range([height-m.top, m.bottom])
        .domain(d3.range(gridRows));

        xScale = d3.scaleBand()
        .domain(d3.range(gridCols))
        .range([m.left, width - m.right])
  }
  state.filterData = state.data.map((d,i)=>({
    ...d,
    officerFullName: d.Officer_First_Name + " " + d.Officer_Last_Name,
    position: [xScale(Math.floor((i) / gridRows)), yScale((i) % gridRows)]}))

    // draw();
}
//mouse events
function mouseOver(event,d) {
    d3.select(this)
        .transition()
        .duration(tDuration / 5)
        .style("cursor", "pointer")
        .attr("r", circleRadius * 2);

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
// const mouseMove = (event, d) =>{
//     tooltip.style("top", (event.y)+10 + "px")
//     .style("left", (event.x)+20 + "px")
//     .html(d.Officer_First_Name + " " + d.Officer_Last_Name
//         + "<br>" + "Rank: " + d.Current_Rank 
//         + "<br>" + "Complaints: "+ d.Total_Complaints
//         + "<br>" + "Race: "+d.Officer_Race
//     )
//     .transition().duration(400)
//     .style("opacity", 1);
// }

function mouseOut() {
    d3.select(this)
        .transition()
        .duration(tDuration / 5)
        .attr("r", circleRadius);
    tooltip.style("opacity", 0);
}

// Tooltip
const tooltip = d3.select("#container")
        .append("div")
        .attr("class", "tooltip");


// function update(chartType){
//     for (const filter of officersByFilter) {
//         filterData = filter[1]
//         let xScale = filterScales[filter[0]].x
//         let yScale = filterScales[filter[0]].y
//         state.data = filterData
//         // console.log("filterdata", filterData)
        
//         chartContainer.selectAll(`.dots-${filter[0]}`)
//         .data(state.data, d=>d.Num)
//         .join(
//             enter => enter.append('circle')
//             .classed(`dots-${filter[0]}`, true)
//             .style('opacity', 0)
//             .attr('fill', (d)=>colorScale(d.Total_Complaints))
//             // .attr("cx", (d, i)=> xScale(Math.floor((i) / gridRows)))
//             // .attr("cy", (d, i)=> yScale((i) % gridRows))
//             .attr("cx", width / 2)
//             .attr("cy", height / 2)
//             .attr('r', circleRadius)
//             .on("click", cardBuilder)
//             .on("mouseover", mouseOver)
//             .on("mousemove", mouseMove)
//             .on("mouseout", mouseOut)
//             .call(chartTransition),

//             update => update
//             .on("click", cardBuilder)
//             .on("mouseover", mouseOver)
//             .on("mousemove", mouseMove)
//             .on("mouseout", mouseOut)
//             .call(chartTransition),

//             exit => exit.remove()
//         )

//         function chartTransition(event) {
//             event.transition()
//                 .ease(d3.easeCircle)
//                 .delay((d, i) => i * 3)
//                 .duration(tDuration)
//                 // .attr("cx", (d, i)=> xScale(Math.floor((i) / gridRows)))
//                 // .attr("cy", (d, i)=> yScale((i) % gridRows))
//                 .attr("cx", (d, i) => chartType == "grid" ? d.x: xScale(Math.floor(i / gridRows)))
//                 .attr("cy", (d, i) => chartType == "grid" ? d.y: yScale(i % gridRows))
//                 .style('opacity', 1)
//         }
//     }
//  }

 function cardBuilder(event, d) {
    // function to build the modal with the films and series information
    let window = document.querySelector('#modal')
    let bg = document.querySelector('.modal-bg')

    bg.classList.add('bg-active')

    let card = document.createElement('div')
    card.setAttribute('id', 'card' + '-' + d.Tax_ID)
    card.setAttribute('class', 'modal-content')
    window.appendChild(card)

    let imageDiv = document.createElement('div')
    imageDiv.className = 'image-div'
    card.appendChild(imageDiv)

    let contentDiv = document.createElement('div')
    contentDiv.className = 'content-div'
    card.appendChild(contentDiv)

    let xClose = document.createElement('span')
    xClose.innerHTML = 'close'
    xClose.setAttribute('class', 'close material-icons')
    card.appendChild(xClose)
    xClose.addEventListener('click', function () {
        window.innerHTML = ''
        bg.classList.remove('bg-active')
    })

    let officerName = document.createElement('p')
    officerName.innerHTML = d.officerFullName
    officerName.setAttribute('class', 'officer-name')
    contentDiv.appendChild(officerName)

    let officerRace = document.createElement('p');
    officerRace.setAttribute('class', 'officer-race')
    officerRace.innerHTML = d.Officer_Race
    contentDiv.appendChild(officerRace);

    let officerRank = document.createElement('p');
    officerRank.setAttribute('class', 'officer-rank')
    officerRank.innerHTML = d.Current_Rank
    contentDiv.appendChild(officerRank);
}



/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {

   
    console.log("btnFilter", state.btnFilter);
    
    //Filters
    // let activeData = state.data.filter((d)=> (d.Active_Per_Last_Reported_Status) == 'Yes')
    // let complaintNums = state.data.map((d)=>d.Total_Complaints)

//  legendScale = d3.group(state.data, d=>(d.Total_Complaints <5), d=>(d.Total_Complaints > 16))
    let legendu5 = state.data.filter((d)=>(d.Total_Complaints <= 5));
    let legend615 = state.data.filter(d=>d.Total_Complaints>5 && d.Total_Complaints<=15);
    let legendo16 = state.data.filter(d=>d.Total_Complaints>15)

    let legendScale = {
        legendu5,
        legend615,
        legendo16
    }

//     state.data = state.data.map((d)=>({
//         ...d,
//        color: 
// }))

    let legendData = [
        {color: "white", label: "Less than 5 Complaints"},
        {color: "#77BFFF", label: "6-15 Complaints"},
        {color: "#0089FF", label: "Greater than 15 Complaints"}
    ]
// console.log("HELLOOO", legendScale)


//Color scales options *pick one*
    // const colorScale = d3.scaleOrdinal()
    //     .domain(['Police Officer', 'Detective', 'Sergeant', 'Lieutenant', 'Captain', 'Inspector', 'Chiefs and other ranks'])
    //     .range(["red", 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'])
    
    // const colorScale = d3.scaleLinear()
    //     .domain([0, d3.max(complaintNums)])
    //     .range(["#FFFFFF", "#0089FF"]);
    
    colorScale = d3.scaleThreshold()
        .domain([5, 15])
        .range(["white", "#77BFFF", "#0089FF"])

        // yScale = d3.scaleBand()
        // .range([height-m.top, m.bottom])
        // .domain(d3.range(gridRows));

        // xScale = d3.scaleBand()
        // .domain(d3.range(gridCols))
        // .range([m.left, width - m.right])
        // .range([0, 1100])
        // .domain(d3.range(numCols));

    //create svg
    svg = d3.select("#container")
        .append("svg")
        .attr("viewBox", [0, 0, w, h]);
        // .attr("width", width)
        // .attr("height", height);

    diagramContainer = svg.append("g")
        .attr("class", "diagram-container")
        .attr("transform", `translate(${m.left},${m.top})`)

    chartContainer = diagramContainer.append('g')
        .attr("class", "chartContainer")

    let legendC = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate (${m.left}, ${m.top/2})`)

    // let dataL = 0;
    // let offset = 30;

    let legend = legendC.selectAll('.legend')
        .data(legendData)
        .enter().append('g')
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${m.left + i * 200}, 20)`)
        .style("cursor", "pointer")
        .on("click", legendClick);

        legend.append('circle')
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .attr("fill", d => d.color);

        legend.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .text(d => d.label)
        .style("text-anchor", "start")
        .style("font-size", 13)
        .style("font-weigth", 200)
        .style('fill', 'aliceblue');


function legendClick(d) {
  const isActive = d3.select(this).classed("active");
  
  // Toggle class on click
  d3.select(this).classed("active", !isActive);

  // Filter and highlight data points
  const points = d3.selectAll(".dots")
    .filter((data) => data.color === d.color);

  if (isActive) {
    points.style("opacity", 1);
  } else {
    points.style("opacity", 0.2);
  }
}

filterFun(state.btnFilter);

const selectElement = d3.selectAll("button")
   
// selectElement
//     .data([
//         {key: "All", label: "Num"},
//         {key: "Race", label: "Officer_Race"},
//         {key: "Rank", label: "Current_Rank"},
//         {key: "Gender", label: "Officer_Gender"}
//     ])
//     .join("button")
//     .attr("value", d=>d.label)
//     .text(d=> d.key);

    selectElement
    .on("click", function () {
        state.btnFilter = this.id;
        filterFun(state.btnFilter);
        console.log(state.btnFilter);
    // update(chartType);
    draw();
})

// filterF();

  draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {

    let chartType = 'grid'
    // update(chartType);
   
    // let grid = document.querySelector('#Num')
    // grid.addEventListener('click', function () {
    //     if (chartType != 'grid') {
    //         chartType = 'grid'
    //         filterAxis.transition()
    //             .duration(tDuration)
    //             .style('opacity', 0)
    //             .attr("transform", `translate(0,${m.top})`)
   
    //         // update(chartType)
    //        //  updateBarFigures(chartType)
    //     }
    // })
   
    
    let bars = document.querySelectorAll('.btn')
    bars.forEach(el => el.addEventListener('click', function () {
        if (chartType != 'bars') {
            chartType = 'bars';
            filterAxis.transition()
                .duration(tDuration)
                .style('opacity', 1)
                .attr("fill", "white")
                .attr("transform", `translate(${m.left * 1.5},${m.top})`)
                .transition()
                .attr("opacity", 0)
   
            // update(chartType)
           //  updateBarFigures(chartType)
        }
    }))

    for (let i = 0; i < bars.length; i++) {
        bars[i].addEventListener("click", function() {
        let current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
        });
      }



    // const filteredData = state.data
    //     .filter(d => state.btnFilter === "All" || state.btnFilter === d.Current_Rank
    //     || state.btnFilter === d.Officer_Race || d.Officer_Gender)

    chartContainer.selectAll(".dots")
        .data(state.filterData, d => d.Num)
        .join(
            enter => enter.append("circle")
            .attr("class", "dots")
            // .transition()
            .attr('cx', (d) => d.position[0])
            .attr('cy', (d) => d.position[1])
            .attr('r', circleRadius)
            .attr('fill', (d)=>colorScale(d.Total_Complaints))
            // .style("visibility", "hidden")
            .on("click", cardBuilder)
            .on("mouseover", mouseOver)
            // .on("mousemove", mouseMove)
            .on("mouseout", mouseOut),

            update => update
            .on("click", cardBuilder)
            .transition()
            .ease(d3.easeCircle)
            .delay((d, i) => i * 3)
            .duration(500)
            .attr('cx', (d) => d.position[0])
            .attr('cy', (d) => d.position[1]),

            exit=>exit
            .call(sel => sel
                .attr("opacity", 1)
                .transition()
                .duration(500)
                .attr("opacity", 0)
                .remove()
        )
        );
}



