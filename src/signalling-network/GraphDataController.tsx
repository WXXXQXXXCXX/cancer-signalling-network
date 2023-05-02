import { useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { Dataset, EdgeData, GraphOps, NodeData  } from "../types";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { GetSignallingNetwork, GetSubGraphWithLabel } from "../db/db_conn";
import { NEG_COLOR, NODE_COLOR, PATHWAY_V_EDGE_COLOR, PATHWAY_NODE_COLOR, PHY_COLOR, POS_COLOR, PATHWAY_H_EDGE_COLOR, PATHWAY_NODE_SIZE } from "./consts";

const GraphDataController: FC<{ 
  dataset: string | null, 
  graphOps: GraphOps,
  setDataReady: (ready: boolean)=>void
}> = ({ dataset, graphOps, setDataReady}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const addEdge=(edge?: EdgeData)=>{
    if(!edge) return;
    if(edge.type=="PHY"){
      graph.addUndirectedEdge(edge.source, edge.target, {color: PHY_COLOR,ori_color: PHY_COLOR, weight: 0.5, category: 'PHY', hidden: true});
    } else if(edge.type=="POS"){
      graph.addDirectedEdge(edge.source, edge.target, {color: POS_COLOR, ori_color: POS_COLOR, weight: 0.5, category: 'POS', hidden: true});
    } else if(edge.type=="NEG" ){
      graph.addDirectedEdge(edge.source, edge.target, {color: NEG_COLOR,ori_color: NEG_COLOR, weight: 0.5, category: 'NEG', hidden: true});
    }
  }
  const getSubgraphCallback=(src: NodeData, dest: NodeData, e?:EdgeData)=>{
    if(!graph.hasNode(src.label)){
      graph.addNode(src.label, {
        color: NODE_COLOR,
        ori_color: NODE_COLOR, 
        size: 3,
        label: src.label,
        id: src.label,
        x: Math.random()*500,
        y: Math.random()*500,
        
      });
    }
    
    if(!graph.hasNode(dest.label)){
      graph.addNode(dest.label, {
        color: NODE_COLOR,
        ori_color: NODE_COLOR,
        size: 3,
        label: dest.label,
        id: dest.label,
        x: Math.random()*500,
        y: Math.random()*500,
        
      });
    }
    addEdge(e);
  };

  const loadCompleteGeneGraph = () => {
    graph.clear();
    // fetch(`${process.env.PUBLIC_URL}/wg1.json`)
    // .then((res) => res.json())
    // .then((dataset: Dataset) => {
    //   dataset.nodes.forEach((node) =>{
          
    //       graph.addNode(node.id,{
    //         ...node,
    //         label: node.id,
    //         hidden: true,
    //         size: 3,
    //         color: NODE_COLOR,
    //         tag: [],
    //       })
    //   });
    //   dataset.edges.forEach((edge) => {
    //     addEdge({...edge, inViewport: true, type:(edge.attributes?.category||"").toUpperCase()});
    //   });
    //   requestAnimationFrame(() =>{setDataReady(true)});
    //   console.log('graph loaded', graph.nodes.length)
    
    // });
    GetSignallingNetwork((records) => {
      records.forEach((record) => {
        graph.updateNode(record.get(0), (attr)=>{
          return {
              label: record.get(0),
              color: NODE_COLOR,
              hidden:true,
              size: 3,
              x: Number(record.get(1)),
              y: Number(record.get(2))
          }
        });

        graph.updateNode(record.get(4), (attr)=>{
            return {
                label: record.get(4),
                color: NODE_COLOR,
                hidden:true,
                size: 3,
                x: Number(record.get(5)),
                y: Number(record.get(6))
            }
        })

        if(record.get(3) == 'phy'){
          graph.mergeUndirectedEdge(record.get(0), record.get(4), 
            {
              color: PHY_COLOR, 
              weight: 0.5, 
              category: 'PHY', 
              hidden: true
            }
          )
        } else if(record.get(3) == 'pos'){
          graph.mergeDirectedEdge(record.get(0), record.get(4), 
            {
              color: POS_COLOR, 
              weight: 0.5, 
              category: 'POS', 
              hidden: true
            }
          )
        } else{
          graph.mergeDirectedEdge(record.get(0), record.get(4), 
            {
              color: NEG_COLOR, 
              weight: 0.5, 
              category: 'NEG', 
              hidden: true
            }
          )
        }
      })

      requestAnimationFrame(() =>{setDataReady(true)});
    }) 
    
      
  }

  
  useEffect(() => {
    if (!graph || !dataset) return;

    setDataReady(false);
    if (graphOps.edge_type==""){
        loadCompleteGeneGraph();
    }
    else {  
      graph.clear();
      GetSubGraphWithLabel(dataset, getSubgraphCallback);
      const layout = new FA2Layout(graph, {
        settings: {gravity: 0.2},
      });
      layout.start();
      console.log(layout.isRunning());
      setTimeout(()=>{
        layout.stop();
      }, 3000);
    }
    
    return () => graph.clear();
  }, [graph, dataset]);

  return null;
};

export default GraphDataController;
