import { useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { EDGE_COLOR_C, EDGE_COLOR_H, NODE_COLOR } from "./consts";


const GraphDataController: FC<{ dataset: any}> = ({ dataset }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();

    
    useEffect(() => {
        if (!graph || !dataset) return;
        dataset['nodes'].forEach((node: any) =>
        graph.addNode(node['key'], {
            ...node,
            name: node['attributes']['name'],
            label: node['key'],
            color: NODE_COLOR,
            size: 4,
        }),
        );
        dataset['edges'].forEach((edge: any) =>
         graph.addEdge(
            edge['source'], 
            edge['target'], 
            { size: 0.3, color : edge['attributes']['type'] == 'h'?EDGE_COLOR_H:EDGE_COLOR_C}
        ));

        return () => graph.clear();
    }, [graph, dataset]);
    
    return <></>
}

export default GraphDataController;