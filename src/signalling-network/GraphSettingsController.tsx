import { useSigma } from "react-sigma-v2";
import { FC, useEffect, useState } from "react";

import useDebounce from "../use-debounce";
import { GetGeneByAttribute, GetGeneByHallmarks, GetGeneByStat } from "../db/db_conn";
import { gradient, hallmarks, hallmarks_color, MAX_NODE_SIZE, 
  MIN_NODE_SIZE, NODE_COLOR, NODE_FADE_COLOR,  NODE_HIGHLIGHT_COLOR } from "./consts";

const GraphSettingsController: FC<{ 
  hoveredNode: string | null, 
  viewBy: string[],
  geneSets: string[],
  edgeType: string, 
  statType: string,
  statFilter: any,
  showDrugTarget: boolean,
  dataset: string,
  graphLoaded: boolean,
  updateCallback: (i: number)=>void
}> = ({ hoveredNode, viewBy, edgeType, statType, geneSets,
  showDrugTarget, dataset, statFilter, graphLoaded, updateCallback }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const re = new RegExp('^R-.*$');
  const hm = new RegExp('^hallmark.*');


  useEffect(()=> {
    console.log(viewBy, edgeType)
    if(viewBy.includes('all') || 
    (viewBy.length == 0 && edgeType != '')){
      updateLabelSetting(1000);
      graph.updateEachNodeAttributes((node, attr) => {

        let hide_node = false;
      const neutral_links = graph.filterEdges(
        node, 
        (edge, attributes, source, target, sourceAttributes, targetAttributes) => 
          attributes.category == 'PHY'
      )
     
      const signal_links = graph.filterEdges(
        node, 
        (edge, attributes, source, target, sourceAttributes, targetAttributes) => 
          attributes.category == 'POS' || attributes.category == 'NEG'
      )
      

      if(edgeType == 'neutral_link' && neutral_links.length == 0){
          hide_node = true;
      } else if(edgeType == 'signal_link' && signal_links.length == 0){
          hide_node = true;
      }

        return {
          ...attr,
          hidden: hide_node,
          color: NODE_COLOR,
          size: 4,
        }
      })
      updateEdges();
      return;
    }

    if(viewBy.length == 0 && edgeType == ''){
     
      return;
    } 
    if(viewBy.length > 0){
      updateByAttributes()
    }

    if(geneSets.length > 0){
      updateTargetCombination();
    }
  }, [graphLoaded, viewBy])

  useEffect(() => {
    console.log(geneSets)  
    updateTargetCombination();

  }, [geneSets])

  useEffect(() => {
    if(statType!=undefined || statFilter!=undefined) {
      updateByStat()
    }

    if(geneSets.length > 0){
      updateTargetCombination();
    }
  }, [statType, statFilter, graphLoaded])


  useEffect(()=>{
    if(edgeType==''){
      return
    }
    graph.updateEachNodeAttributes((node, attr) => {
      let hide_node = false;
      const neutral_links = graph.filterEdges(
        node, 
        (edge, attributes, source, target, sourceAttributes, targetAttributes) => 
          attributes.category == 'PHY'
      )
     
      const signal_links = graph.filterEdges(
        node, 
        (edge, attributes, source, target, sourceAttributes, targetAttributes) => 
          attributes.category == 'POS' || attributes.category == 'NEG'
      )
      

      if(edgeType == 'neutral_link' && neutral_links.length == 0){
          hide_node = true;
      } else if(edgeType == 'signal_link' && signal_links.length == 0){
          hide_node = true;
      }
      

      return {
        ...attr,
        hidden: hide_node,
        color: NODE_COLOR,
        size: 4,
      }
    })
    updateEdges();
  }, [edgeType, graphLoaded])


  const updateTargetCombination = () => {
    graph.updateEachNodeAttributes((x, attr) => {
      if(geneSets.includes(x) && attr.color != NODE_HIGHLIGHT_COLOR){
        return {
          ...attr,
          color: NODE_HIGHLIGHT_COLOR,
          ori_color: [attr.color, attr.size],
          size: 7,
          zIndex: 0
        }
      } else if(attr.color == NODE_HIGHLIGHT_COLOR){
        return {
          ...attr,
          color: attr.ori_color[0],
          size: attr.ori_color[1],
          zIndex: 1
        }
      } else {
        return {
          ...attr,
          zIndex: 1
        };
      }
    })
    
  }

  const updateByAttributes = () =>{
   
    const cancer_gene = viewBy.includes('cancer_gene');
    const drug_target = viewBy.includes('drug_targets');
    const pathways = viewBy.filter(x => re.test(x));

    const hallmarks_id: string[] = viewBy.filter(x => hm.test(x));
    const color_map: {[key: string]: string} = {};
    const hallmarks_name = hallmarks_id.map((x) => {
      const idx = x.split('_')[1];
      const name = hallmarks[Number(idx)]
      color_map[name] = hallmarks_color[Number(idx)];
      return name
    })

    if(hallmarks_name.length > 0){
      GetGeneByHallmarks(
        hallmarks_name,
        (res: {node: string, hallmarks: string[]}[]) => {
          graph.updateEachNodeAttributes((node, attr) => {
            const data = res.find(x=>x.node==node)
            if(data!=undefined){
              const color = color_map[data.hallmarks[0]];
              return {
                ...attr,
                size: 4,
                color: color,
                zIndex: 0
              }
            } else {
              return {
                ...attr,
                size: 4,
                zIndex: 1,
                color: NODE_FADE_COLOR,
              }
            }
          })
          updateEdges();
          updateLabelSetting(res.length);
        })
        return;
    }
    
    GetGeneByAttribute(
      cancer_gene, 
      drug_target, 
      pathways, 
      (nodes: string[]) => {
        //console.log(nodes);
        graph.updateEachNodeAttributes((node, attr) => {
          if(nodes.includes(node)){
            return {
              ...attr,
              hidden: false,
              color: NODE_COLOR,
              size: 4,
              zIndex: 0,
            }
          } else {
            return {
              ...attr,
              color: NODE_FADE_COLOR,
              size: 4,
              zIndex: 1,
            }
          }
        })
        updateEdges();
        updateLabelSetting(nodes.length)
    })

  }

  const updateByStat = () => {
    let stat = statType;
    let min = 0;
    let max = 100;
    if(statFilter!=undefined && statFilter.filter_on!=undefined){
      stat = statFilter.filter_on
    }
    if(statFilter!=undefined && statFilter.min !=undefined){
      min = statFilter.min
    }
    if(statFilter!=undefined && statFilter.max !=undefined){
      max = statFilter.max
    }
    if(stat == '' || stat ==undefined){
      return;
    }
    GetGeneByStat(
      stat, 
      min,
      max,
      (res) => {
        graph.updateEachNodeAttributes((node, attr) => {
          const data = res.find(x => x.node == node);
          if(data!=undefined){
            let [color, size] = getSizeAndColorByStat(data.percent);
            
            return {
              ...attr,
              zIndex: 0,
              color: color,
              size: size,
            }
          } else {
            return {
              ...attr,
              zIndex: 1,
              color: NODE_FADE_COLOR,
              size: 4,
            }
          }
        })

        updateEdges();
        updateLabelSetting(res.length)
        geneSets.forEach((x)=>{
          graph.updateNodeAttributes(x, (attr) => {
            return {
              ...attr,
              color: NODE_HIGHLIGHT_COLOR,
              size: 7,
            }
          })
        })
      }
    )
    
  }


  const updateEdges = () => {
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
  }

//   useEffect(()=>{
//     const node_count = graph.filterNodes((node, attr)=>!attr.hidden && attr.color!=NODE_FADE_COLOR).length;
//     if(viewBy.includes('all')||viewBy.length==0||viewBy.includes('hallmark')){
//       sigma.setSetting('labelRenderedSizeThreshold', 5);
//       sigma.setSetting('labelDensity', 0.2);    
//       sigma.setSetting('labelGridCellSize',40);
//     } else if(node_count < 80){
//       sigma.setSetting('labelRenderedSizeThreshold', 4);
//       sigma.setSetting('labelDensity', 0.5);    
//       sigma.setSetting('labelGridCellSize',20);
      
//     }
    
// }, [viewBy, statType]);

  const updateLabelSetting = (node_count: number) => {
    if(node_count < 80){
      sigma.setSetting('labelRenderedSizeThreshold', 4);
      sigma.setSetting('labelDensity', 0.5);    
      sigma.setSetting('labelGridCellSize',20);
    } else {
      sigma.setSetting('labelRenderedSizeThreshold', 5);
      sigma.setSetting('labelDensity', 0.2);    
      sigma.setSetting('labelGridCellSize',40);
    }
  }

  const getSizeAndColorByStat = (percent: number) => {
    if(isNaN(percent)){
      return [NODE_COLOR, 4];
    }
    const color = gradient(percent).css();
    const size = (MAX_NODE_SIZE-MIN_NODE_SIZE)*percent+MIN_NODE_SIZE;
    return [color, size];
  }


  return null;
};

export default GraphSettingsController;
