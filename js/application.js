let salaryCap = 74000000,
    maxSalary = 14600000,
    yearSelected = '2016-2017',
    freshData;


document.getElementById("btn-input-cap").value = salaryCap;  


document.getElementById('btn-cap-no').onclick = (evt) =>{
      let newCap = document.getElementById("btn-input-cap").value;

      salaryCap = newCap.replace(/\D/g,'')
      switchYear(yearSelected);
}  

//getting team data JSON
let data = new Promise(function (resolve, reject) {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'dist/js/data.json?t=' + Math.random());
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
  let overview = populateTeamOverviews(v);
  createTeamPie(overview);
  //team salary bar chart by player
  populateTeamBarChart(v);
  //create fake 'standings' chart
  createPoints();

});

//creating 'fake' team pts data and displaying it on the line chart
function createPoints() {

  let ptsBreakdown = [];
  let relPtsBreakdown = [];
  let outcomes = [0, 1, 2];
  let totalPoints = 0;
  let totalWins = 0;
  let totalPointsRiv = 0;
  let totalWinsRiv = 0;
  let totalPointsRiv2 = 0;
  let totalWinsRiv2 = 0;

  ptsBreakdown.push([0,0,0,0]);
  relPtsBreakdown.push([0,0,0,0]);

  for (let i = 1; i <= 82; i++) {
      let outcomeTeam = outcomes[Math.floor(Math.random()*outcomes.length)];
      totalPoints += outcomeTeam;
      if (outcomeTeam === 2){
          totalWins += 1;
      }else if(outcomeTeam === 1){
          totalWins += 0;
      }else{
          totalWins -= 1;
      }

      outcomeTeam = outcomes[Math.floor(Math.random()*outcomes.length)];
      totalPointsRiv += outcomeTeam;
      if (outcomeTeam === 2){
          totalWinsRiv += 1;
      }else if(outcomeTeam === 1){
          totalWinsRiv += 0;
      }else{
          totalWinsRiv -= 1;
      }

      outcomeTeam = outcomes[Math.floor(Math.random()*outcomes.length)];
      totalPointsRiv2 += outcomeTeam;
      if (outcomeTeam === 2){
          totalWinsRiv2 += 1;
      }else if(outcomeTeam === 1){
          totalWinsRiv2 += 0;
      }else{
          totalWinsRiv2 -= 1;
      }

      
      relPtsBreakdown.push([i, totalWins, totalWinsRiv, totalWinsRiv2]);
      ptsBreakdown.push([i, totalPoints, totalPointsRiv, totalPointsRiv2]);
  }

  createGBLine(relPtsBreakdown);
  createPointsLine(ptsBreakdown);

}

function createGBLine(ptsBreakdown) {

  //let d3 nest them into proper groupings

  // set the dimensions and margins of the graph 
  let margin = {top: 40, right: 140, bottom: 40, left: 40}, 
      width = 847 - margin.left - margin.right, 
      height = 400 - margin.top - margin.bottom;

  let x = d3.scaleLinear().range([0, width]); 
  let y = d3.scaleLinear().range([height, 0]);
  let z = d3.scaleOrdinal(d3.schemeCategory10);

  let teamLine = d3.line().x(d => { return x(d[0])}).y(d => { return y(d[1])}),
      avgLine = d3.line().x(d => { return x(d[0])}).y(d => { return y(d[2])}),
      presLine = d3.line().x(d => { return x(d[0])}).y(d => { return y(d[3])});


  let svg = d3.select("#team-relative-standings-line").append("svg")
          .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  x.domain(d3.extent(ptsBreakdown, function(d) {return d[0]; }));
  y.domain([d3.min(ptsBreakdown, function(d) { return (d3.min([d[1], d[2], d[3]]) - 5); }), d3.max(ptsBreakdown, function(d) { return (d3.max([d[1], d[2], d[3]]) + 5); })]);  

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
      .attr("transform", function(d) { return "translate(" + (x(d[d.length - 1][0]) + 5) + "," + y(d[d.length - 1][1]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Our Team`; });  

   svg.append("text")
      .datum([ptsBreakdown][0])
      .attr("transform", function(d) { return "translate(" + (x(d[d.length - 1][0]) + 5) + "," + y(d[d.length - 1][2]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Division Rival #1`; });  
      
   svg.append("text")
      .datum([ptsBreakdown][0])
      .attr("transform", function(d) { return "translate(" + (x(d[d.length - 1][0]) + 5) + "," + y(d[d.length - 1][3]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Division Rival #2`; });               

   svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));


   svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + (height + margin.top) + ")")
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
      .text("Games Above .500"); 
}
         

function createPointsLine(ptsBreakdown) {

  //let d3 nest them into proper groupings

  // set the dimensions and margins of the graph 
  let margin = {top: 50, right: 130, bottom: 30, left: 50}, 
      width = 847 - margin.left - margin.right, 
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


  x.domain(d3.extent(ptsBreakdown, function(d) {return d[0]; }));
  y.domain([0, d3.max(ptsBreakdown, function(d) { return (d3.max([d[1], d[2], d[3]]) + 5); })]);  

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
      .attr("transform", function(d) { return "translate(" + (x(d[d.length - 1][0]) + 5) + "," + y(d[d.length - 1][1]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Our Team (${d[d.length - 1][1]} pts)`; });  

   svg.append("text")
      .datum([ptsBreakdown][0])
      .attr("transform", function(d) { return "translate(" + (x(d[d.length - 1][0]) + 5) + "," + y(d[d.length - 1][2]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Division Rival #1 (${d[d.length - 1][2]} pts)`; });  
      
   svg.append("text")
      .datum([ptsBreakdown][0])
      .attr("transform", function(d) { return "translate(" + (x(d[d.length - 1][0]) + 5) + "," + y(d[d.length - 1][3]) + ")"; })
      .attr("dy", "0.35em")   
      .style("font", "10px sans-serif")
      .text(function(d) { return `Division Rival #2 (${d[d.length - 1][3]} pts)`; });               

   svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));


   svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + (height + margin.top) + ")")
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

function populateTeamBreakdown(team) {
  for(let playerKey in team){
    let player = team[playerKey],
        pos = player.pos;

    if(!player.contract[yearSelected])
        continue;
    

    let a = document.createElement('span');
        a.className = 'list-group-item';
        a.href="javascript:;";
        a.setAttribute("player-key", playerKey);
        a.innerHTML = `${player.name}<span class="pull-right text-muted small">$${player.contract[yearSelected]["nhl-salary"].toLocaleString()}</span>`;

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
  }

    // document.getElementById('team-breakdown').onclick = (evt) =>{
    //   let event = evt || window.event,
    //       target = event.target || event.srcElement,
    //       playerKey = target.getAttribute('player-key');

    //       if(playerKey){
    //         switchPlayerCharts(team, playerKey);
    //       }
    // }
}


function populateTeamOverviews(team) {

  let teamOverview = {
        space: {
          total: 0,
          salary: salaryCap,
          cap: 0
        },
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

    teamOverview.space. total++;
    teamOverview.space. salary -= player.contract[yearSelected]["cap-hit"];
    teamOverview.space. cap += player.contract[yearSelected]["cap-hit"];

  }

  let totalPlayers = document.getElementById('overview-total-players');
      totalPlayers.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.space. total} Total Players`;
      totalPlayers.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.space. cap.toLocaleString()} (${Math.round(teamOverview.space. cap / salaryCap * 100)}% of cap)`;

  let totalForwards = document.getElementById('overview-total-forwards');
      totalForwards.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.forwards.total} Total Forwards`;
      totalForwards.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.forwards.salary.toLocaleString()} (${Math.round(teamOverview.forwards.salary / salaryCap * 100)}% of cap)`; 

  let totalDefense = document.getElementById('overview-total-defensemen');
      totalDefense.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.defensemen.total} Total Defensemen`;
      totalDefense.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.defensemen.salary.toLocaleString()} (${Math.round(teamOverview.defensemen.salary / salaryCap * 100)}% of cap)`;     

  let totalGoalies = document.getElementById('overview-total-goaltenders');
      totalGoalies.getElementsByClassName('overview-total-amount')[0].innerHTML = `${teamOverview.goalies.total} Total Goaltenders`;
      totalGoalies.getElementsByClassName('overview-salary-amount')[0].innerHTML = `$${teamOverview.goalies.salary.toLocaleString()} (${Math.round(teamOverview.goalies.salary / salaryCap * 100)}% of cap)`;

  //createTeamPie(teamOverview);  

  return teamOverview;           
}


function populateTeamBarChart(teamOverview) {

  //deletes player if he doesn't have a contract
  for(let player in teamOverview){
    let playerObj = teamOverview[player];
    if(!playerObj["contract"][yearSelected]){
        delete teamOverview[player];
    }
  }


  let margin = {top: 20, right: 20, bottom:80, left: 60},
      width = 847 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
      // set the ranges
      let x = d3.scaleBand()
              .range([0, width])
              .padding(0.1);

      let y = d3.scaleLinear()
              .range([height, 0]);

      let colorRange = d3.scaleLinear();
          colorRange.domain([0, d3.max(d3.entries(teamOverview), function(d) {
          if(d['value']["contract"][yearSelected]){
            return d['value']['contract'][yearSelected]['cap-hit']; 
          }
        })]); 


  let svg = d3.select("#team-bar-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 


        x.domain(Object.keys(teamOverview).map(function(d) {
            return teamOverview[d]['name'].split(' ')[(teamOverview[d]['name'].split(' ').length) - 1];
        })); 
        y.domain([0, d3.max(d3.entries(teamOverview), function(d) {
            return d['value']['contract'][yearSelected]['cap-hit']; 
        })]);


for (let i = 0, l = teamOverview.length; i < l; i++) {
    map[teamOverview[i].id] = teamOverview[i];
}



svg.selectAll(".bar")
    .data(d3.entries(teamOverview))
    .enter().append("rect") 
    .attr("class", "bar")
    .attr("x", function(d) {
        return x(d['value']['name'].split(' ')[d['value']['name'].split(' ').length - 1]); 
      })
    .attr("width", x.bandwidth())
    .attr("fill", function(d) {
        return d3.interpolatePlasma(colorRange(d['value']['contract'][yearSelected]['cap-hit']));
      })
    .attr("y", function(d) {
        return y(d['value']['contract'][yearSelected]['cap-hit']);
      })
    .attr("height", function(d) {
      return height - y(d['value']['contract'][yearSelected]['cap-hit']);
    });  


  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "bar-x-axis")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("x", 30)
      .attr("y", -5)
      .attr("transform", "rotate(90)");


  let yAxis = d3.axisLeft(y)
              .tickFormat(d3.format("$.3s"));      

  // add the y Axis
  svg.append("g")
      .attr("class", "bar-y-axis")
      .call(yAxis);



       
   
               
}

function createTeamPie(teamOverview) {
  teamOverview = d3.entries(teamOverview);

  let margin = {top: 20, right: 20, bottom:20, left: 20},
      width = 847 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      radius = Math.min(width, height) / 2,
      donutWidth = 75,
      legendRectSize = 18,
      legendSpacing = 4;

  let color = d3.scaleOrdinal(d3.schemeCategory10);

  let svg = d3.select('#salary-pie-chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + (width / 2) + 
              ',' + (height / 2) + ')');

  let arc = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);

  let pie = d3.pie()
    .value(function(d) { return d.value.salary; })
    .sort(null);

  let tooltip = d3.select('#salary-pie-chart')                    
    .append('div')                                                
    .attr('class', 'pie-tooltip');                                    
                
  tooltip.append('div')                                           
    .attr('class', 'label');                                      
       
  tooltip.append('div')                                           
    .attr('class', 'count');                                      

  tooltip.append('div')                                           
    .attr('class', 'percent');                                    


  let path = svg.selectAll('path')
      .data(pie(teamOverview))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d, i) { 
        return color(d.data.key); 
      });
      
      path.transition()
          .duration(1000)
          .attrTween("d", arcTween);

    path.on('mouseover', function(d) {                         
      let total = d3.sum(teamOverview.map(function(d) {                
        return d.value.salary;                                           
      }));                                                        
      let percent = Math.round(1000 * d.data.value.salary / salaryCap) / 10; 
      tooltip.select('.label').html(d.data.key);                
      tooltip.select('.count').html(`$${d.data.value.salary.toLocaleString()}`);                
      tooltip.select('.percent').html(`${percent}% of cap`);             
      tooltip.style('display', 'block');                          
    });                                                           
    
    path.on('mouseout', function() {                              
      tooltip.style('display', 'none');                           
    });                                                           

    path.on('mousemove', function(d) {        
      tooltip.style('top', (d3.event.pageY - 250) + 'px')          
        .style('left', (d3.event.pageX) + 'px');             
    });                                                           
      
    let legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        let height = legendRectSize + legendSpacing;
        let offset =  height * color.domain().length / 2;
        let horz = -2 * legendRectSize;
        let vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)                                   
      .style('fill', color)
      .style('stroke', color);
      
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { return d; });



  function arcTween(d) {
    var i = d3.interpolate(this._current, d);

    this._current = i(0);

    return function(t) {
      return arc(i(t))
    }

  }  

  
}



document.getElementById('change-year-btn').onclick = (evt) =>{
  let event = evt || window.event,
      target = event.target || event.srcElement,
      yearKey = target.getAttribute('data-year-toggle');

      if(yearKey){
        switchYear(yearKey);
      }
}


function switchYear(year) {
  yearSelected = year;

  
  let fresherData = JSON.parse(JSON.stringify(freshData));
  //list all players on team breakdown section
  updateTeamBreakdown(fresherData);
  //run some math on all players
  let overview = populateTeamOverviews(fresherData);
  updateTeamPie(overview);
  //team salary bar chart by player
  updateTeamBarChart(fresherData);
}




function updateTeamBreakdown(team) {

  let forwardsDiv = document.getElementById(`team-breakdown-forwards`),
      defenseDiv = document.getElementById(`team-breakdown-defense`),
      goaliesDiv = document.getElementById(`team-breakdown-goalies`);

  while (forwardsDiv.firstChild) {
    forwardsDiv.removeChild(forwardsDiv.firstChild);
  }   
  
  while (defenseDiv.firstChild) {
    defenseDiv.removeChild(defenseDiv.firstChild);
  } 

  while (goaliesDiv.firstChild) {
    goaliesDiv.removeChild(goaliesDiv.firstChild);
  }    

  for(let playerKey in team){
    let player = team[playerKey],
        pos = player.pos;

    if(!player.contract[yearSelected])
        continue;
    

    let a = document.createElement('span');
        a.className = 'list-group-item';
        a.href="javascript:;";
        a.setAttribute("player-key", playerKey);
        a.innerHTML = `${player.name}<span class="pull-right text-muted small">$${player.contract[yearSelected]["nhl-salary"].toLocaleString()}</span>`;

    switch(pos){
      case 'F':
          forwardsDiv.appendChild(a);
      break;
      case 'D':
          defenseDiv.appendChild(a);
          break;
      case 'G':
          goaliesDiv.appendChild(a);
          break;
      default:
          break;
    }
  }
}



function updateTeamPie(teamOverview) {

  let margin = {top: 20, right: 20, bottom:20, left: 20},
    width = 847 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2,
    donutWidth = 75;

  teamOverview = d3.entries(teamOverview);

  let pie = d3.pie()
    .value(function(d) { return d.value.salary; })
    .sort(null);

  let arc = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);  

  let svg = d3.select('#salary-pie-chart svg');
  let path = svg.selectAll("path");

  let data = pie(teamOverview);

  path = path.data(data);
  path.transition()
      .duration(1000)
      .attrTween("d", arcTween);

  function arcTween(d) {
    var i = d3.interpolate(this._current, d);

    this._current = i(0);

    return function(t) {
      return arc(i(t))
    }

  }
}







function updateTeamBarChart(teamOverview) {

  //deletes player if he doesn't have a contract
  for(let player in teamOverview){
    let playerObj = teamOverview[player];
    if(!playerObj["contract"][yearSelected]){
        delete teamOverview[player];
    }
  }


  let margin = {top: 20, right: 20, bottom:80, left: 60},
      width = 847 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
      // set the ranges
      let x = d3.scaleBand()
              .range([0, width])
              .padding(0.1);

      let y = d3.scaleLinear()
              .range([height, 0]);

      let colorRange = d3.scaleLinear();
          colorRange.domain([0, d3.max(d3.entries(teamOverview), function(d) {
          if(d['value']["contract"][yearSelected]){
            return d['value']['contract'][yearSelected]['cap-hit']; 
          }
        })]); 



      d3.select("#team-bar-chart").selectAll('svg').remove().exit();
  let svg = d3.select("#team-bar-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 


        x.domain(Object.keys(teamOverview).map(function(d) {
            return teamOverview[d]['name'].split(' ')[(teamOverview[d]['name'].split(' ').length) - 1];
        })); 
        y.domain([0, d3.max(d3.entries(teamOverview), function(d) {
            return d['value']['contract'][yearSelected]['cap-hit']; 
        })]);


for (let i = 0, l = teamOverview.length; i < l; i++) {
    map[teamOverview[i].id] = teamOverview[i];
}




svg.selectAll(".bar")
    .data(d3.entries(teamOverview))
    .enter().append("rect") 
    .attr("class", "bar")
    .attr("x", function(d) {
        return x(d['value']['name'].split(' ')[d['value']['name'].split(' ').length - 1]); 
      })
    .attr("width", x.bandwidth())
    .attr("fill", function(d) {
        return d3.interpolatePlasma(colorRange(d['value']['contract'][yearSelected]['cap-hit']));
      })
    .attr("y", function(d) {
        return y(d['value']['contract'][yearSelected]['cap-hit']);
      })
    .attr("height", function(d) {
      return height - y(d['value']['contract'][yearSelected]['cap-hit']);
    });  


  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "bar-x-axis")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("x", 30)
      .attr("y", -5)
      .attr("transform", "rotate(90)");


  let yAxis = d3.axisLeft(y)
              .tickFormat(d3.format("m"));    




  // add the y Axis
  svg.append("g")
      .attr("class", "bar-y-axis")
      .call(yAxis);   
}





// function switchPlayerCharts(team, playerKey) {
//   let player = team[playerKey];

//   changeDom('player', player.name);

//   populatePlayerBarChart(player);
//   generatePlayerStats();
// }



// function changeDom(view, name) {
//   let pageTitle = document.getElementsByTagName('h1')[0],
//       mainCapBreakdown = document.getElementsByClassName('main-cap-breakdown')[0],
//       chartOneTitle = document.getElementById('chart-1-title'),
//       chartTwoTitle = document.getElementById('chart-2-title');

//   let teamPieChart = document.getElementById('salary-pie-chart'),
//       teamBarChart = document.getElementById('team-bar-chart'),
//       teamStandingsContainer = document.getElementById('team-standings-conatiner'); 

//   //player vars
//   let playerSalaryChart = document.getElementById('player-salary-chart'),
//       playerScatterPlot = document.getElementById('player-scatter-plot');


//   if (view === 'player'){
//       pageTitle.innerHTML = name;

//       chartOneTitle.innerHTML = 'Player Salary Breakdown';
//       chartTwoTitle.innerHTML = 'Player Corsi Plot';

//       if(mainCapBreakdown.className.indexOf('hide') === -1){
//           mainCapBreakdown.className += ' hide';
//       }

//       if(teamPieChart.className.indexOf('hide') === -1){
//           teamPieChart.className += ' hide';
//       }

//       if(teamBarChart.className.indexOf('hide') === -1){
//           teamBarChart.className += ' hide';
//       }

//       if(teamStandingsContainer.className.indexOf('hide') === -1){
//           teamStandingsContainer.className += ' hide';
//       }

//       playerSalaryChart.className = "";
//       playerScatterPlot.className = playerScatterPlot.className.replace(/\b\shide\b/, "");

//   }else{
//       pageTitle.innerHTML = 'Team Breakdown';
//       chartOneTitle.innerHTML = 'Team Cap Pie Chart';
//       chartTwoTitle.innerHTML = 'Player Salaries Bar Chart';

//       if(playerSalaryChart.className.indexOf('hide') === -1){
//           playerSalaryChart.className += ' hide';
//       }

//       if(playerScatterPlot.className.indexOf('hide') === -1){
//           playerScatterPlot.className += ' hide';
//       }

//       mainCapBreakdown.className = mainCapBreakdown.className.replace(/\b\shide\b/, "");
//       teamStandingsContainer.className = teamStandingsContainer.className.replace(/\b\shide\b/, "");
//       teamBarChart.className = teamBarChart.className.replace(/\b\shide\b/, "");
//       teamPieChart.className = "";
//   }


// }


// function generatePlayerStats() {
// //Width and height
// var w = 700;
// var h = 500;
// var padding = 30;

// //Dynamic, random dataset
// var dataset = [];
// var numDataPoints = 82;
// for (var i = 0; i < numDataPoints; i++) {
//     var corsiRating = (Math.random() * 100).toFixed(1);
//     var toi = Math.floor(Math.random() * 30) + 1;

//     dataset.push([i, toi, corsiRating]);
// }

// //Create scale functions
// var xScale = d3.scaleLinear()
//                 .domain([0, d3.max(dataset, function(d) { return d[1]; })])
//                 .range([padding, w - padding * 2]);

// var yScale = d3.scaleLinear()
//                 .domain([0, d3.max(dataset, function(d) { return d[2]; })])
//                 .range([h - padding, padding]);

// var rScale = d3.scaleLinear()
//                 .domain([0, d3.max(dataset, function(d) { return d[2]; })])
//                 .range([2, 5]);


// //var formatAsPercentage = d3.format(".1%");
// var xAxis = d3.axisBottom(xScale).ticks(5);
// var yAxis = d3.axisLeft(yScale).ticks(5);//.tickFormat(formatAsPercentage);




// d3.select("#player-scatter-plot").selectAll('svg').remove().exit();
// //Create SVG element
// var svg = d3.select("#player-scatter-plot")
//          .append("svg")
//          .attr("width", w + padding)
//          .attr("height", h + padding);

//  // Define the div for the tooltip
// var div = svg.append("div") 
//     .attr("class", "tooltip-player-scatter")       
//     .style("opacity", 0);        

// //Create circles
// svg.selectAll("circle")
//    .data(dataset)
//    .enter()
//    .append("circle")
//    .attr("cx", function(d) {
//          return xScale(d[1]);
//    })
//    .attr("cy", function(d) {
//          return yScale(d[2]);
//    })
//    .attr("r", function(d) {
//          return rScale(d[2]);
//    }).on("mouseover", function(d) {   
//           div.transition()    
//               .duration(200)    
//               .style("opacity", .9);    
//           div.html("hi")  
//               .style("left", (d3.event.pageX) + "px")   
//               .style("top", (d3.event.pageY - 28) + "px");  
//         })          
//         .on("mouseout", function(d) {   
//             div.transition()    
//                 .duration(500)    
//                 .style("opacity", 0); 
//         });




// //Create X axis
// svg.append("g")
//    .attr("class", "axis")
//    .attr("transform", "translate(0," + (h - padding) + ")")
//    .call(xAxis);

// svg.append("text")             
//       .attr("transform",
//             "translate(" + (w/2) + " ," + (h) + ")")
//       .style("text-anchor", "middle")
//       .text("Minutes Played");     

// //Create Y axis
// svg.append("g")
//    .attr("class", "axis")
//    .attr("transform", "translate(" + padding +",0)")
//    .call(yAxis);   


// svg.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", "-3px")
//       .attr("x",0 - (h / 2))
//       .attr("dy", "1em")
//       .style("text-anchor", "middle")
//       .text("Corsi (%)");  

// }





// function populatePlayerBarChart(player) {

// var dataset = [ ["One", 5], ["Two", 10], ["Three", 15], ["Four", 20], ["Five", 25], ["Six", 30], ["Seven", 35], ["Eight", 40], ["Nine", 45], ["Ten", 50]];

// for(var i in player.contract){
//   player.contract[i]['year'] = i;
// }

// var contractInfo = Object.values(player.contract);



//  // format the data
//   dataset.forEach(function(d) {
//     d[1] = +d[1];
//   });

// var margin = {top: 20, right: 20, bottom: 30, left: 40},
//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// var x = d3.scaleBand()
//           .range([0, width])
//           .padding(0.1);
// var y = d3.scaleLinear()
//           .range([height, 0]);

// var stack = d3.stack().keys(['nhl-salary', 'signing-bonus', 'player-bonus']);
// let capHit = d3.line().x(d => { console.log(d); return x(d.year)}).y(d => { return y(d['cap-hit'])});

// let colorRange = d3.scaleLinear();
//     colorRange.domain([0, 10000000]);           


// var svg = d3.select("#player-salary-chart").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom);
// var g = svg.append("g")
//     .attr("transform", 
//           "translate(" + margin.left + "," + margin.top + ")"); 

//   x.domain(['2016-2017', '2017-2018', '2018-2019', '2019-2020']);
//   y.domain([0, 10000000]);



//   // append the rectangles for the bar chart
//   svg.selectAll(".bar")
//       .data(contractInfo)
//     .enter().append("rect")
//       .attr("class", "bar")
//       .attr("x", function(d) { return x(d.year); })
//       .attr("width", x.bandwidth())
//       .attr("fill", function(d) {
//         return d3.interpolatePlasma(colorRange(d['nhl-salary']));
//       })
//       .attr("y", function(d) { return y(d['nhl-salary']); })
//       .attr("height", function(d) { return height - y(d['nhl-salary']); });         


//     svg.append("line")
//     .style("stroke", "black")
//     .attr("x1", 0)
//     .attr("y1", y(contractInfo[0]['cap-hit']))
//     .attr("x2", width)
//     .attr("y2", y(contractInfo[0]['cap-hit']));  


//   svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));                      


//    // add the y Axis
//   svg.append("g")
//       .call(d3.axisLeft(y));
// }
