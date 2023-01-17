import { useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";

import { drawHover } from "../canvas-utils";
import useDebounce from "../use-debounce";
import { EDGE_FADE_COLOR, NODE_FADE_COLOR } from "./consts";

const GraphSettingsController: FC<{ hoveredNode: string | null }> = ({hoveredNode }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const debouncedHoveredNode = useDebounce(hoveredNode, 40);

  useEffect(() => {
    sigma.setSetting("hoverRenderer", (context, data, settings) =>
      drawHover(context, { ...sigma.getNodeDisplayData(data.key), ...data }, settings),
    );

    graph.forEachNode((node, attr) => {
      var sim: any[] = [];
      const adj = graph.undirectedNeighbors(node);
      const degree = adj.length;
      adj.forEach((other) => {
        const o_adj = graph.undirectedNeighbors(other);
        const intersect = adj.filter((ele) => o_adj.includes(ele)).length;
        const union = adj.length + o_adj.length - intersect;
        sim.push([other, intersect/union]);
      })

      sim = sim.sort((a, b)=>b[1]-a[1]);
      for(let i=0; i<Math.min(sim.length-5, sim.length); i++){
        graph.setEdgeAttribute(graph.edge(node, sim[i][0]), 'color', EDGE_FADE_COLOR);
      }
    })
    console.log('completed');
  }, [sigma, graph]);

  useEffect(() => {
    const hoveredColor: string = debouncedHoveredNode ? sigma.getNodeDisplayData(debouncedHoveredNode)!.color : "";
    
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
              ? { ...data, color: hoveredColor, size: 0.6 }
              : { ...data, color: EDGE_FADE_COLOR, hidden: true }
        : null,
    );
  }, [debouncedHoveredNode]);

  return <></>;
};

export default GraphSettingsController;