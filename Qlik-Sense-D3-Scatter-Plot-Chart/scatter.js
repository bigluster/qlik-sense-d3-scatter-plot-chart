define(["jquery", "text!./scatter.css","./d3.v3.min", "./scatterUtils"], function($, cssContent) {'use strict';
    $("<style>").html(cssContent).appendTo("head");
    return {
        initialProperties : {
            version: 1.0,
            qHyperCubeDef : {                
                qDimensions : [],
                qMeasures : [],
                qInitialDataFetch : [{
                    qWidth : 4,
                    qHeight : 1000
                }]
            }
        },
        definition : {
            type : "items",
            component : "accordion",
            items : {
                dimensions : {
                    uses : "dimensions",
                    min : 1,
                    max: 1
                },
                measures : {
                    uses : "measures",
                    min : 3,
                    max: 3
                },
                sorting : {
                    uses : "sorting"
                },
                settings : {
                    uses : "settings"
                }
            }
        },
        support: {
          snapshot: true,
          export: true,
          exportData: true
        },        
        paint : function($element,layout) {   
            //console.log($element);
            //console.log(layout);

            var self = this;  
            
            senseUtils.extendLayout(layout, self);
            
            viz($element, layout, self);
        
        },
        resize:function($el,layout){
        this.paint($el,layout);
      }
    };
});


var viz = function($element, layout, _this) {
  var id = senseUtils.setupContainer($element,layout,"scatter"),
    ext_width = $element.width(),
    ext_height = $element.height(),
    classDim = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle.replace(/\s+/g, '-');    

  var data = layout.qHyperCube.qDataPages[0].qMatrix;

  var margin = {top: 50, right: 300, bottom: 50, left: 50 },
      width = ext_width - margin.left - margin.right,
      height = ext_height - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .range([0, width]);
  var y = d3.scale.linear()
      .range([height, 0]);

  var xMax = d3.max(data, function(d) { return d.measure(1).qNum; })*1.02,
    xMin = d3.min(data, function(d) { return d.measure(1).qNum; })*0.98,
    yMax = d3.max(data, function(d) { return d.measure(2).qNum; })*1.02,
    yMin = d3.min(data, function(d) { return d.measure(2).qNum; })*0.98;
    
    var xMin2 = xMin == xMax ? xMin*0.5 : xMin;
    var xMax2 = xMin == xMax ? xMax*1.5 : xMax;
    var yMin2 = yMin == yMax ? yMin*0.5 : yMin;
    var yMax2 = yMin == yMax ? yMax*1.5 : yMax;
   
     x.domain([xMin2, xMax2]).nice();
     y.domain([yMin2, yMax2]).nice();

    //x.domain(d3.extent(data, function(d) { return d.measure(1).qNum; })).nice();
    //y.domain(d3.extent(data, function(d) { return d.measure(2).qNum; })).nice(); 
   
  var color = d3.scale.category20();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-height)
      .tickFormat(d3.format(".2s"));      

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")  
      .tickSize(-width)       
      .tickFormat(d3.format(".2s"));

  var svg = d3.select("#" + id)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

  svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", margin.bottom - 10)
        .style("text-anchor", "end")
        .text(senseUtils.getMeasureLabel(1,layout));

  svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(senseUtils.getMeasureLabel(2,layout));



  var plot = svg.append("svg")
    .classed("objects", true)
      .attr("width", width)
      .attr("height", height);
    

    plot.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot "+classDim)
        .attr("id", function(d) { return d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-"); })
        .attr("r", function(d) { return d.measure(3).qNum; })
        .attr("cx", function(d) { return x(d.measure(1).qNum); })
        .attr("cy", function(d) { return y(d.measure(2).qNum); })
        .style("fill", function(d) { return color(d.dim(1).qText); })
        .on("click", function(d) {d.dim(1).qSelect();})
        .on("mouseover", function(d){
          d3.selectAll($("."+classDim+"#"+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-"))).classed("highlight",true);
              d3.selectAll($("."+classDim+"[id!="+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-")+"]")).classed("dim",true);
          })
          .on("mouseout", function(d){
              d3.selectAll($("."+classDim+"#"+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-"))).classed("highlight",false);
              d3.selectAll($("."+classDim+"[id!="+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-")+"]")).classed("dim",false);
          })
            .append("title")
            .html(function(d) {return senseUtils.getDimLabel(1,layout) + ": " + d.dim(1).qText 
                    + "<br/>" + senseUtils.getMeasureLabel(1,layout) + ": " + d.measure(1).qText
                    + "<br/>" + senseUtils.getMeasureLabel(2,layout) + ": " + d.measure(2).qText
                      });
    
     var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("circle")
        .attr("r", 5)
        .attr("cx", width + 25)
        .attr("fill", color);

    legend.append("text")
        .attr("x", width + 32)
        .attr("dy", ".35em")
        .text(function(d) { return d; }); 

    
}