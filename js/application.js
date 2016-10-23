let salaryCap = 74000000,
    yearSelected = '2016-2017',
    freshData;

//getting team data JSON
let data = new Promise(function (resolve, reject) {

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
data.then(v =>{
  //save copy of data in case we need to start fresh
  freshData = JSON.parse(JSON.stringify(v));

  //list all players on team breakdown section
  populateTeamBreakdown(v);
  //run some math on all players
  populateTeamOverviews(v);

});


let createPoints = () =>  {
  //creating 'fake' team pts data
  let ptsBreakdown = [];
  let outcomes = [0, 1, 2];
  let totalPoints = 0;
  for (let i = 1; i < 83; i++) {
      let ptsGained = outcomes[Math.floor(Math.random()*outcomes.length)];
      totalPoints += ptsGained;
      ptsBreakdown.push({'name' : 'team', 'game' : i, 'pts' : totalPoints});
  }

  //creating avg team pts data
  let totalPointsAvg = 0;
  for (let i = 1; i < 83; i++) {
      totalPointsAvg += 1.11;
      ptsBreakdown.push({'name' : 'avg', 'game' : i, 'pts' : totalPointsAvg});
  }

  //creating playoff pace team pts data
  let totalPointsPlf = 0;
  for (let i = 1; i < 83; i++) {
      totalPointsPlf += 1.134;
      ptsBreakdown.push({'name' : 'plf', 'game' : i, 'pts' : totalPointsPlf});
  }

  //let d3 nest them into proper groupings
  let ptsByName = d3.nest()
  .key(function(d) { return d.name; })
  .entries(ptsBreakdown);



//Setting up svg.
let svg = d3.select("#salary-pie-chart svg"),
    margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

let line = d3.line()
    .x(function(d) {return x(d.game); })
    .y(function(d) {return y(d.pts); });    


x.domain(ptsByName, function(d) { return d.game; });

y.domain([
    d3.min(ptsByName, function(c) { return d3.min(c.values, function(d) { return d.pts; }); }),
    d3.max(ptsByName, function(c) { return d3.max(c.values, function(d) { return d.pts; }); })
  ]);

z.domain(ptsByName, function(c) { return c.game; });


g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Points");

  var city = g.selectAll(".city")
    .data(ptsByName)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", "black");

  city.append("text")
      .datum(function(d) { return {key: d.key, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + 10 + "," + 10 + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return 'hi'; });

};



createPoints();




function populateTeamBreakdown(team) {
  for(let playerKey in team){
    let player = team[playerKey],
        pos = player.pos;

    if(!player.contract[yearSelected])
        continue;
    

    let a = document.createElement('a');
        a.className = 'list-group-item';
        a.href="javascript:;";
        a.setAttribute("player-key", playerKey);
        a.innerHTML = `${player.name}<span class="pull-right text-muted small">$${player.contract["2016-2017"]["nhl-salary"].toLocaleString()}</span>`;

    switch(pos){
      case 'F':
          document.getElementById(`team-breakdown-forwards`).appendChild(a);
      break;
      case 'D':
          document.getElementById(`team-breakdown-defense`).appendChild(a);
          break;
      case 'G':
          document.getElementById(`team-breakdown-goalies`).appendChild(a);
          break;
      default:
          break;
    }

    document.getElementById('team-breakdown').onclick = (evt) =>{
      let event = evt || window.event,
          target = event.target || event.srcElement,
          playerKey = target.getAttribute('player-key');

          if(playerKey){
            switchPlayerCharts(team, playerKey);
          }
    }
  }
}

function switchPlayerCharts(team, playerKey) {
  let player = team[playerKey];
  console.log(player);
}


function populateTeamOverviews(team) {

  let teamOverview = {
        total: 0,
        salary: 0,

        forwards : {
          total: 0,
          salary:0,
          players : {}
        },
        defensemen : {
          total : 0,
          salary: 0,
          players : {}
        }, 
        goalies : {
          total: 0,
          salary: 0,
          players : {}
        }
    }


  for(let playerKey in team){
    let player = team[playerKey],
        pos = player.pos;

     if(!player.contract[yearSelected])
        continue;

    switch(pos){
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

  let totalPlayers = document.getElementById('overview-total-players');
      totalPlayers.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.total} Total Players`;
      totalPlayers.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.salary.toLocaleString()} (${Math.round(teamOverview.salary / salaryCap * 100)}% of cap)`;

  let totalForwards = document.getElementById('overview-total-forwards');
      totalForwards.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.forwards.total} Total Forwards`;
      totalForwards.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.forwards.salary.toLocaleString()} (${Math.round(teamOverview.forwards.salary / salaryCap * 100)}% of cap)`; 

  let totalDefense = document.getElementById('overview-total-defensemen');
      totalDefense.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.defensemen.total} Total Defensemen`;
      totalDefense.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.defensemen.salary.toLocaleString()} (${Math.round(teamOverview.defensemen.salary / salaryCap * 100)}% of cap)`;     

  let totalGoalies = document.getElementById('overview-total-goaltenders');
      totalGoalies.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.goalies.total} Total Goaltenders`;
      totalGoalies.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.goalies.salary.toLocaleString()} (${Math.round(teamOverview.goalies.salary / salaryCap * 100)}% of cap)`;         
}
