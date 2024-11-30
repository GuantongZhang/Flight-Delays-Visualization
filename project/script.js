function project() {

  let part0 = function () {

    Promise.all([
      d3.csv("flight_cleaned.csv"),
      d3.csv("airport_data_cleaned.csv")
    ]).then(function ([data, airportData]) {
      part1(data);
      part2(data);
      part3(data, airportData);
    });
  }

  part0();
}

let part1 = function (data) {

  data.forEach(function (d) {
    d.DEPARTURE_DELAY = +d.DEPARTURE_DELAY;
    d.ARRIVAL_DELAY = +d.ARRIVAL_DELAY;
  });

  var groupedData = d3.group(data, d => d.MONTH);

  var averageDelays = Array.from(groupedData, ([key, values]) => {
    var avgDepartureDelay = d3.mean(values, d => d.DEPARTURE_DELAY);
    var avgArrivalDelay = d3.mean(values, d => d.ARRIVAL_DELAY);
    return { month: +key, avgDepartureDelay, avgArrivalDelay };
  });

  var svg = d3.select('#part1_plot')
    .append('svg')
    .attr('width', 900)
    .attr('height', 400);

  var xScale = d3.scaleBand()
    .domain(averageDelays.map(d => d.month))
    .range([50, 750])
    .padding(0.1);

  var yScale = d3.scaleLinear()
    .domain([
      d3.min(averageDelays, d => Math.min(d.avgDepartureDelay, d.avgArrivalDelay) - 2),
      d3.max(averageDelays, d => Math.max(d.avgDepartureDelay, d.avgArrivalDelay) + 2)
    ])
    .range([350, 50]);

  svg.append('g')
    .attr('transform', 'translate(0, 302.5)')
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('transform', 'translate(50, 0)')
    .call(d3.axisLeft(yScale));

  var line = d3.line()
    .x(d => xScale(d.month) + 25)
    .y(d => yScale(d.avgDepartureDelay))
    .curve(d3.curveCardinal);

  svg.append('path')
    .datum(averageDelays)
    .attr('fill', 'none')
    .attr('stroke', '#7FABD3')
    .attr('stroke-width', 2)
    .attr('d', line);

  line.y(d => yScale(d.avgArrivalDelay));

  svg.append('path')
    .datum(averageDelays)
    .attr('fill', 'none')
    .attr('stroke', '#CA595F')
    .attr('stroke-width', 2)
    .attr('d', line);

  var circles = svg.append('g');

  circles.selectAll('circle_blue')
    .data(averageDelays)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.month) + 25)
    .attr('cy', d => yScale(d.avgDepartureDelay))
    .attr('r', 4)
    .attr('fill', '#7FABD3');

  circles.selectAll('circle_red')
    .data(averageDelays)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.month) + 25)
    .attr('cy', d => yScale(d.avgArrivalDelay))
    .attr('r', 4)
    .attr('fill', '#CA595F');

  svg.append('text')
    .attr('x', 400)
    .attr('y', 350)
    .attr('text-anchor', 'middle')
    .text('Month');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -200)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .text('Average Delay (min)');

  var legend = svg.append('g')
    .attr('transform', 'translate(600, 20)');

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', '#7FABD3');

  legend.append('text')
    .attr('x', 20)
    .attr('y', 8)
    .text('Average Departure Delay');

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 20)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', '#CA595F');

  legend.append('text')
    .attr('x', 20)
    .attr('y', 28)
    .text('Average Arrival Delay');

    svg.append("text")
    .attr("x", 400)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Average Delay by Month")
    .attr("class", "title");
}


let part2 = function (data) {
  const airlineNames = {
    UA: 'United Air Lines Inc.',
    AA: 'American Airlines Inc.',
    US: 'US Airways Inc.',
    F9: 'Frontier Airlines Inc.',
    B6: 'JetBlue Airways',
    OO: 'Skywest Airlines Inc.',
    AS: 'Alaska Airlines Inc.',
    NK: 'Spirit Air Lines',
    WN: 'Southwest Airlines Co.',
    DL: 'Delta Air Lines Inc.',
    EV: 'Atlantic Southeast Airlines',
    HA: 'Hawaiian Airlines Inc.',
    MQ: 'American Eagle Airlines Inc.',
    VX: 'Virgin America'
  }

  const airlineGroup = d3.group(data, d => d.AIRLINE);
  const averageDelays = Array.from(airlineGroup, ([airline, flights]) => ({
    airline,
    flightCount: flights.length,
    averageDelay: d3.mean(flights, d => +d.ARRIVAL_DELAY)
  }));

  averageDelays.sort((a, b) => a.averageDelay - b.averageDelay);

  var svg = d3.select('#part2_plot')
    .append('svg')
    .attr('width', 800)
    .attr('height', 400);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .domain(averageDelays.map(d => d.airline))
    .padding(0.1);

  const y = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain([
      d3.min(averageDelays, d => d.averageDelay),
      d3.max(averageDelays, d => d.averageDelay)]);

  var tooltip = d3.select("#part2_plot")
    .append("div")
    .style("position", "absolute")
    .style("text-align", "center")
    .style("pointer-events", "none")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("padding", "5px")
    .style("font-size", "12px")
    .style("visibility", "hidden");

  svg.selectAll("rect")
    .data(averageDelays)
    .enter()
    .append("rect")
    .attr("x", d => x(d.airline) + (x.bandwidth() / 2))
    .attr("y", d => y(Math.max(0, d.averageDelay)))
    .attr("width", x.bandwidth() / 2)
    .attr("height", d => Math.abs(y(d.averageDelay) - y(0)))
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible");
      tooltip.html(
        airlineNames[d.airline] + "<br>Average Delay: " + (d.averageDelay.toFixed(2)) + " minutes"
      )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
    });

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr('transform', 'translate(10, 301)')
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.top - 20)
    .style("text-anchor", "middle")
    .text("Airline");

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -175)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .text('Average Arrival Delay (min)');

    svg.append("text")
    .attr("x", 400)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Average Arrival Delay by Airline")
    .attr("class", "title");
};


let part3 = function (data, airportData) {

  let stateSym = {
    AZ: 'Arizona',
    AL: 'Alabama',
    AK: 'Alaska',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DC: 'District of Columbia',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming'
  };

  d3.json("us-states.json").then(function (map) {
    const width = 1000;
    const height = 600;
    const margin = { top: 40, right: 20, bottom: 20, left: 20 };

    map.features.forEach(d => d.properties.name = stateSym[d.properties.name]);

    const stateFlights = Array.from(d3.group(data, d => d.ORIGIN_STATE), ([state, flights]) => {
      const flightCount = flights.length;
      const averageDelay = d3.mean(flights, d => +d.ARRIVAL_DELAY);
      return {
        state,
        flightCount,
        averageDelay
      };
    });

    var svg = d3.select("#part3_plot")
      .append('svg')
      .attr("width", width)
      .attr("height", height);

    const projection = d3
      .geoAlbersUsa()
      .fitExtent(
        [
          [margin.left, margin.top],
          [width - margin.right - margin.left, height - margin.top - margin.bottom]
        ],
        map
      );

    const path = d3.geoPath().projection(projection);

    var delay = Array.from(stateFlights, d => d.averageDelay);

    var colorScale = d3.scaleSequential()
      .domain([d3.min(delay), d3.max(delay)])
      .interpolator(d3.interpolateRgbBasis(["#1F660A", "#69B308", "#E2B30D", "#B3310A", "#B30F0D", "#86070D", "#66060B"]));

    var legendWidth = 200;
    var legendHeight = 20;

    var legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (width - legendWidth) + "," + (height - legendHeight - 60) + ")");

    var legendScale = d3.scaleLinear()
      .range([0, legendWidth])
      .domain([d3.min(delay), d3.max(delay)]);

    var colorStops = d3.range(d3.min(delay), d3.max(delay), (d3.max(delay) - d3.min(delay)) / legendWidth);

    legend.selectAll("rect")
      .data(colorStops)
      .enter()
      .append("rect")
      .attr("x", (d, i) => legendScale(d))
      .attr("y", 0)
      .attr("width", legendScale(colorStops[1]) - legendScale(colorStops[0]))
      .attr("height", legendHeight)
      .style("fill", d => colorScale(d));

    legend.append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 15)
      .text(d3.min(delay).toFixed(2));

    legend.append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 15)
      .style("text-anchor", "end")
      .text(d3.max(delay).toFixed(2));

    legend.append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 30)
      .style("text-anchor", "end")
      .text('Average Arrival Delay / min');

    var tooltip = d3.select("#part3_plot").append("div")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("text-align", "center")
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("padding", "5px");

    svg.selectAll("path")
      .data(map.features)
      .join("path")
      .attr("class", "map")
      .attr("d", path)
      .attr("fill", d => colorScale(stateFlights.find(s => stateSym[s.state] === d.properties.name).averageDelay))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .text("Average Arrival Delay among States")
      .attr("class", "title");

    function handleMouseOver(event) {
      tooltip.style("visibility", "visible");
      var state = event.target.__data__.properties.name;
      var count = stateFlights.find(d => stateSym[d.state] === state).flightCount;
      var delay = stateFlights.find(d => stateSym[d.state] === state).averageDelay;
      tooltip.html(state + "<br>Number of Departure Flights: " + count +
        "<br>Average Delay: " + delay.toFixed(2) + " minutes")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    }
    function handleMouseOut() {
      tooltip.style("visibility", "hidden");
    };

    function getGreatCirclePath(start, end, steps) {
      var greatCircle = [];
      var startLon = start[0];
      var startLat = start[1];
      var endLon = end[0];
      var endLat = end[1];

      var deltaLon = endLon - startLon;
      var deltaLat = endLat - startLat;

      for (var i = 0; i <= steps; i++) {
        var lon = startLon + (deltaLon * (i / steps));
        var lat = startLat + (deltaLat * (i / steps));
        greatCircle.push([lon, lat]);
      }
      return { type: "LineString", coordinates: greatCircle };
    }

    var g = svg.append("g");
    var line = d3.geoPath().projection(projection);
    var flightPaths = [];

    for (var i = 0; i < airportData.length; i++) {
      var start = [parseFloat(airportData[i].longitude_deg), parseFloat(airportData[i].latitude_deg)];

      g.append("circle")
        .attr("cx", projection(start)[0])
        .attr("cy", projection(start)[1])
        .attr("r", 5)
        .attr("fill", "#09406C");

      for (var j = i + 1; j < airportData.length; j++) {
        var end = [parseFloat(airportData[j].longitude_deg), parseFloat(airportData[j].latitude_deg)];
        var greatCircle = getGreatCirclePath(start, end, 100);

        var filteredData1 = data.filter(function (d) {
          return d.ORIGIN_AIRPORT === airportData[i].iata_code && d.DESTINATION_AIRPORT === airportData[j].iata_code;
        });

        filteredData1.forEach(function (d) {
          d.ARRIVAL_DELAY = +d.ARRIVAL_DELAY;
        });

        var averageDelay1 = d3.mean(filteredData1, function (d) {
          return d.ARRIVAL_DELAY;
        });

        var filteredData2 = data.filter(function (d) {
          return d.ORIGIN_AIRPORT === airportData[j].iata_code && d.DESTINATION_AIRPORT === airportData[i].iata_code;
        });

        filteredData2.forEach(function (d) {
          d.ARRIVAL_DELAY = +d.ARRIVAL_DELAY;
        });

        var averageDelay2 = d3.mean(filteredData2, function (d) {
          return d.ARRIVAL_DELAY;
        });

        flightPaths.push({
          iataCode1: airportData[i].iata_code,
          iataCode2: airportData[j].iata_code,
          name1: airportData[i].name,
          name2: airportData[j].name,
          averageDelay1: averageDelay1.toFixed(2),
          averageDelay2: averageDelay2.toFixed(2)
        });

        svg.selectAll(".flight-path")
          .data(flightPaths)
          .enter()
          .append("path")
          .attr("class", "flight-path")
          .datum(function (d) {
            return getGreatCirclePath(
              [parseFloat(airportData.find(airport => airport.iata_code === d.iataCode1).longitude_deg),
              parseFloat(airportData.find(airport => airport.iata_code === d.iataCode1).latitude_deg)],
              [parseFloat(airportData.find(airport => airport.iata_code === d.iataCode2).longitude_deg),
              parseFloat(airportData.find(airport => airport.iata_code === d.iataCode2).latitude_deg)],
              100
            );
          })
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", "#236CA0")
          .attr("stroke-width", 2)
          .on("mouseover", handleMouseOverLine)
          .on("mouseout", handleMouseOutLine);
      }
    }

    function handleMouseOverLine(event, d) {
      tooltip.style("visibility", "visible");
      tooltip.html(d.name1 + " (" + d.iataCode1 + ")<br>" + d.name2 + " (" + d.iataCode2 + ")" +
        "<br>Average Delay (" + d.iataCode1 + " to " + d.iataCode2 + "): " + d.averageDelay1 + " minutes" +
        "<br>Average Delay (" + d.iataCode2 + " to " + d.iataCode1 + "): " + d.averageDelay2 + " minutes")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    }
    function handleMouseOutLine() {
      tooltip.style("visibility", "hidden");
    };
  });
}