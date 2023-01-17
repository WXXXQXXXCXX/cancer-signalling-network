import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { NodeAttributes } from "../types";
import { EDGE_FADE_COLOR, EDGE_HIDE_COLOR, NEG_COLOR, NODE_COLOR, NODE_FADE_COLOR, NODE_HIDE_COLOR, PHY_COLOR, POS_COLOR } from "./consts";
import { min_cog_load } from "../cog_load";
import { Coordinates } from "sigma/types";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{ 
  setHoveredNode: (node: string | null) => void,
  setNodeAttributes: (attr: NodeAttributes | null) => void,
  handleClickNode: (e:any) => void,
  dataReady: boolean
  handleClickAway: ()=>void
}> = ({ setHoveredNode, setNodeAttributes, handleClickNode, dataReady, handleClickAway}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();
  const [node_distribution, set_node_distribution] = useState<any[][]>();
  
  // const node_distribution = useMemo(() => {
  //   var data: any[][] = new Array(10);
  //   for(let i=0; i<10; i++){
  //     data[i] = new Array(10);
  //   }
  //   graph.forEachNode((node, attr) => {
  //     const x = Number(sigma.getNodeDisplayData(node)?.x);
  //     const y = Number(sigma.getNodeDisplayData(node)?.y);
  //     var cur = data[Math.floor(x/0.1)][Math.floor(y/0.1)]
  //     if (cur == undefined) data[Math.floor(x/0.1)][Math.floor(y/0.1)] = []
  //     data[Math.floor(x/0.1)][Math.floor(y/0.1)].push(node);
  //   })
  //   console.log('distribution',data);
  //   return data;

  // },[graph, dataReady])
  // const in_viewport = (pos: Coordinates, br: Coordinates, tl:Coordinates) => {
  //   const x = pos.x;
  //   const y = pos.y;
  //   if(x<br.x && x>tl.x && y>br.y && y<tl.y) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  const updateVis = _.debounce((e) => {
    var data = node_distribution;
    if (data == undefined){
      var new_data = new Array(10);
      for(let i=0; i<10; i++){
        new_data[i] = new Array(10);
      }
      
      // console.log(new_data.length, new_data[0].length)
      graph.forEachNode((node, attr) => {
        const x = Number(sigma.getNodeDisplayData(node)?.x);
        const y = Number(sigma.getNodeDisplayData(node)?.y);
        const x_pos = Math.min(Math.floor(x/0.1),9);
        const y_pos = Math.min(Math.floor(y/0.1),9)
        // console.log(x_pos, y_pos)
        if (new_data[x_pos][y_pos] == undefined) new_data[x_pos][y_pos] = []
        new_data[x_pos][y_pos].push(node);
        
      })
      // console.log('distribution',data);
      set_node_distribution(new_data);
      data = new_data;
    }

    const view_rect = sigma.viewRectangle();
    const tl = {x:view_rect.x1, y:view_rect.y1}
    const br = {x:view_rect.x2, y:view_rect.y1-view_rect.height}
    console.log('camera update',tl, br);

    // var adj: {[key: string]: string[]} = {};
    const ratio = sigma.getCamera().getState().ratio
    const node_per_square = Math.max(1,Math.ceil(5/(ratio**1.5)));
    // console.log('node_per_square',node_per_square,sigma.getCamera().getState().ratio)
    const visible: string[] = []
    for(let i=0; i<10; i++){
      for(let j=0; j<10; j++){
        var nodes: any[] = data[i][j];
        

        if(nodes){
          // console.log(nodes.length);
          nodes = nodes.filter(x => graph.getNodeAttribute(x, 'color') != NODE_FADE_COLOR);
          nodes = nodes.sort((a, b) => graph.degree(b) - graph.degree(a));
          
          for(let k=0; k<Math.min(nodes.length, node_per_square); k++){
            const node = nodes[k];
           
            graph.updateNodeAttributes(node, (attr) => {
              //console.log('update node ',node, attr.ori_color, NODE_COLOR, NODE_FADE_COLOR);
              return {
                ...attr,
                color: attr.ori_color,

              }
            })
            visible.push(node);
            
          }
          for(let k=node_per_square; k<nodes.length; k++){
            const node = nodes[k];
            // console.log('update node to fade ',node)
            graph.updateNodeAttributes(node, (attr)=>{
              return {
                ...attr,
                color: NODE_HIDE_COLOR,
                ori_color: attr.color == NODE_HIDE_COLOR? attr.ori_color: attr.color,
              }
            });
            
            graph.forEachEdge(node, (edge, attr, src, src_attr, target, target_attr, undirected) => {
              graph.updateEdgeAttributes(edge, (attr) => {
                //console.log('update edge, to fade', edge, attr.ori_color);
                return {
                  ...attr,
                  color: EDGE_HIDE_COLOR,
                  ori_color: attr.color != EDGE_HIDE_COLOR ? attr.color: attr.ori_color,
                }
              })
            })

          }
        }
      }
    }

    const num_edges = 2*visible.length
    visible.forEach((node) => {
      var sim: any[] = [];
      var adj = graph.neighbors(node);
      adj = adj.filter((ele) => visible.includes(ele))
      adj.forEach((other) => {
   
        const o_adj = graph.neighbors(other);
        const intersect = adj.filter((ele) => o_adj.includes(ele) && visible.includes(ele)).length;
        const union = adj.length + o_adj.length - intersect;
        sim.push([other, intersect/union]);
      })

      sim = sim.sort((a, b)=>b[1]-a[1]);
      for(let i=0; i<sim.length-3; i++){
        const edge = graph.edges(node, sim[i][0])
        // console.log(node, sim[i][0], 'hide')
        if(edge.length>0){
          graph.updateEdgeAttributes(edge[0], (attr) => {
            return {
              ...attr,
              color: EDGE_HIDE_COLOR,
              ori_color: attr.color == EDGE_HIDE_COLOR? attr.ori_color: attr.color
            };
          })
        }
      }
      for(let i=Math.max(0, sim.length-3); i<sim.length; i++){
        const edge = graph.edges(node, sim[i][0])
        // console.log(node, sim[i][0], 'show')
        if(edge.length>0){
          graph.updateEdgeAttributes(edge[0], (attr) => {
            return {
              ...attr,
              color: attr.ori_color,
            };
          })
        }
        
       }
    })
    // graph.forEachEdge((edge, attr, src, target, src_attr, target_attr, undirected) => {
    //   if(attr.hidden  || visible.indexOf(target)<0 || visible.indexOf(src)<0 || num_edges == 0) return;
    //   graph.updateEdgeAttributes(edge, (attr) => {
    //     return {
    //       ...attr,
    //       color: attr.ori_color,
    //     };
    //   })
    // })
    // graph.forEachEdge((edge, attr, source, target, source_attr, target_attr) => {
    //   const src_cord = sigma.getNodeDisplayData(source);
    //   const dst_cord = sigma.getNodeDisplayData(target);
    //   if(src_cord == undefined || dst_cord == undefined){
    //     return attr;
    //   }
    //   if(in_viewport(src_cord, br, tl) && in_viewport(dst_cord, br, tl) && adj[source]!=undefined){
    //     adj[source].push(edge);
    //     graph.setEdgeAttribute(edge, 'inViewport', true)
    //   } else{
    //     graph.setEdgeAttribute(edge, 'inViewport', false);
    //   }
    // });

    console.log('after edge update');
    // if(Object.keys(adj).reduce((sum,key)=>sum+adj[key].length,0)>100){
    //   console.log('reduce edge');
    //   const [remove_edge, remove_node] = min_cog_load(adj);
    //   console.log(remove_node, remove_edge);
    //   graph.updateEachNodeAttributes((node, attr) => {
    //     const keep = remove_node.indexOf(node)== -1
    //     if(!keep && attr.color != NODE_FADE_COLOR){
    //       attr.color = NODE_HIDE_COLOR;
    //     } else if(keep && attr.color != NODE_FADE_COLOR){
    //       attr.color = NODE_COLOR;
    //     }
    //     return attr;
    //   })
    //   graph.updateEachEdgeAttributes(
    //     (edge, attr, source, target, source_attr, target_attr) => {
    //       const need_remove = remove_edge.indexOf(edge) != -1;
    //       const src_remove = remove_node.indexOf(source)!=-1;
    //       const dst_remove = remove_node.indexOf(target) != -1;
    //       if((need_remove||src_remove || dst_remove )&& !attr.hidden){
    //         attr.color = EDGE_FADE_COLOR;
    //         attr.inViewport = false;
    //       } else if(!need_remove && !attr.hidden && !src_remove && !dst_remove){
    //         switch(attr.category){
    //           case 'POS':
    //             attr.color = POS_COLOR;
    //             break;
    //           case 'NEG':
    //             attr.color = NEG_COLOR;
    //             break;
    //           case 'PHY':
    //             attr.color = PHY_COLOR;

    //         }
    //       }
    //       return attr;
    //   })
    // }
    
  },1000);

  useEffect(() => {
    registerEvents({
      clickNode(e) {
        console.log(sigma.getNodeDisplayData(e.node), sigma.getCamera().getState());
        if (graph.getNodeAttribute(e.node, "color") == NODE_COLOR) {
          handleClickNode(e);
        }
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      clickStage(e) {
        handleClickAway();
      },
      enterNode({node}) {
        
        if (graph.getNodeAttribute(node, "color") == NODE_COLOR){
          setHoveredNode(node);
        
          const mouseLayer = getMouseLayer();
          if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
        }
      },
      leaveNode() {
       
        setHoveredNode(null);
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
      },
      wheel(e) {
        //updateVis(e);
        if((sigma.getCamera().ratio<0.1 && e.delta>0) || (sigma.getCamera().ratio>2 && e.delta<0)){
          e.preventSigmaDefault();
          
        }
      },
      // cameraUpdated(e) {
      //   //updateVis(e);
      // },
    });
  }, []);

  return null;

};

export default GraphEventsController;
