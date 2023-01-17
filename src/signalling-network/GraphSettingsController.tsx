import { useSetSettings, useSigma } from "react-sigma-v2";
import { FC, useEffect, useState } from "react";

import useDebounce from "../use-debounce";
import { GetDrugTargets, GetHallmarkGene, GetNodesByPathwayId, GetOncogenes } from "../db/db_conn";
import { Attributes } from "graphology-types";
import { EDGE_FADE_COLOR, gradient, hallmarks_color, MAX_NODE_SIZE, 
  MIN_NODE_SIZE, NEG_COLOR, NODE_COLOR,
   NODE_COLOR_MAX, NODE_COLOR_MIN,  NODE_FADE_COLOR,  stats } from "./consts";
import { privateEncrypt } from "crypto";

const GraphSettingsController: FC<{ 
  hoveredNode: string | null, 
  viewBy: string[],
  edgeType: string, 
  statType: string,
  statFilter: any,
  showDrugTarget: boolean,
  dataset: string,
  graphLoaded: boolean,
  updateCallback: (i: number)=>void
}> = ({ hoveredNode, viewBy, edgeType, statType, 
  showDrugTarget, dataset, statFilter, graphLoaded, updateCallback }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const debouncedHoveredNode = useDebounce(hoveredNode, 40);
  const [fetchedAttributes, setFetchedAttributes] = useState<string[]>([]);
  const [statsBound, setStatsBound] = useState<{[key: string]:number[]}>({});
  const [nodeCount, setNodeCount] = useState(6305);
  const re = new RegExp('^R-.*$');
  const hm = new RegExp('^hallmark.*');

  
  useEffect(()=>{
    
    if(statsBound[statType]!=undefined) return;
    
    var newStats:{[key:string]:number[]} = {};
    for(let i=0; i<stats.length; i++){
      const stat = stats[i];
      
      const scores = graph.nodes().map((node) => {
        
        const val = graph.getNodeAttribute(node, stat);
        if(!val) return 0;
        return val;
      });
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      newStats[stat]=[min,max];
    }
    setStatsBound(newStats);
    console.log('new stats: ', newStats);
  }, [graphLoaded, statType, viewBy, edgeType])

  const updateByTag = (tag: string, nodes: string[]) => {
    graph.forEachNode((node, attr) => {
      if(nodes.includes(node)){
        graph.updateNodeAttributes(node, attributes=>{
          return {
            ...attributes,
            tag: [...attributes.tag, tag],
            hidden: false,
            color: NODE_COLOR,
            ori_color: NODE_COLOR,
            size: 4,
          }
        });
      } else{
        graph.updateNodeAttributes(node, attributes=>{
          return {
            ...attributes,
           
            hidden: false,
            color: NODE_FADE_COLOR,
            ori_color: NODE_FADE_COLOR,
            size: 4,
          }
        });
      }
    })
  }

  const getAttributes=()=>{
    const newVal = [...fetchedAttributes];
    var updated = false;
    for(let i=0; i<viewBy.length; i++){
      const attr = viewBy[i];
      if(fetchedAttributes.includes(attr)){
        updateGraph();
        updated = true;
        continue;
      } else {
        switch(true){
          case re.test(attr):
            GetNodesByPathwayId(attr, (nodes)=>{
              
              updateByTag(attr, nodes);
              
              updateGraph();
              updated = true;
              // setNodeCount(graph.filterNodes((n, attr)=>!attr.hidden).length);
            });
            break;
          case attr == "cancer_gene":
            GetOncogenes((nodes: string[]) => {
              
              updateByTag(attr, nodes);
              
              updated = true;
              updateGraph();
            });
            break;
          case attr == 'drug_targets':
            GetDrugTargets((nodes: string[]) => {
              
              updateByTag(attr, nodes);
              
              updated = true;
              updateGraph();
            });
            break;
            
        }
        newVal.push(attr);
      }
      
    }
    if(viewBy.length == 0){
      updateGraph();
    }
    if(newVal.length>0)
      setFetchedAttributes([...fetchedAttributes, ...newVal])
  }

  useEffect(()=>{
    console.log(nodeCount);
    if(viewBy.includes('all')||viewBy.length==0||viewBy.includes('hallmark')){
      sigma.setSetting('labelRenderedSizeThreshold', 5);
      sigma.setSetting('labelDensity', 0.2);    
      sigma.setSetting('labelGridCellSize',40);
    } else{
      sigma.setSetting('labelRenderedSizeThreshold', nodeCount<=50?1:5);
      sigma.setSetting('labelDensity', nodeCount<=50?35:0.2);    
      sigma.setSetting('labelGridCellSize',nodeCount<=50?5:40);
      
    }
    
  }, [nodeCount, viewBy]);

  var newNodeCount = 0;
  const updateGraph = () =>{
    graph.forEachNode((node, attributes) => {
      var should_show_by_tag = false;
      if(viewBy.includes('all')){
        should_show_by_tag = true;
      } else {
        should_show_by_tag = viewBy.some(x=>attributes.tag!=undefined && attributes.tag.includes(x))||viewBy.length==0
      }
      if(viewBy.length==0 && edgeType==undefined){
        should_show_by_tag = false;
      }

      var color_hm = ""
      viewBy.forEach((v)=>{
        if(v=='hallmark'){
          if(attributes.hallmark!=0){
            should_show_by_tag = true;
          } 
        }else if(hm.test(v)){
          const idx = v.split('_')[1];
          if(attributes.hallmark & 2 << Number(idx)){
            color_hm = hallmarks_color[Number(idx)]
            should_show_by_tag = true;
          }
        }
      })

      
      const should_show_by_val = 
            statFilter==undefined||
            statFilter.filter_on==undefined||
            (attributes[statFilter.filter_on]
            &&Reflect.get(attributes, statFilter.filter_on)>=statFilter.min
            && Reflect.get(attributes, statFilter.filter_on)<=statFilter.max);
   
      if(should_show_by_tag && should_show_by_val ){
        const [color, size] = getNodeSizeAndColor(node, attributes, statType);
        newNodeCount ++;
        graph.updateNodeAttributes(node, attr=>{
          return {
            ...attr,
            size: size,
            color: color_hm==""?color:color_hm,
            ori_color: color_hm==""?color:color_hm,
            hidden: false,
            zIndex: 1
          }
        })
      } 
      else{
        graph.updateNodeAttributes(node, (attr)=>{
          return {
            ...attr,
            hidden: false,
            color: NODE_FADE_COLOR,
            zIndex: 0,
            size: 4,
            
          }
        });
      }
    })

    graph.forEachEdge(
      (edge, attributes, source, target, sourceAttributes, targetAttributes, undirected) => {
        let should_show;
        switch (edgeType) {
          case "all_edge":
            should_show = true;
            break;
          case "":
            should_show = false;
            break;
          case "neutral_link":
            should_show = attributes.category=='PHY'?true:false;
            break;
          case "signal_link":
            should_show = attributes.category=='POS'||attributes.category=='NEG'?true:false;
            break;
          default:
            should_show = true;
        }
        if(graph.getNodeAttribute(source,'color') == NODE_FADE_COLOR || graph.getNodeAttribute(target, 'color') == NODE_FADE_COLOR){
          should_show = false;
        }
        if(should_show){
          graph.setEdgeAttribute(edge, 'hidden', false);
        } else if(!should_show && !attributes.hidden){
          
          graph.setEdgeAttribute(edge, 'hidden', true);
        }
      })
      updateCallback(Date.now())
      setNodeCount(newNodeCount);
  }

  useEffect(() => {
    console.log(edgeType, statFilter, statType, viewBy);
    getAttributes();
    
    
  }, [edgeType, viewBy, statFilter, statType]);

  const log = (x: number) => {
    return Math.log10(x+1e-17);
  }

  const getNodeSizeAndColor = (node: string, data:Attributes, stat:string): [string, number] => {

    if(stat=="") return [NODE_COLOR, 4];
    if(viewBy.length>0) return [NODE_COLOR, 4];
    if(statsBound[stat]==undefined || statsBound[stat].length==0) return [NODE_COLOR, 4];
    var max =statsBound[stat][1];
    var min =statsBound[stat][0];
    var value = graph.getNodeAttribute(node, stat)

    // if(max<1){
    //   max = log(max);
    //   min = log(min);
    //   value = log(value)
    // }
    var percent = (value-min)/(max-min);
    const color = gradient(percent).css()
   
    const size = (MAX_NODE_SIZE-MIN_NODE_SIZE)*percent+MIN_NODE_SIZE;
    return [color, size];
  }





  return null;
};

export default GraphSettingsController;
