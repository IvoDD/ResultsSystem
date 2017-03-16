function updateResults(){}

var lastActive = 'r';
var blocks = {'r': "block_results",
              'r1': "block_zad1",
              'r2': "block_zad2",
              'r3': "block_zad3",
              'r4': "block_zad4",
              'r5': "block_zad5",
              'r6': "block_zad6",
              'l': "block_login"};

function clear(){
    document.getElementById(lastActive).className="";
    document.getElementById(blocks[lastActive]).style.display = "none";
}

function load(nav){
    clear();
    lastActive = nav;
    document.getElementById(nav).className="active";
    document.getElementById(blocks[nav]).style.display = "block";
}

function num(result){
    return result=='-'?0:Number(result);
}

function renumber(res){
    var last = res.firstChild.nextSibling, lastid = 1;
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
    while (before.previousSibling.lastChild != null && num(before.previousSibling.lastChild.innerHTML) < competitor.overall){
        before = before.previousSibling;
    }
    parent.insertBefore(curr, before);
    
    for (let i=1; i<7; ++i){
        curr = document.getElementById('z' + i + competitor.id);
        parent = curr.parentNode;
        before = curr;
        while (before.previousSibling.lastChild != null && (num(before.previousSibling.lastChild.innerHTML)) < competitor.p[i-1]){
            before = before.previousSibling;
        }
        parent.insertBefore(curr, before);
    }
    
    renumber(document.getElementById('results'));
    for (let i=1; i<7; ++i){
        renumber(document.getElementById('zad'+i));
    }
}

var numComp = 0;

function parse(a){
    if (a==undefined){return '-';}
    return a;
}

function insertCompetitor(competitor){
    ++numComp;
    document.getElementById('results').insertAdjacentHTML('beforeEnd', 
                                        "<tr id = 're" + competitor.id + "'>" +
                                        "<td>" + numComp + "</td>" +
                                        "<td>" + competitor.name + "</td>" +
                                        "<td>" + parse(competitor.p[0]) + "</td>" +
                                        "<td>" + parse(competitor.p[1]) + "</td>" +
                                        "<td>" + parse(competitor.p[2]) + "</td>" +
                                        "<td>" + parse(competitor.p[3]) + "</td>" +
                                        "<td>" + parse(competitor.p[4]) + "</td>" +
                                        "<td>" + parse(competitor.p[5]) + "</td>" +
                                        "<td>" + competitor.overall + "</td>" +
                                        "</tr>");
    for (let i=0; i<6; ++i){
        document.getElementById('zad'+(i+1)).insertAdjacentHTML('beforeEnd',
                                        "<tr id = 'z" + (i+1) + competitor.id + "'>" +
                                        "<td>" + numComp + "</td>" + 
                                        "<td>" + competitor.name + "</td>" + 
                                        "<td>" + parse(competitor.p[i]) + "</td>" + 
                                        "</tr>");
    }
    updatePos(competitor);
}