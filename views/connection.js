var competitors = [], numProblems;

var socket = io();
var isAdmin = false;

socket.once('init', function(name, comp, prob){
    setup(name, prob.length);
    numProblems = prob.length;
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

socket.on('newCompetitor', function(comp){
    competitors[comp.id] = comp;
    competitors[comp.id].overall = calcOverall(comp);
    insertCompetitor(competitors[comp.id]);
});

socket.on('login', function(success){
    isAdmin = success;
    if (success){
        load('r');
        document.getElementById('block_add').style.display='block';
    }
    else{
        alert("wrong username or password");
        document.getElementById('block_add').style.display='none';
    }
});

function updateRes(problem, id){
    let value = document.getElementById('currentResult').value;
    if (value != undefined && value != "" && value<=10 && value>=-1){
        socket.emit('updateResult',id, problem-1, value);
    }
    hideInput();
    return false;
}
function addCompetitor(){
    let name = document.getElementById('new_comp_name').value;
    let grade = document.getElementById('new_comp_grade').value;
    if (name!=undefined && name!="" && grade!=undefined && grade!=""){
        socket.emit('addCompetitor', name, grade);
        document.getElementById('new_comp_name').value = "";
        document.getElementById('new_comp_grade').value = "";
    }
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
        if (!competitor.p[i] || competitor.p[i]==-1){p[i]=0;}
    }
    p.sort(function(a, b){return Number(b)-Number(a);});
    ans = parseFloat(p[0]+p[1]+p[2]+p[3]/10+p[4]/100+p[5]/1000).toFixed(3);
    return ans;
}