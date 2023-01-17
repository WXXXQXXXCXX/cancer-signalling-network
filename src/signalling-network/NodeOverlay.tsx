import React, { FC, useEffect, useState } from 'react';
import { useSigma } from 'react-sigma-v2';
import { NodeAttributes, Pathway } from '../types';
import { GetNodeAttributeByEntrezName, GetPathwayOfGene } from '../db/db_conn';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';

const NODE_FADE_COLOR = "rgba(150,150,150,0.6)"
const EDGE_FADE_COLOR = "#eee";

const NodeOverlay : FC<{
    xPos: number, 
    yPos: number, 
    node: string, 
    show: boolean, 
    pathwayCallback: (p:any)=>void,
    attrCallback: (attr:any) => void,
    onClose: ()=>void}
> = ({xPos, yPos, show, node, pathwayCallback, attrCallback, onClose}) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [hops, setHops] = useState(0);

    useEffect(()=>{
        setHops(0);
    }, [node])

    useEffect(() => {
        if(node=="" || !node || hops == 0){
            sigma.setSetting(
                "nodeReducer", 
                (nd, data) => nd
                    ? { ...data, zIndex: 1 }
                    : {...data});
                sigma.setSetting(
                "edgeReducer", 
                (edge, data) => edge
                    ? { ...data, color: graph.getEdgeAttribute(edge, "color"), size: 0.8 }
                    : {...data}
            );
            return;
        }

        
        var nHop = hops;
        var nodes: string[] = [];
        var edges: string[] = [];
        var q = [];

        q.push(node);
        nodes.push(node);

        while(nHop>0 && q.length>0) {
            var new_q: string[] = [];
            while(q.length > 0) {
                var cur_node = q[0];
                q.shift();
                graph.forEachOutboundEdge(cur_node, 
                    (edge, attributes, source, target, sourceAttributes, targetAttributes) => {
                        nodes.push(target);
                        new_q.push(target);
                        edges.push(edge);
                })
                nHop--;
                
            }
            console.log(nodes);
            console.log(edges);
            console.log(new_q);
            q = new_q;
        }
        console.log(edges);
        sigma.setSetting("nodeReducer", 
            (nd, data) => nodes.includes(nd)
                ? { ...data, zIndex: 1 }
                : { ...data, zIndex: 0, label: "", color: NODE_FADE_COLOR, image: null, highlighted: false });
        sigma.setSetting("edgeReducer", 
            (edge, data) => edges.includes(edge)
                ? { ...data, color: graph.getEdgeAttribute(edge, "color"), size: 2 }
                : { ...data, color: EDGE_FADE_COLOR, hidden: true });
        
    }, [hops]);
    
    const getAttr = () => {
        GetNodeAttributeByEntrezName(node)
        .then((data: NodeAttributes)=>{attrCallback(data)});
    }

    const getPathways = () => {
        GetPathwayOfGene(node, (p: Pathway[])=>{
            pathwayCallback(p);
        });
        
    }

    const closeAndReset = () => {
        onClose();
        setHops(0);
    }
    return (
    <Menu
    open = {show}
    onClose={closeAndReset}
    anchorReference="anchorPosition"
    anchorPosition={show?{
        left: xPos, 
        top: yPos
    }:undefined}
    >
        
        <MenuItem onClick={()=>{getAttr(); onClose()}}>Show Attributes</MenuItem>
        <MenuItem onClick={()=>{getPathways(); onClose()}}>Show Parent Pathways</MenuItem>
        <MenuItem onClick={()=>{setHops(1); onClose()}}>Show 1-hop Neighbour</MenuItem>
        <MenuItem onClick={()=>{setHops(2); onClose()}}>Show 2-hop Neighbour</MenuItem>
    </Menu>
  );
}

export default NodeOverlay;