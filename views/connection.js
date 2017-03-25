var competitors = [];

var socket = io();
var isAdmin = false;

socket.on('init', function(comp){
    competitors = comp;
    for (let i=0; i<competitors.length; ++i){
        if (competitors[i]){
            competitors[i].overall = calcOverall(competitors[i]);
            insertCompetitor(competitors[i]);
        }
    }
});

socket.on('changeResult', function(comp){
    competitors[comp.id] = comp;
    competitors[comp.id].overall = calcOverall(comp);
    updateCompetitor(competitors[comp.id]);
});

socket.on('login', function(success){
    isAdmin = success;
    if (success){load('r');}
    else{alert("wrong username or password");}
});

function updateRes(problem, id){
    socket.emit('updateResult',id, problem-1, document.getElementById('currentResult').value);
    hideInput();
    return false;
}

function login(){
    socket.emit('login', getSigninData());
    return false;
}

function calcOverall(competitor){
    var ans, p = [];
    for (let i=0; i<6; ++i){
        p[i] = Number(competitor.p[i]);
        if (competitor.p[i]==undefined){p[i]=0;}
    }
    p.sort(function(a, b){return Number(a)<Number(b);});
    ans = parseFloat(p[0]+p[1]+p[2]+p[3]/10+p[4]/100+p[5]/1000).toFixed(3);
    return ans;
}