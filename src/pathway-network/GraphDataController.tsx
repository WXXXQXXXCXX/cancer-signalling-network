import { useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { EDGE_COLOR_C, EDGE_COLOR_H, EDGE_FADE_COLOR, NODE_COLOR } from "./consts";
import { GetPathwayNetwork } from "../db/db_conn";


const GraphDataController: FC<{}> = () => {
    const sigma = useSigma();
    const graph = sigma.getGraph();

    
    useEffect(() => {

        const t1 = performance.now()
        
        GetPathwayNetwork((records) => {
            records.forEach((record) => {
                const node1 = record.get(0);
                const node2 = record.get(1);
                const edge_type = record.get(2);
                //console.log(node1.properties.id, edge_type);
                graph.updateNode(node1.properties.id, (attr)=>{
                    return {
                        name: node1.properties.name,
                        label: node1.properties.id,
                        color: NODE_COLOR,
                        size: 4,
                        x: Number(node1.properties.x),
                        y: Number(node1.properties.y)
                    }
                });

                graph.updateNode(node2.properties.id, (attr)=>{
                    return {
                        name: node2.properties.name,
                        label: node2.properties.id,
                        color: NODE_COLOR,
                        size: 4,
                        x: Number(node2.properties.x),
                        y: Number(node2.properties.y)
                    }
                })

                graph.mergeEdge(node1.properties.id, node2.properties.id, 
                    { 
                        size: 0.3, 
                        color : edge_type == 'h'?EDGE_COLOR_H:EDGE_COLOR_C
                    }
                )
            })
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
            const t2 = performance.now()
            console.log('pathway graph took %s to set up (adding nodes and edges)', t2-t1) 
        });
        
        return () => graph.clear();
    }, []);
    
    return <></>
}

export default GraphDataController;