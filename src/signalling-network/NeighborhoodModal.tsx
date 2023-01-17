import { useSigma } from "react-sigma-v2";
import { FC, useEffect, useMemo, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, TextField } from "@mui/material";
import subgraph from 'graphology-operators/subgraph';

const Neighborhood: FC<{
    open: boolean, 
    onClose: ()=>void,
}> = ({open, onClose}) => {

    const sigma = useSigma()
    const graph = sigma.getGraph()

    const [nodes, setNodes] = useState('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNodes(event.target.value);
    };

    const get_subgraph = () => {
        // console.log(nodes.split('\n'))
        const target = new Set<string>()
        
        for(let node of nodes.split('\n')){
            target.add(node)
            graph.neighbors(node).forEach((x) => target.add(x))
        }
        const target_list: string[] = []
        target.forEach((v) => {
            target_list.push(v)
        })
        const sub = subgraph(graph, target_list)
        console.log(sub.export())
    }
    return (
        
        <Dialog 
        onClose={onClose} 
        open={open}
        maxWidth={'md'}>
            
            <DialogContent>
                <DialogContentText>
                Input node(s) to view the neighborhood.
                </DialogContentText>
                <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    m: 'auto',
                    width: 'fit-content',
                }}>
                    <FormControl sx={{ mt: 2 }}>
                         
                        <TextField 
                        fullWidth
                        multiline
                        label="Nodes"
                        value={nodes}
                        onChange={handleChange}
                        rows={8} />
                        
                    </FormControl>
                    <DialogActions>
                        <Button type="submit" onClick={get_subgraph}>View Neighborhood</Button>
                    </DialogActions>
                </Box>
                
            </DialogContent>
            

        </Dialog>
        

    )
}

export default Neighborhood