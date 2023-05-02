import { Dialog } from "@mui/material";
import { FC, useEffect, useRef } from "react";
import { node_html } from "./NodeStyle";
var cytoscape = require('cytoscape');

var nodeHtmlLabel = require("cytoscape-node-html-label");
nodeHtmlLabel( cytoscape );

const GroupExpandModal: FC<{
    onClose: () => void,
    open: boolean,
    elements: any[],
}> = ({onClose, open, elements}) => {

    const cyRef = useRef(null);

    useEffect(() => {
        if (open && elements && elements.length > 0 && cyRef.current!=undefined) {
            console.log(elements)
          const cy = cytoscape({
            container: document.getElementById('cy_sub'),
            minZoom: 0.4,
            maxZoom: 3,
            elements: elements,
            layout: {
              name: 'cose',
              animate: false,
              nodeDimensionsIncludeLabels: true,
              idealEdgeLength: 20,
              nodeRepulsion: 1000000,
              //randomize: true,
              gravity: 40,
              edgeElasticity: 70,
              nodeSeparation: 600,
            },
            style: [
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
            ]
          });
          cy.nodeHtmlLabel(node_html());

        }
    }, [open, elements, cyRef]);

    return (
        <Dialog
        open={open}
        onClose={onClose}
        maxWidth={'lg'}
        >
            <div id="cy_sub" style={{ width: '1300px', height: '1000px' }} ref={cyRef} />
        </Dialog>
    )
}

export default GroupExpandModal