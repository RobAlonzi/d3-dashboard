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

//creating 'fake' team pts data and displaying it on the line chart
let createPoints = () =>  {

  let ptsBreakdown = [];
  let outcomes = [0, 1, 2];
  let totalPoints = 0;
  let totalPointsRiv = 0;
  let totalPointsRiv2 = 0;
  for (let i = 1; i < 83; i++) {
      totalPoints += outcomes[Math.floor(Math.random()*outcomes.length)];
      totalPointsRiv += outcomes[Math.floor(Math.random()*outcomes.length)];
      totalPointsRiv2 += outcomes[Math.floor(Math.random()*outcomes.length)];
      ptsBreakdown.push([i, totalPoints, totalPointsRiv, totalPointsRiv2]);
  }

  //let d3 nest them into proper groupings

  // set the dimensions and margins of the graph 
  let margin = {top: 20, right: 20, bottom: 30, left: 50}, 
      width = 960 - margin.left - margin.right, 
      height = 500 - margin.top - margin.bottom;

  let x = d3.scaleLinear().range([0, width]); 
  let y = d3.scaleLinear().range([height, 0]);
  let z = d3.scaleOrdinal(d3.schemeCategory10);

  let teamLine = d3.line().x(d => { return x(d[0])}).y(d => { return y(d[1])}),
      avgLine = d3.line().x(d => { return x(d[0])}).y(d => { return y(d[2])}),
      presLine = d3.line().x(d => { return x(d[0])}).y(d => { return y(d[3])});


  let svg = d3.select("#team-standings-line").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  //x.domain(d3.extent(ptsBreakdown, function(d) {  return d[0]; }));
  x.domain([0, 95]);
  y.domain([0, d3.max(ptsBreakdown, function(d) { return d3.max(d); })]);  

  svg.append("path")
      .data([ptsBreakdown])
      .attr("class", "line team-line")
      .attr("d", teamLine)
      .style("stroke", "#8e44ad");  

  svg.append("path")
      .data([ptsBreakdown])
      .attr("class", "line")
      .attr("d", avgLine)
      .style("stroke", "#2980b9");
      
  svg.append("path")
      .data([ptsBreakdown])
      .attr("class", "line")
      .attr("d", presLine)
      .style("stroke", "#d35400");     

   svg.append("text")
      .datum([ptsBreakdown][0])
      .attr("transform", function(d) { return "translate(" + x(d[81][0]) + "," + y(d[81][1]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Our Team (${d[81][1]} pts)`; });  

   svg.append("text")
      .datum([ptsBreakdown][0])
      .attr("transform", function(d) { return "translate(" + x(d[81][0]) + "," + y(d[81][2]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Division Rival #1 (${d[81][2]} pts)`; });  
      
   svg.append("text")
      .datum([ptsBreakdown][0])
      .attr("transform", function(d) { return "translate(" + x(d[81][0]) + "," + y(d[81][3]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Division Rival #2 (${d[81][3]} pts)`; });               

   svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));


   svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 7) + ")")
      .style("text-anchor", "middle")
      .text("Games Played");   

      
   svg.append("g")
      .call(d3.axisLeft(y));  


    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Points");          

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

  createTeamPie(teamOverview);             
}


function createTeamPie(teamOverview) {
  //console.log(teamOverview);

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
