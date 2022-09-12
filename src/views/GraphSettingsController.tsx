import { useSetSettings, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";

import { drawHover } from "../canvas-utils";
import useDebounce from "../use-debounce";
import { Camera } from "sigma";

const NODE_FADE_COLOR = "rgba(150,150,150,0.6)";
const EDGE_FADE_COLOR = "#eee";

const GraphSettingsController: FC<{ hoveredNode: string | null }> = ({ children, hoveredNode }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const debouncedHoveredNode = useDebounce(hoveredNode, 40);

  useEffect(() => {
    sigma.setSetting("hoverRenderer", (context, data, settings) =>
      drawHover(context, { ...sigma.getNodeDisplayData(data.key), ...data }, settings),
    );
  }, [sigma, graph]);


  useEffect(() => {
    
    sigma.setSetting(
      "nodeReducer",
      debouncedHoveredNode
        ? (node, data) =>
            node === debouncedHoveredNode ||
            graph.hasEdge(node, debouncedHoveredNode) ||
            graph.hasEdge(debouncedHoveredNode, node)
              ? { ...data, zIndex: 1 }
              : { ...data, zIndex: 0, label: "", color: NODE_FADE_COLOR, image: null, highlighted: false }
        : null,
    );
    sigma.setSetting(
      "edgeReducer",
      debouncedHoveredNode
        ? (edge, data) =>
            graph.hasExtremity(edge, debouncedHoveredNode)
              ? { ...data, color: graph.getEdgeAttribute(edge, "color"), size: 2 }
              : { ...data, color: EDGE_FADE_COLOR, hidden: true }
        : null,
    );
  }, [debouncedHoveredNode]);

  return null;
};

export default GraphSettingsController;
