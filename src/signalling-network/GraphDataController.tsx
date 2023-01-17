import { useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { Dataset, EdgeData, GraphOps, NodeData  } from "../types";

import FA2Layout from "graphology-layout-forceatlas2/worker";
import { GetSubGraphWithLabel } from "../db/db_conn";
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
      fetch(`${process.env.PUBLIC_URL}/wg1.json`)
      .then((res) => res.json())
      .then((dataset: Dataset) => {
        dataset.nodes.forEach((node) =>{
            graph.addNode(node.id,{
              ...node,
              label: node.id,
              hidden: true,
              size: 3,
              color: NODE_COLOR,
              ori_color: NODE_COLOR,
              inViewport: true,
              tag: [],
            })
        });
        dataset.edges.forEach((edge) => {
          addEdge({...edge, inViewport: true, type:(edge.attributes?.category||"").toUpperCase()});
        });
        fetch(`${process.env.PUBLIC_URL}/stat.csv`)
      .then((res) => res.text())
      .then((data) => {
        var lines = data.split("\n");
        const headers = lines[0].split(',').slice(2);
        lines = lines.slice(1);
        for(let i=0; i<lines.length; i++){
          const line = lines[i];
          var fields = line.split(',');
          const node = fields[1];
          fields = fields.slice(2);
          var stats: {[key:string]:number;}={}
          for(let i=0; i<fields.length; i++){
            stats[headers[i].trim()]=Number(fields[i]);
          }
          try{
            graph.mergeNodeAttributes(node, stats);
          } catch (error){
            console.log(error);
          }
          
        }
        requestAnimationFrame(() =>{setDataReady(true)});
      });
      });
      
    
      
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
