var lastActive = 'r';
var blocks = {'r': "block_results",
              'l': "block_login",
              'c': "block_credits"};

var lastProblem = 0, lastId = 0, hiksche = 0, t=0;

window.addEventListener('keydown', function(event){
    if (event.key=="Escape"){hideInput();}
});

window.addEventListener('mousedown', function(event){
    t = performance.now();
});

function setup(name, prob){
    document.getElementById('competition_name').innerHTML = name;
    for (let i=1; i<=prob; ++i){
        blocks['r'+i]=('block_zad'+i);
        
        document.getElementById('c').insertAdjacentHTML('beforebegin', "<li id='r" + i +"'><a href='#" +i+ "' onclick='load(\"r" +i+ "\")'>Задача " +i+ "</a></li>");
        
        document.getElementById('overall').insertAdjacentHTML('beforebegin', "<th>Зад. " +i+ "</th>");
        
        document.getElementById('block_login').insertAdjacentHTML('beforebegin', 
        '<div class="container" id="block_zad' +i+ '" style="display: none;">'+
        '<div>' +
        '<h1>Резултати по задача '+i+'</h1>' +
        '<table class="table table-striped">' +
            '<thead>' +
              '<tr>' +
                '<th>#</th>' +
                '<th>Имена</th>' +
                '<th>Зад. '+i+'</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="zad'+i+'">' +
            '</tbody>' +
          '</table>' +
        '</div>' +
        '</div>');
    }
}

function clear(){
    document.getElementById(lastActive).className="";
    document.getElementById(blocks[lastActive]).style.display = "none";
    if (lastActive=='c'){document.getElementById('block_login').style.display = "none";}
}

function load(nav){
    clear();
    lastActive = nav;
    document.getElementById(nav).className="active";
    if (nav=='c' && performance.now()-t>1000){
        document.getElementById('block_login').style.display = "block";
    }
    else{
        document.getElementById(blocks[nav]).style.display = "block";
    }
}

function num(result){
    return result=='-'?0:Number(result);
}

function renumber(res){
    var last = res.firstChild, lastid = 1;
    var prev = last, curr = prev.nextSibling;
    
    for (let i=2; prev.lastChild != null; ++i){
        if (curr==null || curr.lastChild==null || num(prev.lastChild.innerHTML) > num(curr.lastChild.innerHTML)){
            if (lastid == i-1){
                last.firstChild.innerHTML = lastid;
            }else{
                while (last != prev){
                    last.firstChild.innerHTML = lastid + '-' + (i-1);
                    last = last.nextSibling;
                }
                last.firstChild.innerHTML = lastid + '-' + (i-1);
            }
            lastid = i;
            last = curr;
        }
        prev = curr;
        if (curr == null){break;}
        curr = curr.nextSibling;
    }
}

function updatePos(competitor){
    var curr = document.getElementById('re' + competitor.id);
    var parent = curr.parentNode;
    var before = curr;
    while (before.previousSibling && before.previousSibling.lastChild != null && num(before.previousSibling.lastChild.innerHTML) < competitor.overall){
        before = before.previousSibling;
    }
    parent.insertBefore(curr, before);
    
    for (let i=1; i<=numProblems; ++i){
        curr = document.getElementById('z' + i + competitor.id);
        parent = curr.parentNode;
        before = curr;
        while (before.previousSibling && before.previousSibling.lastChild != null && (num(before.previousSibling.lastChild.innerHTML)) < competitor.p[i-1]){
            before = before.previousSibling;
        }
        parent.insertBefore(curr, before);
    }
    
    renumber(document.getElementById('results'));
    for (let i=1; i<=numProblems; ++i){
        renumber(document.getElementById('zad'+i));
    }
}

var numComp = 0;

function parse(a){
    if (a==undefined){return '-';}
    return a;
}
function parse2(a){
    if (a==undefined){return '';}
    return a;
}

function updateCompetitor(competitor){
    let row = document.getElementById('re' + competitor.id);
    let child = row.firstChild.nextSibling;
    child.innerHTML = competitor.name;
    for (let i=0; i<numProblems; ++i){
        child = child.nextSibling;
        child.innerHTML = parse(competitor.p[i]);
        document.getElementById('z'+(i+1)+competitor.id).lastChild.innerHTML = parse(competitor.p[i]);
    }
    child.nextSibling.innerHTML = competitor.overall;
    updatePos(competitor);
}

function insertCompetitor(competitor){
    ++numComp;
    let html = "<tr id = 're" + competitor.id + "'>" +
               "<td>" + numComp + "</td>" +
               "<td>" + competitor.name + "</td>";
    for (let i=0; i<numProblems; ++i){
        html += "<td>" + parse(competitor.p[i]) + "</td>";
    }
    html += "<td>" + competitor.overall + "</td>" + "</tr>";
    document.getElementById('results').insertAdjacentHTML('beforeEnd', html);
    
    for (let i=0; i<numProblems; ++i){
        document.getElementById('zad'+(i+1)).insertAdjacentHTML('beforeEnd',
                                        "<tr id = 'z" + (i+1) + competitor.id + "'>" +
                                        "<td>" + numComp + "</td>" + 
                                        "<td>" + competitor.name + "</td>" + 
                                        "<td>" + parse(competitor.p[i]) + "</td>" + 
                                        "</tr>");
        document.getElementById('z' + (i+1) + competitor.id).addEventListener('click', function(){editResult(i+1, competitor.id)});
    }
    updatePos(competitor);
}

function hideInput(problem=lastProblem, id=lastId){
    //console.log('hiding');
    let row = document.getElementById('z' + problem + id);
    if (row){
        row.lastChild.innerHTML = parse(competitors[id].p[problem-1]);
    }
    lastProblem = lastId = 0;
}

function editResult(problem, id){
    if (hiksche){hiksche=0; return;}
    //console.log('editing', problem, id);
    if (!isAdmin || problem==lastProblem && id==lastId){return;}
    hideInput();
    lastProblem = problem; lastId = id;
    let row = document.getElementById('z' + problem + id);
    row.lastChild.innerHTML = "<form onsubmit='return updateRes(" +problem+ ", " +id+ ")' style='display:inline-block;height:30px;'>" +
                              "<input style='display:inline;' type='number' min='0' max='10' id='currentResult' autofocus value='"+ parse2(competitors[id].p[problem-1]) +"'>" + 
                              "<input type='image' src='/green_tick.png' alt='Submit' style='display:inline;height:30px;width:30px;'>" +
                              "<input type='image' src='/red_cross.png' style='display:inline;height:30px;width:30px;' onclick='hideInput();hiksche=1;'>" +
                              "</form>";
    document.getElementById('currentResult').select();
}

function getSigninData(){
    let ans = {};
    ans.username = document.getElementById('inputEmail').value;
    document.getElementById('inputEmail').value = "";
    ans.password = document.getElementById('inputPassword').value;
    document.getElementById('inputPassword').value = "";
    return ans;
}