

function cancelSelection (fromTagCloud) {
    pr("\t***in cancelSelection");
    highlightSelectedNodes(false); //Unselect the selected ones :D
    opossites = [];
    selections = [];
    //selections.length = 0;
    selections.splice(0, selections.length);
    TW.partialGraph.refresh();

    TW.partialGraph.states.slice(-1)[0].selections=[]
    
    
    //Nodes colors go back to normal
    overNodes=false;
    e = TW.partialGraph._core.graph.edges;
    for(i=0;i<e.length;i++){
            e[i].color = e[i].attr['grey'] ? e[i].attr['true_color'] : e[i].color;
            e[i].attr['grey'] = 0;
    }
    TW.partialGraph.draw(2,1,2);
                
    TW.partialGraph.iterNodes(function(n){
            n.active=false;
            n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
            n.attr['grey'] = 0;
    }).draw(2,1,2);
    //Nodes colors go back to normal
    
    
    if(fromTagCloud==false){
        $("#names").html(""); 
        $("#topPapers").html(""); $("#topPapers").hide();
        $("#opossiteNodes").html(""); $("#tab-container").hide();
        $("#information").html("");
        $("#searchinput").val("");
        $("#switchbutton").hide();
        $("#tips").html(getTips());
    }   
    for(var i in deselections){
        if( !isUndef(TW.partialGraph._core.graph.nodesIndex[i]) ) {
            TW.partialGraph._core.graph.nodesIndex[i].forceLabel=false;
            TW.partialGraph._core.graph.nodesIndex[i].neighbour=false;
        }
    }
    deselections={};
    // leftPanel("close");
    if(TW.partialGraph.states.slice(-1)[0].level)
        LevelButtonDisable(true);

    TW.partialGraph.draw();
}

function highlightSelectedNodes(flag){ 
    pr("\t***methods.js:highlightSelectedNodes(flag)"+flag+" selEmpty:"+is_empty(selections))
    if(!is_empty(selections)){          
        for(var i in selections) {
            if(TW.Nodes[i].type==TW.catSoc && swclickActual=="social"){
                node = TW.partialGraph._core.graph.nodesIndex[i];
                node.active = flag;
            }
            else if(TW.Nodes[i].type==TW.catSem && swclickActual=="semantic") {
                node = TW.partialGraph._core.graph.nodesIndex[i];
                node.active = flag;
            }
            else if(swclickActual=="sociosemantic") {
                node = TW.partialGraph._core.graph.nodesIndex[i];
                node.active = flag;
            }
            else break;        
        }
        
    }
}

function alertCheckBox(eventCheck){    
    if(!isUndef(eventCheck.checked)) checkBox=eventCheck.checked;
}

// States:
// A : Macro-Social
// B : Macro-Semantic
// A*: Macro-Social w/selections
// B*: Macro-Semantic w/selections
// a : Meso-Social
// b : Meso-Semantic
// AaBb: Socio-Semantic
function RefreshState(newNOW){

    pr("\t\t\tin RefreshState newNOW:_"+newNOW+"_.")

	if (newNOW!="") {
	    PAST = NOW;
	    NOW = newNOW;
		
		// if(NOW=="a" || NOW=="A" || NOW=="AaBb") {
		// 	$("#category-A").show();
		// }
		// if(NOW=="b" || NOW=="B" || NOW=="AaBb") {
		// 	$("#category-B").show();
		// }
	}

    $("#category-A").hide();
    $("#category-B").hide();  
    // i=0; for(var s in selections) { i++; break;}
    // if(is_empty(selections) || i==0) LevelButtonDisable(true);
    // else LevelButtonDisable(false);

    //complete graphs case
    // sels=getNodeIDs(selections).length
    if(NOW=="A" || NOW=="a") {
    	// N : number of nodes
    	// k : number of ( selected nodes + their neighbors )
    	// s : number of selections
        var N=( Object.keys(TW.Nodes).filter(function(n){return TW.Nodes[n].type==TW.catSoc}) ).length
        var k=Object.keys(getNeighs(Object.keys(selections),nodes1)).length
        var s=Object.keys(selections).length
        pr("in social N: "+N+" - k: "+k+" - s: "+s)
        if(NOW=="A"){
            if( (s==0 || k>=(N-1)) ) {
                LevelButtonDisable(true);
            } else LevelButtonDisable(false);
            if(s==N) LevelButtonDisable(false);
        }

        if(NOW=="a") {
            LevelButtonDisable(false);
        }

        $("#semLoader").hide();
        $("#category-A").show();
        $("#colorGraph").show();
        
    }
    if(NOW=="B" || NOW=="b") {
        var N=( Object.keys(TW.Nodes).filter(function(n){return TW.Nodes[n].type==TW.catSem}) ).length
        var k=Object.keys(getNeighs(Object.keys(selections),nodes2)).length
        var s=Object.keys(selections).length
        pr("in semantic N: "+N+" - k: "+k+" - s: "+s)
        if(NOW=="B") {
            if( (s==0 || k>=(N-1)) ) {
                LevelButtonDisable(true);
            } else LevelButtonDisable(false);
            if(s==N) LevelButtonDisable(false);
        }

        if(NOW=="b") {
            LevelButtonDisable(false);
        }
        if ( semanticConverged ) {
            $("#semLoader").hide();
            $("#category-B").show();
            $.doTimeout(30,function (){
                EdgeWeightFilter("#sliderBEdgeWeight", "label" , "nodes2", "weight");
                NodeWeightFilter ( "#sliderBNodeWeight"  , "NGram", "type" , "size");
                
            });
        } else {
            $("#semLoader").css('visibility', 'visible');
            $("#semLoader").show();
        }

    }
    if(NOW=="AaBb"){
        LevelButtonDisable(true);
        $("#category-A").show();
        $("#category-B").show();
    }

    TW.partialGraph.draw();

}

function pushSWClick(arg){
    swclickPrev = swclickActual;
    swclickActual = arg;
}

//	tag cloud div
function htmlfied_alternodes(elems) {
    var oppositesNodes=[]
    js1='onclick="graphTagCloudElem(\'';
    js2="');\""
    frecMAX=elems[0].value
    for(var i in elems){
        id=elems[i].key
        frec=elems[i].value
        if(frecMAX==1) fontSize=desirableTagCloudFont_MIN;
        else {
            fontSize=
            desirableTagCloudFont_MIN+
            (frec-1)*
            ((desirableTagCloudFont_MAX-desirableTagCloudFont_MIN)/(frecMAX-1));
        }
        if(!isUndef(TW.Nodes[id])){
            //          js1            js2
            // onclick="graphTagCloudElem('  ');
            htmlfied_alternode = '<span class="tagcloud-item" style="font-size:'+fontSize+'px;" '+js1+id+js2+'>'+ TW.Nodes[id].label+ '</span>';
            oppositesNodes.push(htmlfied_alternode)
        }
    }
    return oppositesNodes
}

function manualForceLabel(nodeid,active) {
	// pr("manual|"+nodeid+"|"+active)
	TW.partialGraph._core.graph.nodesIndex[nodeid].active=active;
	TW.partialGraph.draw();
}

function htmlfied_samenodes(elems) {
    var sameNodes=[]
    js1=' onmouseover="manualForceLabel(this.id,true);" ';
    js2=' onmouseout="manualForceLabel(this.id,true);" ';
    if(elems.length>0) {
        var A = getVisibleNodes()
        for (var a in A){
            n = A[a]
            if(!n.active && n.color.charAt(0)=="#" ) {
                sameNodes.push('<li onmouseover="manualForceLabel(\''+n.id+'\',true)"  onmouseout="manualForceLabel(\''+n.id+'\',false)" ><a>'+ n.label+ '</a></li>')
            }
        }
    }
    return sameNodes
}

// nodes information div
function htmlfied_nodesatts(elems){

    var socnodes=[]
    var semnodes=[]
    for(var i in elems) {

        information=[]

        var id=elems[i]
        var node = TW.Nodes[id]

        if (TW.mainfile) {
            var addname = (node.attributes["name"])?node.attributes["name"]:"";
            google='<a target="_blank" href="http://www.google.com/search?q='+addname+"+"+node.label.replace(" ","+")+'">';
            information += '<li><b>'+ google + node.label + '</a></b></li>';
            for (var i in node.attributes) {
                if(i=="cluster_label")
                    information += '<li>&nbsp;&nbsp;'+i +" : " + node.attributes[i] + '</li>';
            }
            socnodes.push(information);
        } else {
            if(node.type==TW.catSoc){
                information += '<li><b>' + node.label + '</b></li>';
                if(node.htmlCont==""){
                    if (!isUndef(node.level)) {
                        information += '<li>' + node.level + '</li>';
                    }
                } else {
                    information += '<li>' + $("<div/>").html(node.htmlCont).text() + '</li>';
                }        
                socnodes.push(information)
            }

            if(node.type==TW.catSem){
                information += '<li><b>' + node.label + '</b></li>';
                google='<a href=http://www.google.com/#hl=en&source=hp&q=%20'+node.label.replace(" ","+")+'%20><img src="'+'img/google.png"></img></a>';
                wiki = '<a href=http://en.wikipedia.org/wiki/'+node.label.replace(" ","_")+'><img src="'+'img/wikipedia.png"></img></a>';
                flickr= '<a href=http://www.flickr.com/search/?w=all&q='+node.label.replace(" ","+")+'><img src="'+'img/flickr.png"></img></a>';
                information += '<li>'+google+"&nbsp;"+wiki+"&nbsp;"+flickr+'</li><br>';
                semnodes.push(information)
            }
        }
    }
    return socnodes.concat(semnodes)
}


function manualSelectNode ( nodeid ) {
    cancelSelection(false);
    var SelInst = new SelectionEngine();
    SelInst.MultipleSelection2({nodes:[nodeid]});
}

function htmlfied_tagcloud(elems , limit) {
    var oppositesNodes=[]
    js1="" //'onclick="graphTagCloudElem(\'';
    js2="" //"');\""
    frecMAX=elems[0].value
    for(var i in elems){
        if(i==limit)
            break
        id=elems[i].key
        frec=elems[i].value
        if(frecMAX==1) fontSize=desirableTagCloudFont_MIN;
        else {
            fontSize=
            desirableTagCloudFont_MIN+
            (frec-1)*
            ((desirableTagCloudFont_MAX-desirableTagCloudFont_MIN)/(frecMAX-1));
        }
        if(!isUndef(TW.Nodes[id])){
            //          js1            js2
            // onclick="graphTagCloudElem('  ');
            var jspart = ' onclick="manualSelectNode(\''+id+'\')" onmouseover="manualForceLabel(\''+id+'\',true)"  onmouseout="manualForceLabel(\''+id+'\',false)"'
            htmlfied_alternode = '<span class="tagcloud-item" style="font-size:'+fontSize+'px;" '+jspart+'>'+ TW.Nodes[id].label+ '</span>';
            oppositesNodes.push(htmlfied_alternode)
        }
    }
    return oppositesNodes
}

//missing: getTopPapers for both node types
//considering complete graphs case! <= maybe i should mv it
function updateLeftPanel_fix( sels , oppos ) {
    pr("updateLeftPanel() corrected version** ")
    var namesDIV=''
    var alterNodesDIV=''
    var informationDIV=''

    // var alternodesname=getNodeLabels(opos)

    namesDIV+='<div id="selectionsBox"><h4>';
    namesDIV+= getNodeLabels( sels ).join(' <b>/</b> ')//aqui limitar
    namesDIV += '</h4></div>';

    if(oppos.length>0) {
	    alterNodesDIV+='<div id="opossitesBox">';//tagcloud
	    alterNodesDIV+= htmlfied_alternodes( oppos ).join("\n") 
	    alterNodesDIV+= '</div>';
	}

    sameNodesDIV = "";
    if(getNodeIDs(sels).length>0) {
        var temp_voisinage = {}
        var A = getVisibleNodes()
        for (var a in A){
            var n = A[a]
            if(!n.active && n.color.charAt(0)=="#" ) {
                temp_voisinage[n.id] = Math.round(TW.Nodes[n.id].size)
            }
        }
        var voisinage = ArraySortByValue(temp_voisinage, function(a,b){
            return b-a
        });
        sameNodesDIV+='<div id="sameNodes">';//tagcloud
        sameNodesDIV+= htmlfied_tagcloud( voisinage , TW.tagcloud_limit).join("\n") 
        sameNodesDIV+= '</div>';
    }

        // getTopPapers("semantic");

    informationDIV += '<br><h4>Information:</h4><ul>';
    informationDIV += htmlfied_nodesatts( getNodeIDs(sels) ).join("<br>\n")
    informationDIV += '</ul><br>';

    //using the readmore.js
    // ive put a limit for nodes-name div
    // and opposite-nodes div aka tagcloud div
    // and im commenting now because github is not 
    // pushing my commit
    // because i need more lines, idk
    $("#names").html(namesDIV).readmore({maxHeight:100}); 
    $("#tab-container").show();
    $("#opossiteNodes").html(alterNodesDIV).readmore({maxHeight:200}); 
    $("#sameNodes").html(sameNodesDIV).readmore({maxHeight:200}); 
    $("#information").html(informationDIV);
    $("#tips").html("");

    if(TW.categoriesIndex.length==1) getTopPapers("semantic");
    else getTopPapers(swclickActual); 
}

function printStates() {
	pr("\t\t\t\t---------"+getClientTime()+"---------")
	pr("\t\t\t\tswMacro: "+swMacro)
	pr("\t\t\t\tswActual: "+swclickActual+" |  swPrev: "+swclickPrev)
	pr("\t\t\t\tNOW: "+NOW+" |  PAST: "+PAST)
	pr("\t\t\t\tselections: ")
	pr(Object.keys(selections))
	pr("\t\t\t\topposites: ")
	pr(Object.keys(opossites))
	pr("\t\t\t\t------------------------------------")
}

//	just css
//true: button disabled
//false: button enabled
function LevelButtonDisable( TF ){
	$('#changelevel').prop('disabled', TF);
}

//Fixed! apres: refactor!
function graphTagCloudElem(nodes) {
    pr("in graphTagCloudElem, nodae_id: "+nodes);
    cancelSelection();
    TW.partialGraph.emptyGraph();


    var ndsids=[]
    if(! $.isArray(nodes)) ndsids.push(nodes);
    else ndsids=nodes;

    var vars = []

    node_id = ndsids[0]

    var catDict = TW.partialGraph.states.slice(-1)[0].categoriesDict;
    var type = TW.Nodes[node_id].type;
    var next_state = [];
    for(var c in catDict)
        next_state.push( c==type )
    var str_nextstate = next_state.map(Number).join("|")


    var present = TW.partialGraph.states.slice(-1)[0]; // Last
    var level = present.level;
    var sels = [node_id];//[144, 384, 543]//TW.partialGraph.states.selections;Last
    var lastpos = TW.partialGraph.states.length-1;
    var avantlastpos = lastpos-1;

    // Dictionaries of: selection+neighbors
    var nodes_2_colour = {}
    var edges_2_colour = {}
    var voisinage = {}
    for(var i in sels) {
        s = sels[i];
        neigh = TW.Relations[str_nextstate][s]
        if(neigh) {
            for(var j in neigh) {
                t = neigh[j]
                nodes_2_colour[t]=false;
                edges_2_colour[s+";"+t]=true;
                edges_2_colour[t+";"+s]=true;
                if( !selections[t]  ) 
                    voisinage[ Number(t) ] = true;
            }
        }
    }
    for(var i in sels)
        nodes_2_colour[sels[i]]=true;


    for(var i in nodes_2_colour)
        add1Elem(i)
    for(var i in edges_2_colour)
        add1Elem(i)



    // Adding intra-neighbors edges O(voisinage²)
    voisinage = Object.keys(voisinage)
    for(var i=0;i<voisinage.length;i++) {
        for(var j=1;j<voisinage.length;j++) {
            if( voisinage[i]!=voisinage[j] ) {
                // console.log( "\t" + voisinage[i] + " vs " + voisinage[j] )
                add1Elem( voisinage[i]+";"+voisinage[j] )
            }
            
        }
    }
    
    futurelevel = false;


    // Nodes Selection now:
    if(sels.length>0) {
        var SelInst = new SelectionEngine();
        SelInst.MultipleSelection2({
                    nodesDict:nodes_2_colour,
                    edgesDict:edges_2_colour
                });
        overNodes=true;
    }

    TW.partialGraph.states[avantlastpos] = {};
    TW.partialGraph.states[avantlastpos].level = present.level;
    TW.partialGraph.states[avantlastpos].selections = present.selections;
    TW.partialGraph.states[avantlastpos].type = present.type; 
    TW.partialGraph.states[avantlastpos].opposites = present.opposites;
    TW.partialGraph.states[avantlastpos].categories = present.categories;//to_del
    TW.partialGraph.states[avantlastpos].categoriesDict = present.categoriesDict;//to_del


    TW.partialGraph.states[lastpos].setState({
        type: next_state,
        level: futurelevel,
        sels: Object.keys(selections).map(Number),
        oppos: []
    })

    TW.partialGraph.states[lastpos].categories = present.categories;//to_del
    TW.partialGraph.states[lastpos].categoriesDict = catDict;//to_del

    fa2enabled=true; TW.partialGraph.zoomTo(TW.partialGraph._core.width / 2, TW.partialGraph._core.height / 2, 0.8).draw().startForceAtlas2();

    ChangeGraphAppearanceByAtt(true)
}

function greyEverything(){
    
    nds = TW.partialGraph._core.graph.nodes.filter(function(n) {
                            return !n['hidden'];
                        });
    for(var i in nds){
            if(!nds[i].attr['grey']){
                nds[i].attr['true_color'] = nds[i].color;
                alphacol = "rgba("+hex2rga(nds[i].color)+",0.5)";
                nds[i].color = alphacol;
            }
            nds[i].attr['grey'] = 1;
    }
    
    eds = TW.partialGraph._core.graph.edges.filter(function(e) {
                            return !e['hidden'];
                        });
    for(var i in eds){
            if(!eds[i].attr['grey']){
                eds[i].attr['true_color'] = eds[i].color;
                eds[i].color = greyColor;
            }
            eds[i].attr['grey'] = 1;
    }
}

function graphResetColor(){
    nds = TW.partialGraph._core.graph.nodes.filter(function(x) {
                            return !x['hidden'];
          });
    eds = TW.partialGraph._core.graph.edges.filter(function(x) {
                            return !x['hidden'];
          });
          
    for(var x in nds){
        n=nds[x];
        n.attr["grey"] = 0;
        n.color = n.attr["true_color"];
    }
    
    for(var x in eds){
        e=eds[x];
        e.attr["grey"] = 0;
        e.color = e.attr["true_color"];
    }  
}

function hideEverything(){
    pr("\thiding all");
    nodeslength=0;
    for(var n in TW.partialGraph._core.graph.nodesIndex){
        TW.partialGraph._core.graph.nodesIndex[n].hidden=true;
    }
    for(var e in TW.partialGraph._core.graph.edgesIndex){
        TW.partialGraph._core.graph.edgesIndex[e].hidden=true;
    }
    overNodes=false;//magic line!
    pr("\tall hidded");
    //Remember that this function is the analogy of EmptyGraph
    //"Saving node positions" should be applied in this function, too.
}

function add1Elem(id) {

    id = ""+id;
    if(id.split(";").length==1) { // i've received a NODE
        id = parseInt(id)
        if(!isUndef(getn(id))) return;

        if(TW.Nodes[id]) {
            var anode = {}
            anode.id=id;
            anode.label=TW.Nodes[id].label;
            anode.size=TW.Nodes[id].size;
            anode.x=TW.Nodes[id].x;
            anode.y=TW.Nodes[id].y;
            anode.hidden=(TW.Nodes[id].lock)?true:false;
            anode.type=TW.Nodes[id].type;
            anode.color=TW.Nodes[id].color;
            if( TW.Nodes[id].shape ) anode.shape = TW.Nodes[id].shape;

            if(Number(anode.id)==287) console.log("coordinates of node 287: ( "+anode.x+" , "+anode.y+" ) ")

            if(!TW.Nodes[id].lock) {
                updateSearchLabels(id,TW.Nodes[id].label,TW.Nodes[id].type);
                nodeslength++;
            }
            TW.partialGraph.addNode(id,anode);
            return;
        }
    } else { // It's an edge!
        if(!isUndef(gete(id))) return;
        if(TW.Edges[id] && !TW.Edges[id].lock){
            // var present = TW.partialGraph.states.slice(-1)[0];            
            var anedge = {
                id:         id,
                sourceID:   TW.Edges[id].source,
                targetID:   TW.Edges[id].target,
                lock : false,
                label:      TW.Edges[id].label,
                type:      TW.Edges[id].type,
                categ:      TW.Edges[id].categ,
                weight: TW.Edges[id].weight
            };

            TW.partialGraph.addEdge(id , anedge.sourceID , anedge.targetID , anedge);
            return;
        }
    }
}

function pushFilterValue(filtername,arg){
    if(lastFilter[filtername]["orig"]=="-") {
        lastFilter[filtername]["orig"] = arg;
        lastFilter[filtername]["last"] = arg;
        return;
    } else {
        lastFilter[filtername]["last"] = arg;
        return;
    }
}

function saveGraph() {
    
    size = getByID("check_size").checked
    color = getByID("check_color").checked
    atts = {"size":size,"color":color}

    if(getByID("fullgraph").checked) {
        saveGEXF ( getnodes() , getedges() , atts);
    }

    if(getByID("visgraph").checked) {
        saveGEXF ( getVisibleNodes() , getVisibleEdges(), atts )
    }

    $("#closesavemodal").click();
}

function saveGEXF(nodes,edges,atts){
    gexf = '<?xml version="1.0" encoding="UTF-8"?>\n';
    gexf += '<gexf xmlns="http://www.gexf.net/1.1draft" xmlns:viz="http://www.gephi.org/gexf/viz" version="1.1">\n';
    gexf += '<graph defaultedgetype="undirected" type="static">\n';
    gexf += '<attributes class="node" type="static">\n';
    gexf += ' <attribute id="0" title="category" type="string">  </attribute>\n';
    gexf += ' <attribute id="1" title="country" type="float">    </attribute>\n';
    //gexf += ' <attribute id="2" title="content" type="string">    </attribute>\n';
    //gexf += ' <attribute id="3" title="keywords" type="string">   </attribute>\n';
    //gexf += ' <attribute id="4" title="weight" type="float">   </attribute>\n';
    gexf += '</attributes>\n';
    gexf += '<attributes class="edge" type="float">\n';
    gexf += ' <attribute id="6" title="type" type="string"> </attribute>\n';
    gexf += '</attributes>\n';
    gexf += "<nodes>\n";

    for(var n in nodes){    
        
        gexf += '<node id="'+nodes[n].id+'" label="'+nodes[n].label+'">\n';
        gexf += ' <viz:position x="'+nodes[n].x+'"    y="'+nodes[n].y+'"  z="0" />\n';
        if(atts["color"]) gexf += ' <viz:size value="'+nodes[n].size+'" />\n';
        if(atts["color"]) {
            col = hex2rga(nodes[n].color);
            gexf += ' <viz:color r="'+col[0]+'" g="'+col[1]+'" b="'+col[2]+'" a="1"/>\n';
        }    
        gexf += ' <attvalues>\n';
        gexf += ' <attvalue for="0" value="'+nodes[n].type+'"/>\n';
        gexf += ' <attvalue for="1" value="'+TW.Nodes[nodes[n].id].CC+'"/>\n';
        gexf += ' </attvalues>\n';
        gexf += '</node>\n';
    }
    gexf += "\n</nodes>\n";
    gexf += "<edges>\n";    
    cont = 1;
    for(var e in edges){
        gexf += '<edge id="'+cont+'" source="'+edges[e].source.id+'"  target="'+edges[e].target.id+'" weight="'+edges[e].weight+'">\n';
        gexf += '<attvalues> <attvalue for="6" value="'+edges[e].label+'"/></attvalues>';
        gexf += '</edge>\n';
        cont++;
    }
    gexf += "\n</edges>\n</graph>\n</gexf>";
    uriContent = "data:application/octet-stream," + encodeURIComponent(gexf);
    newWindow=window.open(uriContent, 'neuesDokument');
}

function saveGraphIMG(){
        
        var strDownloadMime = "image/octet-stream"
        
        var nodesDiv = TW.partialGraph._core.domElements.nodes;
        var nodesCtx = nodesDiv.getContext("2d");

        var edgesDiv = TW.partialGraph._core.domElements.edges;
        var edgesCtx = edgesDiv.getContext("2d");


        var hoverDiv = TW.partialGraph._core.domElements.hover;
        var hoverCtx = hoverDiv.getContext("2d");

        var labelsDiv = TW.partialGraph._core.domElements.labels;
        var labelsCtx = labelsDiv.getContext("2d");

        nodesCtx.drawImage(hoverDiv,0,0);
        nodesCtx.drawImage(labelsDiv,0,0);
        edgesCtx.drawImage(nodesDiv,0,0);

        var strData = edgesDiv.toDataURL("image/png");
        document.location.href = strData.replace("image/png", strDownloadMime)
}
