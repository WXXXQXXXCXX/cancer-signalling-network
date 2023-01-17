import { formLabelClasses, Popover, TableContainer, TableRow, Typography } from "@mui/material";
import { FC, useEffect, useState, useMemo} from "react";
import { useSigma } from "react-sigma-v2";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { hallmarks, NODE_FADE_COLOR } from "./consts";

const GraphOverview:FC<{    
    anchorEl: HTMLButtonElement|null
    onClose:()=>void,
    viewBy:string[],
    edgeType: string,
    statFilter: any,
    statType: string,
    update: number
}>=({anchorEl, onClose, viewBy, edgeType, statFilter, statType, update}) => {

    const sigma = useSigma();
    const graph = sigma.getGraph();

    const createRow = (name: string, value: any) => {
        return {name, value};
    }

    const content:any[] = useMemo(()=>{
        console.log(edgeType, viewBy, statType, statFilter);
        const node_count = graph.filterNodes((node, attr)=>!attr.hidden && attr.color!=NODE_FADE_COLOR).length;
        const edge_count = graph.filterEdges((edge, attributes)=>{ return !attributes.hidden}).length;
        const pos_edge_count = graph.filterDirectedEdges(
            (edge, attributes)=>attributes.hidden==false&&attributes.category=='POS').length;
        const neg_edge_count = graph.filterDirectedEdges(
            (edge, attributes)=>attributes.hidden==false&&attributes.category=='NEG').length;
        const phy_edge_count = graph.filterUndirectedEdges((edge, attributes)=>!attributes.hidden).length;
        const children = [
            createRow('total #edges', edge_count),
            createRow('#positive links', pos_edge_count),
            createRow('#negative links', neg_edge_count),
            createRow('#physical links', phy_edge_count),
            createRow('total #node', node_count),
        ];
        
        if(!viewBy?.includes('all')){
            const tags = [];
            for(let i=0; i<viewBy?.length; i++){
                const tag = viewBy[i];
                switch (tag){
                    case 'cancer_gene':
                        const cancer_count = graph.filterNodes(
                            (node, attr)=>!attr.hidden&&attr.tag?.includes('cancer_gene')
                        ).length;
                        children.push(createRow('#cancer gene', cancer_count));
                        break;
                    case 'drug_targets':
                        const drug_count = graph.filterNodes(
                            (node, attr)=>!attr.hidden&&attr.tag?.includes('drug_targets')
                        ).length;
                        children.push(createRow('#drug targets', drug_count));
                        break;
                    default:
                        if(tag.substring(0,9)=='hallmark_'){
                            const idx:number = parseInt(tag.split('_')[1]);
                            const count = graph.filterNodes(
                                (node, attr)=>!attr.hidden &&(attr.hallmark & 2<<idx)!=0
                            ).length;
                            
                            children.push(createRow(hallmarks[idx], count));
                        } else{
                            const count = graph.filterNodes(
                                (node, attr)=>!attr.hidden&&attr.tag?.includes(tag)
                            ).length;
                            children.push(createRow(tag, count));
                        }
                        
                }
            }
            
        }
        if(statFilter != undefined){
            const stat = statFilter.filter_on.substring(1).split('_').join(' ');
            var min = statFilter.min;
            var max = statFilter.max;
            if (min<1) {
                min = Number.parseFloat(min).toExponential(3)
            }
            if (max<1) {
                max = Number.parseFloat(max).toExponential(3)
            }
            children.push(createRow('Property filter', `${stat} in [ ${min}, ${max} ]`))
        }
        if(statType!=undefined){
            children.push(
                createRow('color/size', statType.substring(1).split('_').join(' '))
            )
        }
        return children;
        
    }, [update])
    return (
        <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        >
            <TableContainer component={Paper}>
            <Table sx={{ maxWidth: 500 }} aria-label="simple table">
                
                <TableBody>
                {content.map((row) => (
                    <TableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell component="th" scope="row"  width="30%">
                        {row.name}
                    </TableCell>
                    <TableCell align="right"  width="70%">{row.value}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        </Popover>
    )
}

export default GraphOverview;