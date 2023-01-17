import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{ setHoveredNode: (node: string | null) => void }> = ({ setHoveredNode }) => {
  const sigma = useSigma();
  
  const registerEvents = useRegisterEvents();

  
  useEffect(() => {
    registerEvents({
      clickNode({node}){
        window.localStorage.setItem('pathway', node);
        window.dispatchEvent(new Event("storage"));
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
    });
  }, []);

  return <></>;
};

export default GraphEventsController;