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

  
  useEffect(() => {
    registerEvents({
      clickNode(e) {
        console.log(sigma.getNodeDisplayData(e.node), sigma.getCamera().getState());
        if (graph.getNodeAttribute(e.node, "color") != NODE_FADE_COLOR) {
          handleClickNode(e);
        }
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      clickStage(e) {
        handleClickAway();
      },
      enterNode({node}) {
        
        if (graph.getNodeAttribute(node, "color") != NODE_FADE_COLOR){
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
