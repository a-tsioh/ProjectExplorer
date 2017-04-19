'use strict';


// settings: {norender: Bool}
function cancelSelection (fromTagCloud, settings) {
    console.log("\t***in cancelSelection");
    if (!settings) settings = {}

    highlightSelectedNodes(false); //Unselect the selected ones :D
    opossites = [];
    selections = [];
    //selections.length = 0;
    selections.splice(0, selections.length);

    TW.partialGraph.states.slice(-1)[0].selections=[]

    //Nodes colors go back to normal
    overNodes=false;

    //Edges colors go back to normal
    if (TW.partialGraph.settings('drawEdges')) {
      for(let i=0;i<TW.nEdges;i++){
        let e = TW.partialGraph.graph.edges(TW.edgeIds[i])
        // console.log("cancelSelection: edge", e)
        if (e) {
          e.color = e.customAttrs['true_color'];
          e.customAttrs.grey = 0;
          e.customAttrs.activeEdge = 0;
        }
      }
    }

    //Nodes colors go back to previous
    for(let j=0;j<TW.nNodes;j++){
      let n = TW.partialGraph.graph.nodes(TW.nodeIds[j])
      // console.log("cancelSelection: node", n)
      if (n) {
        n.active = false;
        n.color = TW.handpickedcolor ? n.customAttrs['alt_color'] : n.customAttrs['true_color'];
        n.customAttrs.grey = 0
        n.customAttrs.forceLabel = 0
      }
    }

    // hide all selection panels
    if(fromTagCloud==false){
        $("#names").html("");
        $("#topPapers").html(""); $("#topPapers").hide();
        $("#opossiteNodes").html(""); $("#tab-container").hide();
        $("#information").html("");
        $("#searchinput").val("");
        $("#unselectbutton").hide();
        $("#lefttopbox").hide();
        $("#tips").html(getTips());
    }

    // send "eraseNodeSet" event
    $('#searchinput').trigger("tw:eraseNodeSet");
    // (signal for plugins that any selection behavior is finished)

    for(var nid in deselections){
      let n = TW.partialGraph.graph.nodes(nid)
        if( !isUndef(n) ) {
            n.customAttrs.forceLabel = false;
            n.customAttrs.highlight = false;
            n.customAttrs.grey=false
            // like old graphResetColor but now rather graphResetFlags...
            n.active=false;
        }
    }

    deselections={};

    if(TW.partialGraph.states.slice(-1)[0].level)
        LevelButtonDisable(true);

    // global flag
    TW.selectionActive = false

    if (!settings.norender) {
      // finally redraw
      TW.partialGraph.render();
    }
}

function highlightSelectedNodes(flag){
    console.log("\t***methods.js:highlightSelectedNodes(flag)"+flag+" selEmpty:"+is_empty(selections))
    if(!is_empty(selections)){
        for(var i in selections) {
          TW.partialGraph.graph.nodes(i).active = flag
        }
    }
}

function alertCheckBox(eventCheck){
    // NB: we use 2 booleans to adapt to SHIFT checking
    //      - var checkBox  ---------> has the real box state
    //      - var manuallyChecked  --> remembers if it was changed here
    if(!isUndef(eventCheck.checked)) {
        checkBox=eventCheck.checked;
        manuallyChecked = eventCheck.checked
    }
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

    console.log("\t\t\tin RefreshState newNOW:_"+newNOW+"_.")

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
        console.log("in social N: "+N+" - k: "+k+" - s: "+s)
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
        console.log("in semantic N: "+N+" - k: "+k+" - s: "+s)
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
            setTimeout(function(){
              EdgeWeightFilter("#sliderBEdgeWeight", "label" , "nodes2", "weight");
              NodeWeightFilter ( "#sliderBNodeWeight"  , "NGram", "type" , "size");
            },30)
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

    TW.partialGraph.render();

}

function pushSWClick(arg){
    swclickPrev = swclickActual;
    swclickActual = arg;
}

//	tag cloud div
function htmlfied_alternodes(elems) {
    var oppositesNodes=[]
    var js1='onclick="graphTagCloudElem(\'';
    var js2="');\""
    var frecMAX=elems[0].value
    for(var i in elems){
        var id=elems[i].key
        var frec=elems[i].value
        var fontSize
        var htmlfied_alternode
        if(frecMAX==1) fontSize=desirableTagCloudFont_MIN;
        else {
            fontSize=
            desirableTagCloudFont_MIN+
            (frec-1)*
            ((desirableTagCloudFont_MAX-desirableTagCloudFont_MIN)/(frecMAX-1));
        }
        if(!isUndef(TW.Nodes[id])){

            htmlfied_alternode = '<span class="tagcloud-item" style="font-size:'+fontSize+'px;" '+js1+id+js2+'>'+ TW.Nodes[id].label+ '</span>';
            oppositesNodes.push(htmlfied_alternode)
        }
    }
    return oppositesNodes
}

function manualForceLabel(nodeid, active, justHover) {
	// console.log("manual|"+nodeid+"|"+active)
  var nd = TW.partialGraph.graph.nodes(nodeid)

  // TODO harmonize with other status => bien re-distinguer neighbor et active
  // nd.active=active;

  // console.log('justHover', justHover)
  // var t0, t1

  if (justHover) {
    // using single node redraw in hover layer (much faster ~ 0.5ms)
    redrawNodesInHoverLayer([nd])
  }
  else {
    // using full redraw in permanent layers (slow ~ 70ms)
    TW.partialGraph.render();
  }
}

// Here we draw within hover layer instead of nodes layer, labels layer
//
// Explanation: it's perfect for temporary change cases because hover layer
//              is *over* all other layers and contains nothing by default
//              (this way step A can reset B avoiding whole graph refresh)
function redrawNodesInHoverLayer(someNodes) {
  var targetLayer = TW.rend.contexts.hover

  // A - clear entire targetLayer
  targetLayer.clearRect(
    0, 0,
    targetLayer.canvas.width,
    targetLayer.canvas.height
  )

  var locSettings = TW.partialGraph.settings.embedObjects({prefix:'renderer1:'})

  for (var k in someNodes) {
    // B - we use our largerall renderer to write single nodes to overlay
    sigma.canvas.hovers.def( someNodes[k], targetLayer, locSettings)
  }
}


function clearHover() {
  var hoverLayer = TW.rend.contexts.hover
  hoverLayer.clearRect(
    0, 0,
    hoverLayer.canvas.width,
    hoverLayer.canvas.height
  )
}

// TODO rm ? function doesn't make sense, probably replaced by htmlfied_tagcloud
// function htmlfied_samenodes(elems) {
//     var sameNodes=[]
//     js1=' onmouseover="manualForceLabel(this.id,true, true);" ';
//     js2=' onmouseout="manualForceLabel(this.id,true, true);" ';
//     if(elems.length>0) {
//         var A = getVisibleNodes()
//         for (var a in A){
//             n = A[a]
//             if(!n.active && n.color.charAt(0)=="#" ) {
//                 sameNodes.push('<li onmouseover="manualForceLabel(\''+n.id+'\',true, true)"  onmouseout="manualForceLabel(\''+n.id+'\',false, true)" ><a>'+ n.label+ '</a></li>')
//             }
//         }
//     }
//     return sameNodes
// }

// nodes information div
function htmlfied_nodesatts(elems){

    var socnodes=[]
    var semnodes=[]
    for(var i in elems) {

        var information=[]

        var id=elems[i]
        var node = TW.Nodes[id]

        if (TW.mainfile) {
            var addname = (node.attributes["name"])?node.attributes["name"]:"";
            var google='<a target="_blank" href="http://www.google.com/search?q='+addname+"+"+node.label.replace(" ","+")+'">';
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
    // (MultipleSelection2 will do the re-rendering)
}

function htmlfied_tagcloud(elems , limit) {
    if(elems.length==0) return false;
    var oppositesNodes=[]
    var fontSize=desirableTagCloudFont_MIN
    let frecMAX=elems[0].value
    for(var i in elems){
        if(i==limit)
            break
        let id=elems[i].key
        let frec=elems[i].value
        if(frecMAX > 1) {
            fontSize=
            desirableTagCloudFont_MIN+
            (frec-1)*
            ((desirableTagCloudFont_MAX-desirableTagCloudFont_MIN)/(frecMAX-1));
        }

        // debug
        // console.log('htmlfied_tagcloud (',id, TW.Nodes[id].label,') freq',frec,' fontSize', fontSize)

        if(!isUndef(TW.Nodes[id])){
            var jspart = ' onclick="manualSelectNode(\''+id+'\')" onmouseover="manualForceLabel(\''+id+'\',true, true)"  onmouseout="manualForceLabel(\''+id+'\',false, true)"'
            let htmlfied_alternode = '<span class="tagcloud-item" style="font-size:'+fontSize+'px;" '+jspart+'>'+ TW.Nodes[id].label+ '</span>';
            oppositesNodes.push(htmlfied_alternode)
        }
    }
    return oppositesNodes
}

//missing: getTopPapers for both node types
//considering complete graphs case! <= maybe i should mv it
function updateRelatedNodesPanel( sels , same, oppos ) {

    // debug
    // neiLabls = []
    // for (var l in same) {
    //   var neiId = same[l].key
    //   if (TW.Nodes[neiId]) {
    //
    //     neiLabls.push(TW.Nodes[neiId].label)
    //   }
    //   else {
    //     console.warn("missing entry for neiId", neiId)
    //   }
    // }
    // console.log("updateRelatedNodesPanel, same:",neiLabls)


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

    var sameNodesDIV = "";
    if(getNodeIDs(sels).length>0) {
        sameNodesDIV+='<div id="sameNodes">';//tagcloud
        var tagcloud_opposite_neigh = htmlfied_tagcloud( same , TW.tagcloud_limit)
        sameNodesDIV+= (tagcloud_opposite_neigh!=false) ? tagcloud_opposite_neigh.join("\n")  : "No related terms.";
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
    $("#lefttopbox").show();
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
	console.log("\t\t\t\t---------"+getClientTime()+"---------")
	console.log("\t\t\t\tswMacro: "+swMacro)
	console.log("\t\t\t\tswActual: "+swclickActual+" |  swPrev: "+swclickPrev)
	console.log("\t\t\t\tNOW: "+NOW+" |  PAST: "+PAST)
	console.log("\t\t\t\tselections: ")
	console.log(Object.keys(selections))
	console.log("\t\t\t\topposites: ")
	console.log(Object.keys(opossites))
	console.log("\t\t\t\t------------------------------------")
}

//	just css
//true: button disabled
//false: button enabled
function LevelButtonDisable( TF ){
	$('#changelevel').prop('disabled', TF);
}

//Fixed! apres: refactor!
function graphTagCloudElem(nodes) {
    console.log("in graphTagCloudElem, nodae_id: "+nodes);
    cancelSelection();
    TW.partialGraph.graph.clear();


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


    for(var nid in nodes_2_colour)
        add1Elem(nid)
    for(var eid in edges_2_colour)
        add1Elem(eid)



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


function unHide(nodeId) {
  TW.partialGraph.graph.nodes(nodeId).hidden=false
}


// edges greyish color for unselected, when we have a selection
// NB: we just change the flags, not the colors
//     - renderer will see the flags and handle the case accordingly
function greyEverything(){

  for(var j=0 ; j<TW.nNodes ; j++){
    let n = TW.partialGraph.graph.nodes(TW.nodeIds[j])

    if (n && !n.hidden) {
      // normal case handled by node renderers
      // will see the n.customAttrs.grey flag => use n.customAttrs.defgrey_color
      n.customAttrs.grey=1

      n.active = false
      n.customAttrs.forceLabel = false;
      n.customAttrs.highlight = false;

      // special case after a coloredBy or clustersBy
      // if (TW.handpickedcolor) {
      //   n.color = "rgba("+hex2rga(n.color)+",0.5)"
      // }
    }
  }

  if (TW.partialGraph.settings('drawEdges')) {
    for(var i=0;i<TW.nEdges;i++){
      let e = TW.partialGraph.graph.edges(TW.edgeIds[i])
      if (e && !e.hidden && !e.customAttrs.grey) {
        e.customAttrs.grey = 1
        e.customAttrs.activeEdge = 0

        // new specification: coloredBy does not affect edges
        // (ie no special case for notDefaultColors)
      }
    }
  }

}

//
// function hideEverything(){
//     console.log("\thiding all");
//     nodeslength=0;
//
//     var nodes = TW.partialGraph.nodes()
//     for(var j in nodes){
//         nodes[j].hidden=true;
//     }
//     if (TW.partialGraph.settings('drawEdges')) {
//       var edges = TW.partialGraph.graph.edges()
//       for(var i in edges){
//           edges[i].hidden=true;
//       }
//     }
//     overNodes=false;//magic line!
//     console.log("\tall hidded");
//     //Remember that this function is the analogy of EmptyGraph
//     //"Saving node positions" should be applied in this function, too.
// }



// Converts from read nodes (sigma.parseCustom )
// Remarks:
//  - modifies nodesDict in-place
//  - run it once at init
//  - it will be used by FillGraph and add1Elem
function prepareNodesRenderingProperties(nodesDict) {
  for (var nid in nodesDict) {
    var n = nodesDict[nid]

    // 3 decimals is way more tractable
    // and quite enough in precision !!
    n.size = Math.round(n.size*1000)/1000

    // new initial setup of properties
    n.active = false
    n.customAttrs = {
      grey: false,
      highlight: false,
      true_color : n.color,
      defgrey_color : "rgba("+hex2rga(n.color)+",.4)"
    }

    // POSS n.type: distinguish rendtype and twtype

    // POSS flags like this
    // // sigma's flags: active and hidden
    // active: false,
    // hidden: false,
    // customFlags : {
    //   // our status flags
    //   grey: false,
    //   neighbor: false,
    //   // forceLabel: false,
    // }
  }
}

function prepareEdgesRenderingProperties(edgesDict) {
  for (var eid in edgesDict) {
    var e = edgesDict[eid]

    e.weight = Math.round(e.weight*1000)/1000
    // e.size = e.weight // REFA s/weight/size/ ?

    var rgbStr = sigmaTools.edgeRGB(e.source, e.target)

    e.color = "rgba("+rgbStr+","+TW.edgeDefaultOpacity+")"
    e.customAttrs = {
      grey: false,
      activeEdge : false,
      true_color : e.color,
      rgb : rgbStr
    }
  }
}


// use case: slider, changeLevel re-add nodes
function add1Elem(id) {
    id = ""+id;
    if(id.split(";").length==1) { // i've received a NODE
        id = parseInt(id)
        if(!isUndef(TW.partialGraph.graph.nodes(id))) return;

        if(TW.Nodes[id]) {
            var n = TW.Nodes[id]

            // WE AVOIDED A COPY HERE BECAUSE properties are already complete
            // ... however, TODO check if we shouldn't remove the n.attributes Obj

            // var anode = {}
            // anode.id = n.id;
            // anode.label = n.label;
            // anode.size = n.size;
            // anode.x = n.x;
            // anode.y = n.y;
            // anode.hidden= n.lock ;
            // anode.type = n.type;
            // anode.color = n.color;
            // if( n.shape ) n.shape = n.shape;
            // anode.customAttrs = n.customAttrs

            // if(Number(anode.id)==287) console.log("coordinates of node 287: ( "+anode.x+" , "+anode.y+" ) ")

            if(!n.lock) {
                updateSearchLabels(id,n.label,n.type);
                nodeslength++;
            }
            // TW.partialGraph.graph.addNode(anode);
            TW.partialGraph.graph.addNode(n);
            return;
        }
    } else { // It's an edge!
        if(!isUndef(TW.partialGraph.graph.edges(id))) return;
        var e  = TW.Edges[id]
        if(e && !e.lock){
            // var anedge = {
            //     id:         id,
            //     source: e.source,
            //     target: e.target,
            //     lock : false,
            //     hidden: false,
            //     label:  e.label,
            //     type:   e.type,
            //     // categ:  e.categ,
            //     weight: e.weight,
            //     customAttrs : e.customAttrs
            // };

            // TW.partialGraph.graph.addEdge(anedge);
            TW.partialGraph.graph.addEdge(e);
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

    let size = getByID("check_size").checked
    let color = getByID("check_color").checked
    let atts = {"size":size,"color":color}

    if(getByID("fullgraph").checked) {
        saveGEXF ( getnodes() , getedges() , atts);
    }

    if(getByID("visgraph").checked) {
        saveGEXF ( getVisibleNodes() , getVisibleEdges(), atts )
    }

    $("#closesavemodal").click();
}

function saveGEXF(nodes,edges,atts){
    let gexf = '<?xml version="1.0" encoding="UTF-8"?>\n';
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
    let cont = 1;
    for(var e in edges){
        gexf += '<edge id="'+cont+'" source="'+edges[e].source.id+'"  target="'+edges[e].target.id+'" weight="'+edges[e].weight+'">\n';
        gexf += '<attvalues> <attvalue for="6" value="'+edges[e].label+'"/></attvalues>';
        gexf += '</edge>\n';
        cont++;
    }
    gexf += "\n</edges>\n</graph>\n</gexf>";
    let uriContent = "data:application/octet-stream," + encodeURIComponent(gexf);
    let newWindow=window.open(uriContent, 'neuesDokument');
}

function saveGraphIMG(){
    TW.rend.snapshot({
      format:'png',
      filename:'tinawebjs-graph.png',
      background:'white',
      download:'true'
    });
}



// reInitFa2 : to call after changeType/changeLevel
// ------------------------------------------------
// sigma 1.2 FA2 supervisor is lazily inited at the
// first call (startForceAtlas2 or configForceAtlas2)
// but it keeps its own node index (as byteArray) and
// so needs to be recreated when nodes change
function reInitFa2 (params) {
  if (!params)  params = {}

  if (params.useSoftMethod) {
    // soft method: we just update FA2 internal index
    // (is good enough if new nodes are subset of previous nodes)
    TW.partialGraph.supervisor.graphToByteArrays()

    // now cb
    if (params.callback) {
      params.callback()
    }
  }
  else {
    TW.partialGraph.killForceAtlas2()

    // after 1s to let killForceAtlas2 finish
    setTimeout ( function() {
      // init FA2
      TW.partialGraph.configForceAtlas2(TW.FA2Params)

      // now cb
      if (params.callback) {
        params.callback()
      }
    }, 1000)
  }
}
