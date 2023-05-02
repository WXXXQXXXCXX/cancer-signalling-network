import { useSigma } from "react-sigma-v2";
import React, { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField } from "@mui/material";
import subgraph from 'graphology-operators/subgraph';
import { NODE_FADE_COLOR } from "./consts";
import { GetNodeAttributeByEntrezName, GetPathwayOfGene, GroupNodesByPathway } from "../db/db_conn";
import { TabContext, TabPanel } from "@mui/lab";

const BASE_URL = 'http://localhost:3000'
const Neighborhood: FC<{
    open: boolean, 
    onClose: ()=>void,
    setGenePairs: (pairs: any[]) => void,
    setSetSize: (k: number) => any
}> = ({open, onClose, setGenePairs, setSetSize}) => {

    const sigma = useSigma()
    const graph = sigma.getGraph()


    const [nodes, setNodes] = useState('');
    const [method, setMethod] = useState('');
    const [tabVal, setTabVal] = useState('nodes');
    const [fileData, setFileData] = useState<string[]>([]);
    const [cancerType, setCancerType] = useState('');
    const [k, setK] = useState(2);
    const [m, setM] = useState(10);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {     
        setNodes(event.target.value); 
    };

    const handleMethodChange = (event: SelectChangeEvent) => {
        setMethod(event.target.value)
    }

    const handleTabChange = (event: React.SyntheticEvent, v: string) => {
        setTabVal(v)
    }

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
          }
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt: ProgressEvent<FileReader>) => {
            if(evt.target == undefined || evt.target.result == undefined){
                return;
            }
            const txt = String(evt.target.result).split('\n');
            setFileData(txt);
            console.log(txt);
        };
        reader.readAsText(file);
    }
    const get_subgraph = () => {
        
        var target_list: string[] = []
        if(method == 'neighbor'){
            const target = new Set<string>();
            for(let node of nodes.split('\n')){
                target.add(node);
                graph.neighbors(node).forEach((x) => target.add(x));
            }
            target.forEach((v) => {
                target_list.push(v);
            })
        } else if(method == 'current'){
            target_list = graph.filterNodes((node, attr) => attr.color != NODE_FADE_COLOR);
        } else if(method == 'exact'){
            target_list = nodes.split('\n');
        } else if(tabVal == 'pairs'){
            target_list = nodes.split(',').filter((node) => graph.hasNode(node));
        }
        
        const sub = subgraph(graph, target_list)
        // const single_nodes = sub.filterNodes((node, attr)=> sub.degree(node) == 0)
        // single_nodes.forEach((node) => {
        //     sub.dropNode(node)
        // })
        
        var target_nodes = sub.export()
        GroupNodesByPathway(target_list, (res) => {
            window.localStorage.setItem('pathways', JSON.stringify(res));
            window.localStorage.setItem('target_nodes', JSON.stringify(target_nodes));
            window.open("/subnet", '_blank');
            window.dispatchEvent(new Event("target_nodes"))
            
        })

        
        

    }

    useEffect(() => {

        if(!open){
            return;
        }
        const nodes = graph.nodes()
        for(let i=0; i<1; i++){
            const name = nodes[i]
            GetPathwayOfGene(name, (x)=>{})
        }
    }, [open])

    const get_gene_pairs = () => {

        fetch(
            `${BASE_URL}/pairs`,{
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({'k': k, 'm': m, 'oncogenes': fileData, 'cancer_type': cancerType})
            }
          )
          .then((res) => res.json())
          .then((res) => {
            const pairs = res['gene_pairs'];
            console.log(pairs);
            setGenePairs(pairs);
            setSetSize(k)
          })
        
    }

    return (
        
        <Dialog 
        onClose={onClose} 
        open={open}
        maxWidth={'md'}>    
            <DialogContent>
                <TabContext value={tabVal}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabVal} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="View selected nodes" value='nodes'/>
                        <Tab label="Target Set Prediction" value='pairs' />
                    </Tabs>
                    </Box>
                    <TabPanel value='nodes'>
                        <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: '300px',
                        }}>
                            
                            <FormControl variant="standard" sx={{ m: 1, width: 200 }}>
                            <InputLabel id="demo-simple-select-standard-label">Select By</InputLabel>
                            <Select 
                            value={method} 
                            onChange={handleMethodChange} 
                            label="Property"
                            autoWidth>
                                <MenuItem value={"exact"}>Nodes</MenuItem>
                                <MenuItem value={"neighbor"}>Neighborhood of Nodes</MenuItem>
                                <MenuItem value={"current"}>Currently Selected</MenuItem>
                            </Select>
                            </FormControl>
                            <FormControl sx={{ mt: 2 }}> 
                                <TextField 
                                fullWidth
                                multiline
                                label="Nodes"
                                value={nodes}
                                onChange={handleChange}
                                rows={8} />
                            </FormControl>
                            <Button type="submit" onClick={get_subgraph}>View Neighborhood</Button>
                        </Box>
                    </TabPanel> 
                    <TabPanel value='pairs'>
                        <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: '300px',
                        }}>
                            
                            <TextField
                            sx={{'mb': 2}}
                            label="Size of Gene Set"
                            type="number"
                            value={k}
                            inputProps={{ inputMode: 'numeric', pattern: '[2-7]' }}
                            onChange={(e) => setK(Number(e.target.value))}
                            InputLabelProps={{ shrink: true }}
                            />
                        
                            <TextField
                                sx={{'mb': 2}}
                                label="Top M Sets"
                                type="number"
                                value={m}
                                inputProps={{ inputMode: 'numeric', pattern: '[1-9][0-9]*' }}
                                onChange={(e) => setM(Number(e.target.value))}
                                InputLabelProps={{ shrink: true }}
                                />
                            <FormControl fullWidth>
                                <InputLabel>Cancer Type</InputLabel>
                                <Select
                                value = {cancerType}
                                label="Cancer Type"
                                onChange={(e) => {setCancerType(e.target.value)}}
                                >
                                    <MenuItem value={'prostate'}>Prostate Cancer</MenuItem>
                                    <MenuItem value={'breast'}>Breast Cancer</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" component="label" sx={{'mb': 2}}>
                                Upload File
                                <input type="file" accept='.csv' hidden onChange={handleFileUpload}/>
                            </Button>
                            <Button onClick={get_gene_pairs}>Read Pre-computed Gene Sets</Button>
                            <Button onClick={get_gene_pairs}>Re-generate Gene Sets</Button>
                        </Box>
                    </TabPanel> 
                </TabContext>  
            </DialogContent>
            

        </Dialog>
        

    )
}

export default Neighborhood