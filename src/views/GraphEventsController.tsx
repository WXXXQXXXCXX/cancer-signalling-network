import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { GetNodeAttributeByEntrezName } from "../db/db_conn";
import { NodeAttributes } from "../types";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{ 
  setHoveredNode: (node: string | null) => void,
  setNodeAttributes: (attr: NodeAttributes | null) => void
}> = ({ setHoveredNode, setNodeAttributes}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      clickNode({ node }) {
        if (!graph.getNodeAttribute(node, "hidden")) {
          //const panel = document.getElementsByClassName("Attributes")[0];
          //window.open(graph.getNodeAttribute(node, "URL"), "_blank");
          GetNodeAttributeByEntrezName(node).then((data: NodeAttributes)=>{setNodeAttributes(data)});
        }
      },
      enterNode({ node }) {
        setHoveredNode(node);
        
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      leaveNode() {
        setHoveredNode(null);
        
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
      },
      wheel(e) {
        if((sigma.getCamera().ratio<0.1 && e.delta>0) || (sigma.getCamera().ratio>2 && e.delta<0)){
          e.preventSigmaDefault();
        }
      }
    });
  }, []);

  return null;

};

export default GraphEventsController;
