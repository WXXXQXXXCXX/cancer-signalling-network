import { useSetSettings, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { Dataset  } from "../types";


const GraphDataController: FC<{ dataset: Dataset}> = ({ dataset }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  

  useEffect(() => {
    if (!graph || !dataset) return;

    dataset.nodes.forEach((node) =>
        graph.addNode(node.id, {
          ...node,
          label: node.id,
          size: node.size * 0.8
        }
      ),
    );
    dataset.edges.forEach((edge) => graph.addEdge(edge.source, edge.target, { size: 0.5, color: edge.color}));

    return () => graph.clear();
  }, [graph, dataset]);

  return null;
};

export default GraphDataController;
