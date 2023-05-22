import * as d3 from "d3";
  /**
 * CONSTANTS AND GLOBALS
 * */
const h = 1800
const w = 1300
const m = {
    top: 30,
    bottom: 30,
    left: 80,
    right: 80,
}
const width = w - (m.left + m.right)
const height = h - (m.top + m.bottom)
let svg, chartContainer, diagramContainer, colorScale, barHscale, barFigures, legendC, legend, legendData;
let officersByFilter = [];
let numRows = 67;
let numCols = 68;
let circleRadius = 3.5;
let filterAxis = null;

let gridRows = 34
let gridCols = 122
let tDuration = 600

/**
* APPLICATION STATE
* */
let state = {
    data: [],
    filteredData: [],
    btnFilter: "All",
    filterData: [],
    legCol: null,
};

function wrap(text, wrapWidth, yAxisAdjustment = 0) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, 
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) - yAxisAdjustment,
        tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y - 8).attr("dy", `${dy}em`).attr("text-anchor", "end");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > wrapWidth) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
  return 0;
}
//https://observablehq.com/@gerardofurtado/wildlife-support-vs-submarines

/**
* LOAD DATA
* */
import('../data/ccrbPO_0519_act_totSubComp1.json').then(data => {
    state.data = data;
    init();
  });


function filterFun (uFilter){
    let xScale, yScales, yScale, filterBand;
    if (uFilter === "Current_Rank" || uFilter === "Officer_Race"
    || uFilter === "Officer_Gender"){

        officersByFilter = d3.group(state.data, d=>d[uFilter]);
        let uniqueFilter = Array.from(officersByFilter.keys());
        console.log("unique filter", uniqueFilter)

        let filterCount = d3.rollup(state.data, v=>v.length, d=>d[uFilter])
        console.log("filtercount", filterCount)

        let filterCountMax = d3.max(Array.from(filterCount.values()))

        console.log("filtercountmax", filterCountMax)
        barHscale = d3.scaleLinear()
            .domain([0, filterCountMax])
            .range([m.left, width - m.right])
    

        filterBand = d3.scaleBand()
        .domain(uniqueFilter)
        .range([m.top, height])
        .padding(0.1);
    
        const filterDataByUniqueFilter = [];


// Create xScale
        xScale = d3.scaleBand()
        .domain(d3.range(gridCols))
        .range([m.left, width - m.right]);

// Create yScales for each unique filter value
        yScales = new Map();
        uniqueFilter.forEach(filter => {
            const filteredData = state.filterData.filter(d => d[uFilter] === filter);

            const yScale = d3.scaleBand()
            .domain(d3.range(gridRows))
            .range([filterBand(filter) + 10, filterBand(filter) + filterBand.bandwidth()]);

            yScales.set(filter, yScale);

            const filteredDataWithPosition = filteredData.map((d, i) => ({
                ...d,
                position: [
                xScale(Math.floor(i / gridRows)),
                yScale((i % gridRows))
                ]
            }));

            filterDataByUniqueFilter.push(filteredDataWithPosition);
        });

        state.filterData = filterDataByUniqueFilter.flat();
              
    //Add or remove axis
        if (filterAxis) {
            filterAxis.remove();
          }

        filterAxis = svg.append('g')
        .classed("filter-axis", true)
        .call(d3.axisLeft(filterBand)
            .tickPadding(5)
            .tickSize(0))
        .style('opacity', 0)
        .attr("transform", `translate(${m.left * 1.5},${m.top})`);

        setTimeout(() => {
          filterAxis.selectAll(".tick text").style("font-size", "12px").call(wrap, 70);
        }, 0);
      
        filterAxis.selectAll("path").style("opacity", 0);

        filterAxis.select(".domain").remove(); 

        let totalOfficers = state.data.length;
        console.log("totaloff", totalOfficers)
        if (barFigures) {
            barFigures.remove();
          }

        barFigures = svg.append('g')
        .attr('class', 'bar-figure')
        .selectAll('text')
        .data(Array.from(filterCount), d => d[0])
        .join(
          enter => enter
            .append('text')
            .attr('class', 'bar-figure')
            .attr('id', d => `bar-figure-${d[0]}`)
            .attr("x", d => barHscale(d[1])+80)
            .attr('y', d => filterBand(d[0]) + filterBand.bandwidth()/1.5) //need to fix
            .text((d) => `${d[1]} (${((d[1] / totalOfficers) * 100).toFixed(2)}%)`)
            .style('font-size', 24)
            .style('fill', 'white')
            .style('opacity', 0),
            
          update => update,
            
          exit => exit.remove()
        );
    }
    else if (uFilter === "All"){
        yScale = d3.scaleBand()
        .range([height-m.top, m.bottom])
        .domain(d3.range(numRows));

        xScale = d3.scaleBand()
        .domain(d3.range(numCols))
        .range([m.left, width - m.right]);

        state.filterData = state.data.map((d, i) => ({
            ...d,
            officerFullName: d.Officer_First_Name + " " + d.Officer_Last_Name,
            position: [xScale(Math.floor((i) / numRows)), yScale((i) % numRows)] // Use d[uFilter] instead of filter
          }));

          if (filterAxis) {
            filterAxis.remove();
          }
          if (barFigures) {
            barFigures.remove();
          }

  }
}
//mouse events
function mouseOver(event,d) {
    d3.select(this)
        .transition()
        .duration(tDuration / 5)
        .style("cursor", "pointer")
        .attr("r", circleRadius * 2);

    tooltip
        .style("top", (event.y)+10 + "px")
        .style("left", (event.x)+1 + "px")
        .html(d.officerFullName
            + "<br>" + d.Current_Rank
        )
        .transition().duration(400)
        .style("opacity", 1);    
}

function mouseOut() {
    d3.select(this)
        .transition()
        .duration(tDuration / 5)
        .attr("r", circleRadius);
    tooltip
      .style("opacity", 1)
      .transition()
      .duration(100)
      .style("opacity", 0);
}

// Tooltip
const tooltip = d3.select("#container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", "0");

 function cardBuilder(event, d) {
    let bg = document.querySelector('.modal-bg')

    bg.classList.add('bg-active')

    let contentDiv = document.createElement('div')
    contentDiv.className = 'content-div'
    bg.appendChild(contentDiv)

    bg.addEventListener('click', function () {
        bg.innerHTML = ''
        bg.classList.remove('bg-active')
    })

    let officerInfo = document.createElement('h2')
    officerInfo.innerHTML = 
        d.officerFullName + " identifies as a " + d.Officer_Race + " " + d.Officer_Gender +
        " and is currently a(n) " + d.Current_Rank + " with the NYPD."
        + "<br>" + "<br>" + "They have " + d.Total_Substantiated_Complaints + 
        " substantiated complaint(s) against them and " + d.Total_Complaints + " total complaint(s)."
        officerInfo.setAttribute('class', 'officer-info')
        contentDiv.appendChild(officerInfo)
}

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {

    colorScale = d3.scaleThreshold()
        .domain([6, 11, 16])
        .range(["#70a5fa", "#135DD8",'#0E4399', "#082759" ])

//Create svg
    svg = d3.select("#container")
        .append("svg")
        .attr("viewBox", [0, 0, w, h]);

    diagramContainer = svg.append("g")
        .attr("class", "diagram-container")
        .attr("transform", `translate(${m.left},${m.top})`)

    chartContainer = diagramContainer.append('g')
        .attr("class", "chartContainer")

//Create legend
  let legendu5 = state.data.filter((d)=>(d.Total_Complaints <= 5));
  let legend610 = state.data.filter((d)=>(d.Total_Complaints>=6 && d.Total_Complaints<=10));
  let legend1115 = state.data.filter((d)=>(d.Total_Complaints>=11 && d.Total_Complaints<=15));
  let legendo16 = state.data.filter((d)=>(d.Total_Complaints>=16));


  legendData = [
    { color: "#70a5fa", label: "1-5 Total Complaints", dataL: legendu5 },
    { color: "#135DD8", label: "6-10 Total Complaints", dataL: legend610 },
    { color: "#0E4399", label: "11-15 Total Complaints", dataL: legend1115 },
    { color: "#082759", label: "16+ Total Complaints", dataL: legendo16 },
  ];
  
    legendC = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate (${m.left*2}, ${m.top/5})`)

    legend = legendC.selectAll('.legend')
        .data(legendData)
        .join('g')
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${m.left + i * 200}, 20)`)
        .style("cursor", "pointer")
        .on("click", legendClick);

    legend.append('circle')
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .attr("fill", d => d.color)
        .attr("value", d => d.color)
        .on("mouseover", function (event,d) {
          d3.select(this)
              .transition()
              .duration(tDuration / 5)
              .style("cursor", "pointer")
              .attr("r", 8)})
        .on("mouseout", function (event,d) {
          d3.select(this)
              .transition()
              .duration(tDuration / 5)
              .style("cursor", "pointer")
              .attr("r", 5)});

        legend.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .text(d => d.label)
        .style("text-anchor", "start")
        .style("font-size", 13)
        .style("font-weight", 200)
        .style('fill', 'aliceblue');

          
        function legendClick(event, d) {
            const isActive = d3.select(this).classed("active");
          
            d3.select(this).classed("active", !isActive);
                    
            const points = d3.selectAll(".dots").each(function(data) {
              const dot = d3.select(this);
              const matchingPoint = d.dataL.some((point) => point.Total_Complaints === data.Total_Complaints);

              if (isActive) {
                dot.style("opacity", 1);
              } else {
                if (matchingPoint) {
                  dot.style("opacity", 1);
                } else {
                  dot.style("opacity", 0.2);
                }
              }
            });
          }

        

    filterFun(state.btnFilter);

    const selectElement = d3.selectAll("button")
        selectElement
        .on("click", function () {
            state.btnFilter = this.id;
            filterFun(state.btnFilter);
            console.log(state.btnFilter);
            draw();
        })

  draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {

    let chartType = 'grid'
     
    let bars = document.querySelectorAll('.btn')
    bars.forEach(el => el.addEventListener('click', function () {
        if (chartType != 'bars') {
            chartType = 'bars';  

            filterAxis
                .transition()
                .duration(tDuration)
                .style('opacity', 1)
                .attr("fill", "#f0f6ff")
                .attr("transform", `translate(${m.left * 1.9},${m.top})`);

            barFigures
                .transition()
                .duration(tDuration*25)
                .style('opacity', 1)
                .attr("fill", "#f0f6ff");        
        }
    }))

    // let grid = document.querySelectorAll('#All')
    // grid.forEach(el => el.addEventListener('click', function () {
    //   chartContainer.selectAll(".dots")
    //       .attr("r", circleRadius*2)
    //     }))

    for (let i = 0; i < bars.length; i++) {
        bars[i].addEventListener("click", function() {
        let current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
        });
      }

    chartContainer.selectAll(".dots")
        .data(state.filterData, d => d.Tax_ID)
        .join(
            enter => enter.append("circle")
            .attr("class", "dots")
            // .transition()
            .attr('cx', (d) => d.position[0])
            .attr('cy', (d) => d.position[1])
            .attr('r', circleRadius)
            // .attr("opacity", 1)
            .attr('fill', (d)=>colorScale(d.Total_Complaints))
            // .style("visibility", "hidden")
            .on("click", cardBuilder)
            .on("mouseover", mouseOver)
            // .on("mousemove", mouseMove)
            .on("mouseout", mouseOut)
            .on("change", function (event){
              chartContainer.selectAll(".dots")
              .transition()
              .ease(d3.easeCircle)
              .delay((d, i) => i * 2)
              .duration(tDuration / 3)
              .attr("opacity", .2)
            }),


            update => update
            .on("click", cardBuilder)
            .transition()
            .ease(d3.easeCircle)
            .delay((d, i) => i * 2)
            .duration(tDuration/2)
            .attr("r", circleRadius)
            .attr('cx', (d) => d.position[0])
            .attr('cy', (d) => d.position[1]),

            exit=>exit
            .attr("opacity", 0)
            .remove()
        );
}



