'use strict';

var salaryCap = 74000000,
    yearSelected = '2016-2017',
    freshData = void 0;

//getting team data JSON
var data = new Promise(function (resolve, reject) {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/js/data.json?t=' + Math.random());
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhr.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      resolve(JSON.parse(xhr.response) || xhr.responseText);
    } else {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    }
  };

  xhr.onerror = function () {
    reject({
      status: this.status,
      statusText: xhr.statusText
    });
  };
  xhr.send();
});

//after we have JSON..do stuff.
data.then(function (v) {
  //save copy of data in case we need to start fresh
  freshData = JSON.parse(JSON.stringify(v));

  //list all players on team breakdown section
  populateTeamBreakdown(v);
  //run some math on all players
  populateTeamOverviews(v);
});

var createPoints = function createPoints() {
  //creating 'fake' team pts data
  var ptsBreakdown = [];
  var outcomes = [0, 1, 2];
  var totalPoints = 0;
  for (var i = 1; i < 83; i++) {
    var ptsGained = outcomes[Math.floor(Math.random() * outcomes.length)];
    totalPoints += ptsGained;
    ptsBreakdown.push({ 'name': 'team', 'game': i, 'pts': totalPoints });
  }

  //creating avg team pts data
  var totalPointsAvg = 0;
  for (var _i = 1; _i < 83; _i++) {
    totalPointsAvg += 1.11;
    ptsBreakdown.push({ 'name': 'avg', 'game': _i, 'pts': totalPointsAvg });
  }

  //creating playoff pace team pts data
  var totalPointsPlf = 0;
  for (var _i2 = 1; _i2 < 83; _i2++) {
    totalPointsPlf += 1.134;
    ptsBreakdown.push({ 'name': 'plf', 'game': _i2, 'pts': totalPointsPlf });
  }

  //let d3 nest them into proper groupings
  var ptsByName = d3.nest().key(function (d) {
    return d.name;
  }).entries(ptsBreakdown);

  //Setting up svg.
  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the 1st line
  var valueline = d3.line().x(function (d) {
    console.log(d);return x(d.game);
  }).y(function (d) {
    return y(d.pts);
  });

  // define the 2nd line
  var valueline2 = d3.line().x(function (d) {
    return x(d.game);
  }).y(function (d) {
    return y(d.pts);
  });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("body").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data
  x.domain(d3.extent(ptsBreakdown, function (d) {
    return d.game;
  }));
  y.domain([0, d3.max(ptsBreakdown, function (d) {
    return Math.max(d.pts);
  })]);

  // Add the valueline path.
  svg.append("path").data([ptsBreakdown]).attr("class", "line").attr("d", valueline);

  // Add the valueline2 path.
  svg.append("path").data([ptsBreakdown]).attr("class", "line").style("stroke", "red").attr("d", valueline2);

  // Add the X Axis
  svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g").call(d3.axisLeft(y));
};

function populateTeamBreakdown(team) {
  for (var playerKey in team) {
    var player = team[playerKey],
        pos = player.pos;

    if (!player.contract[yearSelected]) continue;

    var a = document.createElement('a');
    a.className = 'list-group-item';
    a.href = "javascript:;";
    a.setAttribute("player-key", playerKey);
    a.innerHTML = player.name + '<span class="pull-right text-muted small">$' + player.contract["2016-2017"]["nhl-salary"].toLocaleString() + '</span>';

    switch (pos) {
      case 'F':
        document.getElementById('team-breakdown-forwards').appendChild(a);
        break;
      case 'D':
        document.getElementById('team-breakdown-defense').appendChild(a);
        break;
      case 'G':
        document.getElementById('team-breakdown-goalies').appendChild(a);
        break;
      default:
        break;
    }

    document.getElementById('team-breakdown').onclick = function (evt) {
      var event = evt || window.event,
          target = event.target || event.srcElement,
          playerKey = target.getAttribute('player-key');

      if (playerKey) {
        switchPlayerCharts(team, playerKey);
      }
    };
  }
}

function switchPlayerCharts(team, playerKey) {
  var player = team[playerKey];
  console.log(player);
}

function populateTeamOverviews(team) {

  var teamOverview = {
    total: 0,
    salary: 0,

    forwards: {
      total: 0,
      salary: 0,
      players: {}
    },
    defensemen: {
      total: 0,
      salary: 0,
      players: {}
    },
    goalies: {
      total: 0,
      salary: 0,
      players: {}
    }
  };

  for (var playerKey in team) {
    var player = team[playerKey],
        pos = player.pos;

    if (!player.contract[yearSelected]) continue;

    switch (pos) {
      case 'F':
        teamOverview.forwards.total++;
        teamOverview.forwards.salary += player.contract[yearSelected]["cap-hit"];
        teamOverview.forwards.players[playerKey] = player;
        break;
      case 'D':
        teamOverview.defensemen.total++;
        teamOverview.defensemen.salary += player.contract[yearSelected]["cap-hit"];
        teamOverview.defensemen.players[playerKey] = player;
        break;
      case 'G':
        teamOverview.goalies.total++;
        teamOverview.goalies.salary += player.contract[yearSelected]["cap-hit"];
        teamOverview.goalies.players[playerKey] = player;
        break;
      default:
        break;
    }

    teamOverview.total++;
    teamOverview.salary += player.contract[yearSelected]["cap-hit"];
  }

  var totalPlayers = document.getElementById('overview-total-players');
  totalPlayers.getElementsByClassName('overview-total-amount')[0].innerHTML = teamOverview.total + ' Total Players';
  totalPlayers.getElementsByClassName('overview-salary-amount')[0].innerHTML = '$' + teamOverview.salary.toLocaleString() + ' (' + Math.round(teamOverview.salary / salaryCap * 100) + '% of cap)';

  var totalForwards = document.getElementById('overview-total-forwards');
  totalForwards.getElementsByClassName('overview-total-amount')[0].innerHTML = teamOverview.forwards.total + ' Total Forwards';
  totalForwards.getElementsByClassName('overview-salary-amount')[0].innerHTML = '$' + teamOverview.forwards.salary.toLocaleString() + ' (' + Math.round(teamOverview.forwards.salary / salaryCap * 100) + '% of cap)';

  var totalDefense = document.getElementById('overview-total-defensemen');
  totalDefense.getElementsByClassName('overview-total-amount')[0].innerHTML = teamOverview.defensemen.total + ' Total Defensemen';
  totalDefense.getElementsByClassName('overview-salary-amount')[0].innerHTML = '$' + teamOverview.defensemen.salary.toLocaleString() + ' (' + Math.round(teamOverview.defensemen.salary / salaryCap * 100) + '% of cap)';

  var totalGoalies = document.getElementById('overview-total-goaltenders');
  totalGoalies.getElementsByClassName('overview-total-amount')[0].innerHTML = teamOverview.goalies.total + ' Total Goaltenders';
  totalGoalies.getElementsByClassName('overview-salary-amount')[0].innerHTML = '$' + teamOverview.goalies.salary.toLocaleString() + ' (' + Math.round(teamOverview.goalies.salary / salaryCap * 100) + '% of cap)';

  createTeamPie(teamOverview);
}

function createTeamPie(teamOverview) {
  console.log(teamOverview);

  //   let width = 960,
  //     height = 500,
  //     radius = Math.min(width, height) / 2;

  //   let color = d3.scale.ordinal()
  //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  //    var arc = d3.svg.arc()
  //     .outerRadius(radius - 10)
  //     .innerRadius(0);

  // var labelArc = d3.svg.arc()
  //     .outerRadius(radius - 40)
  //     .innerRadius(radius - 40);

  // var pie = d3.layout.pie()
  //     .sort(null)
  //     .value(function(d) { return d.salary; });

  // var svg = d3.select("body").append("svg")
  //     .attr("width", width)
  //     .attr("height", height)
  //   .append("g")
  //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); 

  //   var g = svg.selectAll(".arc")
  //       .data(pie(teamOverview))
  //       .enter().append("g")
  //       .attr("class", "arc");

  //      g.append("path")
  //       .attr("d", arc)
  //       .style("fill", function(d) { return color(d.salary); });   


  //     g.append("text")
  //       .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
  //       .attr("dy", ".35em")
  //       .text(function(d) { return d.salary; });    
}