var width = 1920,
    height = 1080

//var colNumber = 9

var svg = d3.select("#main-container").append("svg")
  .attr("id", "chart")
  .attr("width", width)
  .attr("height", height)

var map = svg.append("g")
  .attr("class","map")

var projection = d3.geoMercator()
	.center([-100, 73])
  .scale(240)

var path = d3.geoPath()
  .projection(projection)

$("#okButton").click(function(){  
  $("path").remove()
  $("#colBar svg").remove()
  d3.queue()
    .defer(d3.json, "data/world50m.json")
    .defer(d3.csv, "data/electrification.csv")
    //.defer(d3.csv, "data/iso_3166_2_countries.csv")
    .await(dataprocess)
})


function dataprocess(error, topology, data) {
  //console.log(topology)
  //console.log(data)
  
  //$("#840").css("fill", "red") // test: U.S.A. code
  
  var colNumber = Number($("#colNum").val())
  // var colSchemeCmd = "d3.scheme"+( $("#selCol").find(":selected").text() )
  var colSel = $("#selCol").find(":selected").val()
  var colNoData = $("#noDataCol").val()
  var bgColor1 = $("#bgCol1").val()
  var bgColor2 = $("#bgCol2").val()

  //var colFunct = eval(colSchemeCmd)
  //var maxColor = colFunct[colNumber].pop()

  //chroma(colSel).brighten(3)
  var colScaleWh = chroma.scale(["white", colSel])
    //.scale()
    .correctLightness()
    .colors(colNumber+1)

  console.log(colScaleWh)

  var colScale = colScaleWh.slice(1, colNumber+1)

  // var quantizeColor = d3.scaleQuantize()
  //   .domain([minVal, maxVal])
  //   .range(['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'])
  
  var maxVal = d3.max(data, function(d) { return +d.value })
  var minVal = d3.min(data, function(d) { return +d.value })

  var quantizeColor = d3.scaleQuantize()
    .domain([minVal, maxVal])
    //.range(colFunct[colNumber].slice(1, colNumber-1))
    .range(colScale)

  $("#main-container").css("background", "linear-gradient( "+bgColor1+", "+bgColor2) 

  var countries = topojson.feature(topology, topology.objects.countries).features

  var countryPaths = map.selectAll("path")
    .data(countries)
    .enter()
    .append("path")
    .attr("id", function(d){
      return d.id
    })
    .attr("fill", function(d){
      var selectedDatum = _.find(data, function(o) { return o.id == d.id; })
      if (selectedDatum!=undefined) {
        return quantizeColor(selectedDatum.value)
      } else {
        return colNoData
      }
    })
    .attr("d", path)

  d3.select("#colBar").append("svg")
    .attr("id", "legenda")
    .attr("height", "2rem")
  .selectAll(".colSample")
    //.data(colFunct[colNumber])
    .data(colScale)
    .enter()
    .append("rect")
      .attr("width", "2rem")
      .attr("height", "2rem")
      .attr("x", function(d, i){
        return i*2+"rem"
      })
      .attr("fill", function(d){
        return d
      })

}