var competitors = [];

var socket = io();

socket.on('init', function(comp){
    competitors = comp;
    for (let i=0; i<competitors.length; ++i){
        if (competitors[i]){
            competitors[i].overall = calcOverall(competitors[i]);
            insertCompetitor(competitors[i]);
        }
    }
});

function calcOverall(competitor){
    var ans, p = [];
    for (let i=0; i<6; ++i){
        p[i] = competitor.p[i];
        if (p[i]==undefined){p[i]=0;}
    }
    p.sort(function(a, b){return Number(a)<Number(b);});
    ans = parseFloat(p[0]+p[1]+p[2]+p[3]/10+p[4]/100+p[5]/1000).toFixed(3);
    return ans;
}