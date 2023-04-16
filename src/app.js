/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * .7,
height = window.innerHeight * .8,
margin = { top: 20, bottom: 50, left: 40, right: 40 };

let svg, circles;


// let xScale;
// let yScale; ...

/* APPLICATION STATE */
let state = {
    data: [],
    selection: "All", // + YOUR FILTER SELECTION
  };
  
  /* LOAD DATA */
  // + SET YOUR DATA PATH
  d3.csv('../data/ccrbPO_0401.csv', d3.autoType).then(data => {
      console.log("loaded data:", data);
      state.data = data;
      init();
    });
  
  /* INITIALIZING FUNCTION */
  // this will be run *one time* when the data finishes loading in
  function init() {
    // + SCALES
  
  
    // + AXES
  
  
    // + UI ELEMENT SETUP
  
  
    // + CREATE SVG ELEMENT
    
  
    // + CALL AXES
  
  
    draw(); // calls the draw function
  }
  
  /* DRAW FUNCTION */
  // we call this every time there is an update to the data/state
  function draw() {
    // + FILTER DATA BASED ON STATE
    const filteredData = state.data
      // .filter(d => d.country === state.selection)
  
    // + UPDATE SCALE(S), if needed
    
  
    // + UPDATE AXIS/AXES, if needed
  
  
    // UPDATE LINE GENERATOR FUNCTION
  
  
    // + DRAW LINE AND/OR AREA
    
  
  }