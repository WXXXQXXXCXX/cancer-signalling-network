import React, { FC, useEffect} from 'react';
import data from './data.json'
import { node_html } from './NodeStyle';
var cytoscape = require('cytoscape');
var expandCollapse = require('cytoscape-expand-collapse');
expandCollapse( cytoscape ); 

let fcose = require('cytoscape-fcose');
cytoscape.use( fcose );

var undoRedo = require('cytoscape-undo-redo');
undoRedo( cytoscape );

var nodeHtmlLabel = require("cytoscape-node-html-label");
nodeHtmlLabel( cytoscape );

const Subnet: FC = () => {
    const ref = React.useRef(null)

    useEffect(() => {
      function checkPathway() {
        const item = window.localStorage.getItem('target_nodes')
        console.log(item)
        
      }
    
      window.addEventListener('storage', checkPathway)
    
      return () => {
        window.removeEventListener('storage', checkPathway)
      }
    },[])

    useEffect(()=>{
        var cy = cytoscape({
            container: ref.current,
            ready: function(){
              var api = this.expandCollapse({
                layoutBy: {
                  name: "fcose",
                  animate: false,
                  randomize: false,
                  fit: true
                },
                fisheye: true,
                animate: true
             });

             api.collapseAll()
            },
            layout: {
                name: 'fcose'
            },
            style: [
              {
                selector: 'node',
                style: {
                  "width": "28px",
                  "height": "28px",
                  "background-opacity": 1
                }
              },
              {
                selector: ':parent',
                style: {

                  "text-valign": "top",
                  "text-halign": "center"
                }
              },
              {
                  selector: "node.cy-expand-collapse-collapsed-node",
                  style: {
                    "width": "38px",
                    "height": "38px",
                    "background-opacity": 0,
                    
                  }
              },
              
              {
                selector: 'edge',
                style: {
                  'width': 3,
                  'line-color': '#ad1a66',
                  'curve-style': 'straight'
                }
              },
              {
                selector: 'edge.meta',
                style: {
                  'width': 2,
                  'line-color': 'red'
                }
              },
              {
                selector: ':selected',
                style: {
                  'overlay-color': "#6c757d",
                  'overlay-opacity': 0.3,
                  'background-color': "#999999"
                }
              }
            ],
            elements: data['data']
              
        })

        cy.nodeHtmlLabel(node_html)
    }, [])


    

    return (
        <div className="fright" id="cy" ref={ref} style={{height: '90%', width: '95%', }} ></div>
    )
}

export default Subnet;