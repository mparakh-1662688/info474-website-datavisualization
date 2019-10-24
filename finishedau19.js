"use strict";
(function(){
    let data = "";
    let svgContainer = "";
    let div = "";

    const measurements = {
        width: 1000,
        height: 500,
        marginAll: 50
    }

    window.onload = function() {
        // options = d3.selectAll("body").append("select")
        //     .attr('id', "main"
        svgContainer = d3.select('body').append("svg")
            .attr('width', measurements.width)
            .attr('height', measurements.height);
        // getSelectedText();
        // d3.append("title")
        //     .text()
        d3.csv("dataEveryYear.csv")
            .then((csvData) => data = csvData)
            .then(() => makeScatterPlot());
    }


    function makeScatterPlot() {
        let time = data.map((row) => parseInt(row["time"]))
        time = time.filter( onlyUnique ); 
        const eachYear = function(d) {return d};
        div = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

        d3.select("#selectButton")
            .selectAll('myOptions')
            .data(time)
            .enter()
            .append('option')
            .attr('value',eachYear)
            .text(eachYear)

        d3.select("#selectButton").on("change", function(d) {
            let selectedOption = d3.select(this).property("value")
            // console.log(selectedOption)
            update(selectedOption, data)
        })

        console.log(data);
        let fertility_rate = data.map((row) => parseInt(row["fertility_rate"]))
        let life_expectancy = data.map((row) =>  parseFloat(row["life_expectancy"]))
        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }
        
            
        const limits = findMinMax(fertility_rate, life_expectancy)              

        let scaleX = d3.scaleLinear()
            .domain([limits.greMin - 0.5, limits.greMax + 3])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])

        let scaleY = d3.scaleLinear()
            .range([measurements.height, 0])
            .domain([0, 100]); 
        drawAxes(scaleX, scaleY)
        update("1960", data);
        function update(selectedGroup,data) {
            let dataFilter = data.filter(function(d){return d.time==selectedGroup})
            fertility_rate = dataFilter.map((row) => parseInt(row["fertility_rate"]))
            life_expectancy = dataFilter.map((row) =>  parseFloat(row["life_expectancy"]))
            makeLabels(selectedGroup);
            plotData(scaleX, scaleY, dataFilter)
        }
        makeLabels("1960");
    }

    function findMinMax(fertility_rate, life_expectancy) {
        return {
            greMin: d3.min(fertility_rate),
            greMax: d3.max(fertility_rate),
            admitMin: d3.min(life_expectancy),
            admitMax: d3.max(life_expectancy)
        }
    }

    function drawAxes(scaleX, scaleY) {
        // these are not HTML elements. They're functions!
        let xAxis = d3.axisBottom()
            .scale(scaleX)
            .tickValues(d3.range(0.5, 9.5, 0.5)).tickFormat(function (d){
                return d3.format(".1f")(d/1);})

        let yAxis = d3.axisLeft()
            .scale(scaleY)
            .tickValues(d3.range(10, 100, 5))
            
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)
        // svgContainer.append("text")
        //     .attr("class", "y label")
        //     .attr("text-anchor", "end")
        //     .attr("y", -5)
        //     .attr("x", 0)
        //     .attr("dy", ".75em")
        //     .attr("transform", "rotate(-90)")
        //     .text("Life Expectency");

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    function plotData(scaleX, scaleY, dataFilter) {
        const xMap = function(d) { return scaleX(+d["fertility_rate"]) }
        const yMap = function(d) { return scaleY(+d["life_expectancy"]) }

        let pop_data = dataFilter.map((row) => +row["pop_mlns"]);
        let pop_limits = d3.extent(pop_data);
        // make size scaling function for population
        let pop_map_func = d3.scaleLinear()
          .domain([pop_limits[0], pop_limits[1]])
          .range([3, 20]);

        d3.selectAll("svg").selectAll("circle").remove()
        const circles = svgContainer.selectAll(".dot")
            .data(dataFilter)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                // .attr('r', 3)
                .attr('r', (d) => pop_map_func(d["pop_mlns"]))
                .attr('fill', "#4286f4")
                .on("mouseover", (d) => {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Fertility: " + d.fertility_rate + "<br/>" + 
                            "Life Expectancy: " + d.life_expectancy + "<br/>" +
                            "Population: " + d.pop_mlns + "<br/>" +
                            "Year of Year: " + d.time + "<br/>" +
                            "Country: " + d.location + "<br/>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    })
                    .on("mouseout", (d) => {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    });

    }

    function makeLabels(year) {
        d3.selectAll("svg").selectAll("text.label").remove()
        svgContainer.append('text')
          .attr('x', 300)
          .attr('y', 40)
          .style('font-size', '20pt')
          .text("Life Expectency vs Fertility - " + year)
          .attr('class', "label");
    
        svgContainer.append('text')
          .attr('x', 450)
          .attr('y', 490)
          .style('font-size', '14pt')
          .text('Fertility')
          .attr('class', "label");
    
        svgContainer.append('text')
          .attr('transform', 'translate(15, 300)rotate(-90)')
          .style('font-size', '14pt')
          .text('Life Expectancy')
          .attr('class', "label");
      }






})()