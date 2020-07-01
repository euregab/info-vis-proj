function starPlot(id, data, options){
  var config = {
    w: 600, //width
    h: 600, //height
    margin: {
      top: 20,
      right:20,
      bottom: 20,
      left: 20}, //margin
    levels: 3, //how many levels
    maxValue: 1, //max value corresponding to the longest radius
    labelDistanceFactor: 1.25, //how much the label is distant from the guide lines
    areaOpacity: 0.35, //opacity of the inside area of the blob
    dotRadius: 3, //size of the dots that join the lines of the blob
    circlesOpacity: 0.1, //opacity of the circles of each blob
    strokeWidth: 2, //width of the stroke around the blob
    color: d3.scaleOrdinal(d3.schemeCategory10)
  }

  if('undefined' !== typeof options){
    for(var i in options){
      if('undefined' !== typeof options[i]){
        config[i] = options[i]
      }
    }
  }

  var maxDataValue = d3.max(data,
    function(i){
      return d3.max(i.map(function(o){
        return o['value']
      }))
    }); //get the max value from all values of all data elements

  var maxValue = Math.max(config.maxValue, maxDataValue);

  var allAxis = (data[0].map(function(d, i){
    return d.axis
  })), // get all the axes for the plot
    numAxis = allAxis.length, // total number of the axes
    radius = Math.min(config.w / 2, config.h / 2), //at most as long as the minimum(width, height) of window
    circleSector = Math.PI * 2 / numAxis; //radians between each axis

  var radiusScale = d3.scaleLinear()
    .range([0, radius])
    .domain([0, maxValue]); //scale for fitting the maxValue to the longest radius

  var svgWidth = config.w + config.margin.left + config.margin.right; //width of our SVG
  var svgHeight = config.h + config.margin.top + config.margin.bottom; //height of our SVG
  var plotXCenter = config.w / 2 + config.margin.left; //horizontal translation for centering our plot
  var plotYCenter = config.h / 2 + config.margin.top; //vertical translation for centering our plot

  var svg = d3.select(id).append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("class", "star" + id); //our SVG for the Starplot

  var g = svg.append("g")
    .attr("transform", "translate(" + plotXCenter + "," + plotYCenter + ")"); //group g translated so that star center is (0,0)

  var axisGrid = g.append("g").attr("class", "axisWrapper"); //group g for handling axes

  var axis = axisGrid.selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis"); //create an axis group for each axis of the data

  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function(d, i){
      return radiusScale(maxValue * 1.1) * Math.cos(circleSector * i - Math.PI / 2);
    })
    .attr("y2", function(d, i){
      return radiusScale(maxValue * 1.1 * Math.sin(circleSector * i - Math.PI / 2));
    })
    .attr("class", "line")
    .style("stroke", "gray")
    .style("stroke-width", "1.5"); //draw the lines

    axis.append("text")
      .attr("class", "legend")
      .style("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("x", function(d, i){
        return radiusScale(maxValue * config.labelDistanceFactor) * Math.cos(circleSector * i - Math.PI / 2);
      })
      .attr("y", function(d, i){
        return radiusScale(maxValue * config.labelDistanceFactor) * Math.sin(circleSector * i - Math.PI / 2);
      })
      .attr("dy", "0.35em")
      .text(function(d, i){
        return d
      }); //append the lables to each line

      var radialLine = d3.lineRadial()
            .curve(d3.curveLinearClosed)
		    .radius(function(d, i){
           return radiusScale(d.value);
         })
		    .angle(function(d, i){
          return i * circleSector;
        }); //function that draws the path that joins the data values

      var blobWrapper = g.selectAll(".plotWrapper")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "plotWrapper"); //group wrapper for each blob

      blobWrapper.append("path")
        .attr("class", "plotArea")
        .attr("d", function(d, i){
          return radialLine(d);
        })
        .style("fill", function(d, i){
          return config.color(i);
        })
        .style("stroke-width", config.strokeWidth + "px")
        .style("stroke", function(d, i){
          return config.color(i)
        })
        .style("fill-opacity", 0)
        .on("click", function(d, i){
          d3.selectAll(".plotArea")
            .transition().duration(250)
            .style("fill-opacity", 0)
            .style("stroke-opacity", config.areaOpacity);
          d3.select(this)
            .transition().duration(250)
            .style("fill-opacity", config.areaOpacity)
            .style("stroke-opacity", 1);
        })
        /*
        .on("mouseout", function(d, i){
          d3.selectAll(".plotArea")
            .transition().duration(250)
            .style("fill-opacity", 0)
            .style("stroke-opacity", 1);
        })
        */
        ; //implement animation when mouse goes over a data area

  /*
  var namesListWidth = config.w / 3;
  var namesListHeight = config.h;

  var namesContainer = d3.select(id).append("g")
      .attr("class", "namesContainer")
      .attr("width", namesListWidth)
      .attr("height", namesListHeight);
      //.attr("transform", "translate(", + svgWidth + "," + 0 + ")");

  var namesList = d3.select(".namesContainer").append("ul");

  namesList.selectAll(".name")
      .data(data)
      .enter()
      .append("li")
      .attr("class", "name");
  */
}
