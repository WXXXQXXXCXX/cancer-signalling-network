import { Dialog, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { FC, useMemo, useState } from "react";
import { AgChartsReact } from 'ag-charts-react';
import { useSigma } from "react-sigma-v2";
import { SCALE_LINEAR, SCALE_LOG } from "./consts";

const BIN = 30;
const DiagramModal: FC<{
    open: boolean, 
    onClose: ()=>void,
    setFilter: (filter: any)=>void,
}> = ({open, onClose, setFilter}) => {
    
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [attributeName, setAttributeName] = useState("");
    const [graphType, setGraphType] = useState("");
    const [scale, setScale] = useState(SCALE_LINEAR);
    const [interval, setInterval] = useState(0);
    const shouldIncreaseScale =() => {
      return !(attributeName == 'In_Degree' ||
      attributeName == 'Out_Degree' ||
      attributeName == 'Degree' ||
      attributeName == 'PDist')
    }
    const data = useMemo(()=>{
        var data:any[] = [];
        
        if(!shouldIncreaseScale()){
          graph.forEachNode((node, attr) => {
            const val = Reflect.get(attr, graphType+attributeName);
            if (val!=undefined){
              data.push( Reflect.get(attr, graphType+attributeName))
            }

          })
        } else{
          graph.forEachNode((node, attr) => {
            const val = Reflect.get(attr, graphType+attributeName);
            if (val!=undefined){
              data.push(Reflect.get(attr, graphType+attributeName)*1000)
            }

          })
        }
          
        data = data.sort((a, b) => a - b);
        const max: number = data[data.length - 1];
        const min: number = data[0];
        const itv = (max - min)/BIN;
        console.log(max, min, BIN, (max-min),(max-min)/BIN);
        setInterval(itv);

        const res: any[] = [];
        for(let i=0; i<BIN; i++){
          res.push({key: min+itv*i, value: 0});
        }

        for(let i=0; i<data.length; i++){
          const b = Math.floor((data[i] - min)/itv);

          res[Math.min(b, BIN-1)].value ++;
        }
        if(scale == SCALE_LOG){
          for(let i=0; i<res.length; i++){
            res[i].value = Math.log2(res[i].value);
          }
        }
        console.log(res);
        return res;
    }, [graph, attributeName, graphType, scale]);

    const onGraphTypeChange = (event: SelectChangeEvent) => {
      var attr = "";
      if(event.target.value.length==1){
        attr = event.target.value+attributeName;
        setGraphType(event.target.value);
      } else {
        attr =graphType+event.target.value;
        setAttributeName(event.target.value);
      }
    }
    const state = {
        options: {
          title: {
            text: attributeName,
          },
          data: data,
          series: [
            {
              type: 'column',
              xKey: 'key',
              xName: attributeName,
              yKey: 'value',
              listeners: {
                nodeClick:  (event: any) => {
                  console.log(event);
                  var min = event.datum.key;
                  var max = min + interval;
                  // var min = domain[0]
                  if(shouldIncreaseScale()){
                    max = max/1000;
                    min = min/1000;
                  }
                  console.log(min, max);
                  setFilter({min: min, max: max, filter_on: graphType+attributeName})
                  onClose();
                },
              },
            },
          ],
          legend: {
            enabled: false,
          },
          axes: [
            {
              type: 'number',
              position: 'bottom',
              title: { text: !shouldIncreaseScale()?attributeName:attributeName+' (e-3)' },
            },
            {
              type: 'number',
              
              position: 'left',
              title: { text: "Count" },
            },
          ],
        },
      };
    
    return (
        <Dialog  sx={{maxWidth: 1500}} onClose={onClose} open={open}>
            <DialogTitle>Graph Statistics</DialogTitle>
            <div id='graph-selector'>
              <FormControl variant="standard" sx={{ m: 1, width: 200 }}>
                <InputLabel id="demo-simple-select-standard-label">Property</InputLabel>
                <Select 
                value={attributeName} 
                onChange={onGraphTypeChange} 
                label="Property"
                autoWidth>
                  <MenuItem value="">
                      <em>None</em>
                  </MenuItem>
                  <MenuItem value={"In_Degree"}>In Degree</MenuItem>
                  <MenuItem value={"Out_Degree"}>Out Degree</MenuItem>
                  <MenuItem value={"Degree"}>Degree</MenuItem>
                  <MenuItem value={"Degree_Centrality"}>Degree Centrality</MenuItem>
                  <MenuItem value={"Closeness_Centrality"}>Closeness Centrality</MenuItem>
                  <MenuItem value={"Betweenness_Centrality"}>Betweenness Centrality</MenuItem>
                  <MenuItem value={"Eigenvector_Centrality"}>Eigenvector Centrality</MenuItem>
                  <MenuItem value={"Pagerank"}>Pagerank</MenuItem>
                  <MenuItem value={"PDist"}>PDist</MenuItem>
                </Select>
                </FormControl>

                <FormControl variant="standard" sx={{ m: 1, width: 200 }}>
                  <InputLabel id="demo-simple-select-standard-label">Graph Type</InputLabel>
                  <Select 
                  value={graphType} 
                  onChange={onGraphTypeChange} 
                  label="Property"
                  autoWidth>
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={"a"}>All</MenuItem>
                    <MenuItem value={"p"}>Physical Link</MenuItem>
                  </Select>
              </FormControl>
              <FormControl variant="standard" sx={{ m: 1, width: 200 }}>
                  <InputLabel id="demo-simple-select-standard-label">Scale</InputLabel>
                  <Select 
                  value={graphType} 
                  onChange={(e)=>{setScale(Number(e.target.value))}} 
                  label="Property"
                  autoWidth>
                    <MenuItem value={SCALE_LINEAR}>linear</MenuItem>
                    <MenuItem value={SCALE_LOG}>log</MenuItem>
                  </Select>
              </FormControl>

            </div>
            
              <div className="ag-material" style={{width: 600, height: 500}}>
                  <AgChartsReact options={state.options} />
              </div>
            
        </Dialog>
    );
}

export default DiagramModal;