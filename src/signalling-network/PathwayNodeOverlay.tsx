import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { FC, useEffect, useState } from 'react';
import { useSigma } from 'react-sigma-v2';
import { PATHWAY_H_EDGE_COLOR, PATHWAY_H_EDGE_FADE_COLOR, PATHWAY_NODE_COLOR, PATHWAY_NODE_FADE_COLOR, PATHWAY_V_EDGE_COLOR, PATHWAY_V_EDGE_FADE_COLOR } from './consts';

const PathwayNodeOverlay: FC<{
    xPos: number, 
    yPos: number, 
    node: string, 
    show: boolean, 
    pathwayList: string[],
    onClose: ()=>void,
    pathwaySelectCallback: (idx: string)=>void,
}
> = ({xPos, yPos, show, node, pathwayList, onClose, pathwaySelectCallback}) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [fade, setFade] = useState(false);
    useEffect(()=>{
        var reset = false;
        if(pathwayList.length==0 && fade){
            setFade(false);
            reset = true;
            
        } else if(pathwayList.length!=0 && !fade){
            setFade(true);
            reset = true;
        }

        if(reset){
            graph.forEachNode((node, attr)=>{
                const l = attr.pathwayLevel
                if(l!=undefined){
                    //console.log(node, fade, fade?PATHWAY_NODE_FADE_COLOR[l-1]:PATHWAY_NODE_COLOR[l-1]);
                    graph.setNodeAttribute(node, 'color', fade?PATHWAY_NODE_FADE_COLOR[l-1]:PATHWAY_NODE_COLOR[l-1]);
                }
            })
            graph.forEachEdge(
                (edge, attributes, source, target, sourceAttributes, targetAttributes, undirected)=>{
                    
                    if(sourceAttributes.pathway!=undefined && undirected){
                        graph.setEdgeAttribute(edge, 'color', fade?PATHWAY_H_EDGE_FADE_COLOR:PATHWAY_H_EDGE_COLOR);
                    } else if(sourceAttributes.pathway!=undefined && !undirected){
                        graph.setEdgeAttribute(edge, 'color', fade?PATHWAY_V_EDGE_FADE_COLOR:PATHWAY_V_EDGE_COLOR);
                    }
            })
        }
        
        
    }, [pathwayList]);
    const showHideChild = () => {
        const attr =graph.getNodeAttributes(node);
        if(attr.pathwayLevel==3) return;
        console.log(attr);
        const neighbours:string[] = [];
        graph.forEachOutboundEdge(node, 
            (edge, attributes, source, target, sourceAttributes, targetAttributes, undirected)=>{
                const other = node==source?target:source;
                const otherAttr = node==source?targetAttributes:sourceAttributes;
                if(!undirected && otherAttr.pathwayLevel == attr.pathwayLevel+1){
                    neighbours.push(other);
                    otherAttr.hidden = !otherAttr.hidden;
                    graph.updateNodeAttribute(other, 'hidden', x=>attr.expanded?true:false);
                    graph.updateEdgeAttribute(edge, 'hidden',x=>attr.expanded?true:false);
                    
                }else{
                    if(!otherAttr.hidden){
                        graph.updateEdgeAttribute(edge, 'hidden',x=>false);
                        graph.updateEdgeAttribute(edge, 'hidden',x=>attr.expanded?false:true);
                    }
                }
            })
        graph.updateNodeAttribute(node, 'expanded', x=>!x);
        graph.updateNodeAttribute(node, 'size', x=>x==5?10:5);
        for(let i=0; i<neighbours.length; i++){
            
            const opp = neighbours[i];
            //console.log(opp);
            graph.forEachOutboundEdge(opp, 
                (edge, attributes, source, target, sourceAttributes, targetAttributes, undirected)=>{
                const other = opp==source?target:source;
                const otherAttr = opp==source?targetAttributes:sourceAttributes;
                const thisAttr = opp==source?sourceAttributes:targetAttributes;
                if(!otherAttr.hidden&&undirected){
                    // console.log(other, otherAttr.hidden, undirected, attributes);
                    graph.updateEdgeAttribute(edge, 'hidden', x=>false)
                } else if(!undirected&& otherAttr.pathwayLevel == thisAttr.pathwayLevel+1 && thisAttr.expanded){
                    graph.updateEdgeAttribute(edge, 'hidden', x=>!x)
                    graph.updateNodeAttribute(other,'hidden',x=>attr.expanded?false:true);
                }
            })
        }
    }

    const showHideMemberGenes = () => {
        pathwaySelectCallback(node);
    }

    return (
        <Menu
        open = {show}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={show?{
            left: xPos, 
            top: yPos
        }:undefined}
        > 
            <MenuItem onClick={()=>{showHideChild(); onClose()}}>Show/Hide Children</MenuItem>
            <MenuItem onClick={()=>{showHideMemberGenes(); onClose()}}>Show/Hide Member Genes</MenuItem>
        </Menu>
    )
}

export default PathwayNodeOverlay;