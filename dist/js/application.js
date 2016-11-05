'use strict';

var salaryCap = 74000000,
    maxSalary = 14600000,
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
  //team salary bar chart by player
  populateTeamBarChart(v);
  //create fake 'standings' chart
  createPoints();
});

//creating 'fake' team pts data and displaying it on the line chart
function createPoints() {

  var ptsBreakdown = [];
  var outcomes = [0, 1, 2];
  var totalPoints = 0;
  var totalPointsRiv = 0;
  var totalPointsRiv2 = 0;
  for (var i = 1; i <= 82; i++) {
    totalPoints += outcomes[Math.floor(Math.random() * outcomes.length)];
    totalPointsRiv += outcomes[Math.floor(Math.random() * outcomes.length)];
    totalPointsRiv2 += outcomes[Math.floor(Math.random() * outcomes.length)];
    ptsBreakdown.push([i, totalPoints, totalPointsRiv, totalPointsRiv2]);
  }

  //let d3 nest them into proper groupings

  // set the dimensions and margins of the graph 
  var margin = { top: 30, right: 130, bottom: 30, left: 50 },
      width = 847 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var z = d3.scaleOrdinal(d3.schemeCategory10);

  var teamLine = d3.line().x(function (d) {
    return x(d[0]);
  }).y(function (d) {
    return y(d[1]);
  }),
      avgLine = d3.line().x(function (d) {
    return x(d[0]);
  }).y(function (d) {
    return y(d[2]);
  }),
      presLine = d3.line().x(function (d) {
    return x(d[0]);
  }).y(function (d) {
    return y(d[3]);
  });

  var svg = d3.select("#team-standings-line").append("svg");
  svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(d3.extent(ptsBreakdown, function (d) {
    return d[0];
  }));
  y.domain([0, d3.max(ptsBreakdown, function (d) {
    return d3.max(d);
  })]);

  svg.append("path").data([ptsBreakdown]).attr("class", "line team-line").attr("d", teamLine).style("stroke", "#8e44ad");

  svg.append("path").data([ptsBreakdown]).attr("class", "line").attr("d", avgLine).style("stroke", "#2980b9");

  svg.append("path").data([ptsBreakdown]).attr("class", "line").attr("d", presLine).style("stroke", "#d35400");

  svg.append("text").datum([ptsBreakdown][0]).attr("transform", function (d) {
    return "translate(" + x(d[d.length - 1][0]) + "," + y(d[d.length - 1][1]) + ")";
  }).attr("dy", "0.35em").style("font", "10px sans-serif").text(function (d) {
    return 'Our Team (' + d[d.length - 1][1] + ' pts)';
  });

  svg.append("text").datum([ptsBreakdown][0]).attr("transform", function (d) {
    return "translate(" + x(d[d.length - 1][0]) + "," + y(d[d.length - 1][2]) + ")";
  }).attr("dy", "0.35em").style("font", "10px sans-serif").text(function (d) {
    return 'Division Rival #1 (' + d[d.length - 1][2] + ' pts)';
  });

  svg.append("text").datum([ptsBreakdown][0]).attr("transform", function (d) {
    return "translate(" + x(d[d.length - 1][0]) + "," + y(d[d.length - 1][3]) + ")";
  }).attr("dy", "0.35em").style("font", "10px sans-serif").text(function (d) {
    return 'Division Rival #2 (' + d[d.length - 1][3] + ' pts)';
  });

  svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));

  svg.append("text").attr("transform", "translate(" + width / 2 + " ," + (height + margin.top) + ")").style("text-anchor", "middle").text("Games Played");

  svg.append("g").call(d3.axisLeft(y));

  svg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - height / 2).attr("dy", "1em").style("text-anchor", "middle").text("Points");
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
    a.innerHTML = player.name + '<span class="pull-right text-muted small">$' + player.contract[yearSelected]["nhl-salary"].toLocaleString() + '</span>';

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
    space: {
      total: 0,
      salary: salaryCap,
      cap: 0
    },
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

    teamOverview.space.total++;
    teamOverview.space.salary -= player.contract[yearSelected]["cap-hit"];
    teamOverview.space.cap += player.contract[yearSelected]["cap-hit"];
  }

  var totalPlayers = document.getElementById('overview-total-players');
  totalPlayers.getElementsByClassName('overview-total-amount')[0].innerHTML = teamOverview.space.total + ' Total Players';
  totalPlayers.getElementsByClassName('overview-salary-amount')[0].innerHTML = '$' + teamOverview.space.cap.toLocaleString() + ' (' + Math.round(teamOverview.space.cap / salaryCap * 100) + '% of cap)';

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

function populateTeamBarChart(teamOverview) {

  //deletes player if he doesn't have a contract
  for (var player in teamOverview) {
    var playerObj = teamOverview[player];
    if (!playerObj["contract"][yearSelected]) {
      delete teamOverview[player];
    }
  }

  var margin = { top: 20, right: 20, bottom: 80, left: 60 },
      width = 847 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  // set the ranges
  var x = d3.scaleBand().range([0, width]).padding(0.1);

  var y = d3.scaleLinear().range([height, 0]);

  var colorRange = d3.scaleLinear();
  colorRange.domain([0, d3.max(d3.entries(teamOverview), function (d) {
    if (d['value']["contract"][yearSelected]) {
      return d['value']['contract'][yearSelected]['cap-hit'];
    }
  })]);

  var svg = d3.select("#team-bar-chart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(Object.keys(teamOverview).map(function (d) {
    return teamOverview[d]['name'].split(' ')[teamOverview[d]['name'].split(' ').length - 1];
  }));
  y.domain([0, d3.max(d3.entries(teamOverview), function (d) {
    return d['value']['contract'][yearSelected]['cap-hit'];
  })]);

  for (var i = 0, l = teamOverview.length; i < l; i++) {
    map[teamOverview[i].id] = teamOverview[i];
  }

  svg.selectAll(".bar").data(d3.entries(teamOverview)).enter().append("rect").attr("class", "bar").attr("x", function (d) {
    return x(d['value']['name'].split(' ')[d['value']['name'].split(' ').length - 1]);
  }).attr("width", x.bandwidth()).attr("fill", function (d) {
    return d3.interpolatePlasma(colorRange(d['value']['contract'][yearSelected]['cap-hit']));
  }).attr("y", function (d) {
    return y(d['value']['contract'][yearSelected]['cap-hit']);
  }).attr("height", function (d) {
    return height - y(d['value']['contract'][yearSelected]['cap-hit']);
  });

  // add the x Axis
  svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)).selectAll("text").attr("x", 30).attr("y", -5).attr("transform", "rotate(90)");

  // add the y Axis
  svg.append("g").call(d3.axisLeft(y));
}

function createTeamPie(teamOverview) {
  teamOverview = d3.entries(teamOverview);

  var margin = { top: 20, right: 20, bottom: 20, left: 20 },
      width = 847 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      radius = Math.min(width, height) / 2,
      donutWidth = 75,
      legendRectSize = 18,
      legendSpacing = 4;

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var svg = d3.select('#salary-pie-chart').append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  var arc = d3.arc().innerRadius(radius - donutWidth).outerRadius(radius);

  var pie = d3.pie().value(function (d) {
    return d.value.salary;
  }).sort(null);

  var tooltip = d3.select('#salary-pie-chart').append('div').attr('class', 'pie-tooltip');

  tooltip.append('div').attr('class', 'label');

  tooltip.append('div').attr('class', 'count');

  tooltip.append('div').attr('class', 'percent');

  var path = svg.selectAll('path').data(pie(teamOverview)).enter().append('path').attr('d', arc).attr('fill', function (d, i) {
    return color(d.data.key);
  });

  path.on('mouseover', function (d) {
    var total = d3.sum(teamOverview.map(function (d) {
      return d.value.salary;
    }));
    var percent = Math.round(1000 * d.data.value.salary / salaryCap) / 10;
    tooltip.select('.label').html(d.data.key);
    tooltip.select('.count').html('$' + d.data.value.salary.toLocaleString());
    tooltip.select('.percent').html(percent + '% of cap');
    tooltip.style('display', 'block');
  });

  path.on('mouseout', function () {
    tooltip.style('display', 'none');
  });

  path.on('mousemove', function (d) {
    tooltip.style('top', d3.event.pageY - 250 + 'px').style('left', d3.event.pageX + 'px');
  });

  var legend = svg.selectAll('.legend').data(color.domain()).enter().append('g').attr('class', 'legend').attr('transform', function (d, i) {
    var height = legendRectSize + legendSpacing;
    var offset = height * color.domain().length / 2;
    var horz = -2 * legendRectSize;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });

  legend.append('rect').attr('width', legendRectSize).attr('height', legendRectSize).style('fill', color).style('stroke', color);

  legend.append('text').attr('x', legendRectSize + legendSpacing).attr('y', legendRectSize - legendSpacing).text(function (d) {
    return d;
  });
}

document.getElementById('change-year-btn').onclick = function (evt) {
  var event = evt || window.event,
      target = event.target || event.srcElement,
      yearKey = target.getAttribute('data-year-toggle');

  if (yearKey) {
    switchYear(yearKey);
  }
};

function switchYear(year) {
  yearSelected = year;

  var fresherData = JSON.parse(JSON.stringify(freshData));
  //list all players on team breakdown section
  populateTeamBreakdown(fresherData);
  //run some math on all players
  populateTeamOverviews(fresherData);
  //team salary bar chart by player
  populateTeamBarChart(fresherData);
  //create fake 'standings' chart
  createPoints();
}