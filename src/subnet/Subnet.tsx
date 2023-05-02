import { Box, Button, Divider, IconButton, Input, Link, Paper, Select, Slider, stepConnectorClasses, TextField } from '@mui/material';
import { curry } from 'lodash';
import React, { FC, useMemo, useEffect, useState} from 'react';
import { GeneAttribute } from '../component/GeneAttribute';
import { GetNodeAttributeByEntrezName, GroupNodesByPathway } from '../db/db_conn';
import { hallmarks } from '../signalling-network/consts';
import GroupExpandModal from './GroupExpand';
import { node_html } from './NodeStyle';
import { Group, MotifResponse } from './types';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Legend from './Legend';
import GenePairTable from './GenePairTable';
import 'cytoscape-panzoom/cytoscape.js-panzoom.css';
import 'cytoscape-panzoom/font-awesome-4.0.3/css/font-awesome.css';
var cytoscape = require('cytoscape');

var nodeHtmlLabel = require("cytoscape-node-html-label");
nodeHtmlLabel( cytoscape );

var popper = require('cytoscape-popper');
cytoscape.use( popper );

var panzoom = require('cytoscape-panzoom');
panzoom( cytoscape ); 

const BASE_URL = 'http://localhost:3000'
const Subnet: FC = () => {

    const ref = React.useRef(null)
    const requestRef = React.useRef<AbortController | null> ()
    const [data, setData] = useState<MotifResponse>();
    const [attr, setAttr] = useState<{[key: string]: any}>({});
    const [hm, set_hm] = useState<any[]>([]);
    const [startNode, setStartNode] = useState('');
    const [endNode, setEndNode] = useState('');
    const [CY, setCY] = useState<any>(null);
    const [sliderValue, setSliderValue] = useState(1);
    const [cur, setCur] = useState<any[]>([]);
    const [nodeParent, setNodeParent] = useState<{[key: string]: string}>({});
    const [subgraph, setSubgraph] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [showGenePairs, setShowGenePairs] = useState(false)
    const [openLegend, setOpenLegend] = useState(false);
    const [genePairs, setGenePairs] = useState<any[]>([]);

    const marks = [] 

    for (let i=0; i<1; i+=0.1){
      marks.push({
        value: i,
        label: Math.round(i*10)/10
      });
    }


    const nodes = useMemo(() => {
      const res: string[] = []
      if(!data){
        return [];
      }
      if(Object.keys(data).length == 0){
        return res
      }
      return Object.keys(data['nodes'])

    }, [data])

    
    useEffect(() => {
      function getMotif() {
        console.log('get motif')
        const item = window.localStorage.getItem('target_nodes')
        const pathways = window.localStorage.getItem('pathways')
        const pairs = window.localStorage.getItem('gene_pairs')
        if(!item || !pathways){
          return;
        }
        const item_json = JSON.parse(item)
        const pathway_json = JSON.parse(pathways)
        if(pairs != undefined && pairs.length > 0){
          const gene_pairs = JSON.parse(pairs)
          setGenePairs(gene_pairs)
        }

        item_json['pathway'] = pathway_json
        fetch(
          `${BASE_URL}/motif`,{
            method: 'POST',

            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(item_json)
          }
        )
        .then((res) => { 
          console.log(res.headers.get('content-type')); 
          return res.text()
        })
        .then((res) => {
          var res_obj: MotifResponse = JSON.parse(res)
          console.log(res_obj)
          var parent: {[key: string]: string }= {}
          Object.values(res_obj['groups']).forEach((grp: Group) => {
            const grp_id = grp['data']['id']
            grp['data']['children'].forEach((child: string) => {
              if(parent[child] == undefined){
                parent[child] = grp_id
              }
            })
          })

          setNodeParent(parent);
          setData(res_obj)

          const edges: any[] = res_obj['edges']
          const nodes: any[] = Object.keys(res_obj['nodes']).map((key) => {
            return res_obj['nodes'][key];         
          });         
          setCur(nodes.concat(edges))
        })
        .catch((error) => {
          console.error('Error:', error);
        });
        
      }
      getMotif()
      window.addEventListener('target_nodes', getMotif)
      
      return () => {
        window.removeEventListener('target_nodes', getMotif)
      }
    },[])


    useEffect(()=>{
        if(cur.length == 0 || nodes.length == 0 || !data){
          return
        }

        var cy = cytoscape({
          container: ref.current,
          minZoom: 0.1,
          maxZoom: 3,

          layout: {
            name: 'preset',
    
            positions: (node: any) => {

              var position = node.data('position')
              
              return position;
            }
          },
          style: [
            {
              selector: 'node.groupIcon',
              style: {
                'background-color': '#ff0000',
                "width": (ele: any) => {
                  const id = ele.data('id')
                  var node = data['nodes'][id]
                  if(!node){
                    node = data['groups'][id]
                  }
                  const size = node['data']['size']
                  return (size/nodes.length*56+28) + 'px';
                },
                "height": (ele: any) => {
                  const id = ele.data('id')
                  var node = data['nodes'][id]
                  if(!node){
                    node = data['groups'][id]
                  }
                  const size = node['data']['size']
                  return (size/nodes.length*56+28) + 'px';
                },
                "background-opacity": 1,
                "shape": (ele: any) => {
                  if(ele.data('type') == 'fan'){
                    return 'triangle';
                  } else if(ele.data('type') == 'clique'){
                    return 'hexagon';
                  } else if(ele.data('type') == 'connector') {
                    return 'diamond';
                  } else if(ele.data('type') == 'single') {
                    return 'circle';
                  } else {
                    return 'vee';
                  }
                }
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': function(edge: any){
                  if(edge.data('category') == 'POS'){
                    return '#52b788'
                  } else if(edge.data('category') == 'NEG'){
                    return '#f07167'
                  } else{
                    return '#3b90c2'
                  }
                },
                'curve-style': 'straight'
              }
            },
            {
              selector: '.highlighted',
              style: {
                'line-color': 'red',
                'background-color': 'blue'
              }
            },
            {
              selector: '.faded',
              style: {
                'opacity': '0.1',
                'background-color': '#c4c4c4'
              }
            },
            {
              selector: ':selected',
              style: {
                'overlay-color': "#6c757d",
                'overlay-opacity': 0.3,
                'background-color': "#999999"
              }
            },
          ],
          elements: cur
        });
        
        
        cy.nodeHtmlLabel(node_html())
        // cy.panzoom();
        cy.filter('node').forEach((t: any) => {
          if(!t.hasClass('nodeIcon')){
            bindPopper(t);
          }
          
        })

        cy.on("click", "node", function (e: cytoscape.EventObject) {
          const target_node = e.target
          if(target_node.hasClass('groupIcon')){
            const children: any[] = data['groups'][target_node.id()]['data']['children'];
          
            let new_target: string[] = [];
            let new_elements: any[] = [];
            let q = [...children]
            while(q.length > 0){
              const cur = q.shift()
              if(cur && data['groups'][cur] != undefined){
                const new_children: string[] = data['groups'][cur]['data']['children'];
                q = q.concat(new_children);  
              } else {
                new_target.push(cur)
              }
            }
  
            data['edges'].forEach((edge) => {
              const src = edge['data']['source'];
              const dest = edge['data']['target'];
              if(new_target.includes(dest) && new_target.includes(src)){
                new_elements.push(edge);
              }
            })
            new_elements = new_elements.concat(new_target.map(x =>data['nodes'][x]));
            setOpen(true);
            setSubgraph(new_elements);
            
        
            return
          }

          GetNodeAttributeByEntrezName(target_node.id())
          .then((attr) => {

            var data = localStorage.getItem('target_nodes');
            if(data!=null){
              var nodes: any[]= JSON.parse(data)['nodes'];
              var node = nodes.filter((ele: any) => ele.key == target_node.id())[0];
              if(node != null && node['attributes']!=null){
                const hm_mask: number = node['attributes']['hallmark'];
                const hallmark_list = [];
                for(let i=0; i<10; i++){
                  if(hm_mask & 2<<i){
                    hallmark_list.push(<ul>{hallmarks[i]}</ul>);
                  }
                }
                set_hm(hallmark_list)
              }
            }
            setAttr(attr)

          })
        });

        cy.on('tap', function(event: any){
          
          var evtTarget = event.target;
        
          if( evtTarget === cy ){
            cy.elements().removeClass('faded');
            cy.elements().removeClass('highlighted');
          }
        });
        setCY(cy)
      
    }, [data, cur])


    const find_path = () => {
      if(!data){
        return
      }
      CY.elements().removeClass('faded highlighted')
      console.log(startNode, endNode, CY)
      var start = CY.$(`#${startNode}`)
      var end = CY.$(`#${endNode}`)
      console.log(start, end)
      const nodes = data['nodes']
      if(start.length == 0){
        var cur = nodeParent[startNode];
        console.log(nodes, cur)
        while(start.length==0 && cur){
          start =  CY.$(`#${cur}`);
          cur = nodeParent[cur];
          console.log('find end, ', cur);
        }
      }

      if(end.length==0){
        var cur = nodeParent[endNode];
        console.log(nodes, cur)
        while(end.length == 0 && cur){
          end =  CY.$(`#${cur}`);
          cur = nodeParent[cur];
          console.log('find end, ', cur);
        }
      }

      console.log(start, end);
      if(!start || !end){
        console.log(`cannot find node start: ${startNode}, end: ${endNode}`);
        return
      }

      var dijkstra = CY.elements().dijkstra(start, function(edge: any){
        return 1;
      });
      
      var path = dijkstra.pathTo(end);
      console.log(path);
      CY.elements().not(path).addClass('faded');
      path.addClass('highlighted');
      
    }

    const bindPopper = (target: any) => {
      let tooltipId = `popper-target-${target.id()}`;
      let existingTarget = document.getElementById(tooltipId);
      if (existingTarget) {
        existingTarget.remove();
      }
  
      let popper = target.popper({
        content: () => {
          
          let tooltip = document.createElement('div');
          tooltip.id = tooltipId;
          if(target.hasClass('nodeIcon')){
            tooltip.innerHTML = target.id();
          } else {
            const type:string = target.data('type');
            var txt = ``;
            if(!data){
              return;
            }
            const size = data['groups'][target.id()]['data']['size']
            if(type.includes('R-HSA')){
              txt += 
              `Type: Pathway<br>Name: ${type}<br>Size: ${size}`;
            } else {
              txt += 
              `Type: ${type}<br>Size: ${size}`;
            }

            tooltip.innerHTML = txt;
          }
          
          document.body.appendChild(tooltip);
          tooltip.classList.add('target-popper');
          return tooltip;
        }
      });
  
      target.on('position', () => {
        popper.update();
      });

      target.cy().on('pan zoom resize', ()=>{
        popper.update();
      })
  
  
      target.on('mouseover', () => {
        var existing = document.getElementById(tooltipId)
        if (existing) {
          existing.classList.add('active');
        }
      }).on('mouseout', () => {
        var existing = document.getElementById(tooltipId)
        if (existing) {
          existing.classList.remove('active');
        }
      })
    }
  
    const expand_collapse = (event: React.SyntheticEvent | Event, v: number | number[]) => {
      if(requestRef.current){
        requestRef.current.abort();
      }
      const controller = new AbortController();
      requestRef.current = controller;
      if(typeof(v)=='number'){
        setSliderValue(v);
      }

      if(!data){
        return;
      }
      const levels = data['levels']
      const nodes_to_collapse = []
      const groups = data['groups']
      for(let i=0; i<levels.length; i++){
        const node = levels[i][0]
        
        if(levels[i][1]>v){
          nodes_to_collapse.push([node, groups[node]['data']['children']])
        } 
      }

      fetch(
        `${BASE_URL}/simplify`,{
          method: 'POST',

          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "nodes": nodes,
            "edges": data['edges'],
            "groups": nodes_to_collapse,
          }),
          signal: controller.signal,
        },
        
      )
      .then((res) => res.json())
      .then((res) => {
        res.forEach((motif: any)=>{
          
          if(motif['group'] == 'nodes' && motif['classes'] == 'groupIcon'){
            const key = motif['data']['id']
            motif['data']['type'] = groups[key]['data']['type']
          }

        })
        setCur(res)
        requestRef.current = null;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
      
      
    }

    
    return (
      <>
        <div className="fleft">
        <div className="menu-container">
          <IconButton 
            onClick={()=>{setOpenLegend(true)}}
            color="primary">
              <HelpOutlineIcon />
          </IconButton>
          {/* {
          genePairs != undefined && genePairs.length>0? 
          <Button onClick={() => {setShowGenePairs(true)}}>Check Gene Pairs</Button>
          :<></>
          } */}
          <Box style={{marginTop: '2'}}>
            <TextField 
            label="Start" 
            size="small"
            value={startNode}
            onChange={(event)=>{setStartNode(event.target.value)}}
            variant="outlined" />
            <TextField 
            label="End"
            size="small"
            value={endNode}
            onChange={(event)=>{setEndNode(event.target.value)}}
            variant="outlined" />
            <Button id="find_path" onClick={find_path}>Show Path</Button>
          </Box>
          <Box>
         
          </Box>
          <Paper style={{maxHeight: 700, overflow: 'auto', marginTop: '2'}}>
            <GeneAttribute attr={attr}/>
          </Paper>
          
          
        </div>
      </div>
        <div className="fright" id="cy" ref={ref}></div>
        <div className="slide">
          <Slider 
          defaultValue={1} 
          value={sliderValue}
          min={0} 
          max={1} 
          marks={marks} 
          step={0.05} 
          aria-label="Default" 
          valueLabelDisplay="auto"
          onChangeCommitted={expand_collapse} />
        </div>
        <GroupExpandModal
        open={open}
        onClose={()=>{setOpen(false)}}
        elements={subgraph} />
        <Legend
        open={openLegend}
        onClose={()=>{setOpenLegend(false)}}/>
        <GenePairTable
        open= {showGenePairs}
        onClose={()=>setShowGenePairs(false)}
        genePairs={genePairs}
        onRowClick={(g1, g2)=>{setStartNode(g1); setEndNode(g2); find_path()}}/>
      </>
        
    )
}

export default Subnet;