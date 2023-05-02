import { Dialog, DialogContentText, DialogTitle, 
    Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TablePagination,
    Paper,
    Checkbox} from "@mui/material";
import { FC, useEffect, useState } from "react";
import Panel from "./Panel";

const GeneTargetsTable:FC<{
    geneSets: any[], 
    k: number,
    onRowClick: (rows: number[]) => void 
}> = ({geneSets, k, onRowClick}) => {

    const [tablePage, setTablePage] = useState(0);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [columnNames, setColumnNames] = useState<string[]>([]);

    useEffect(() => {
        const ans = []
        for(let i=0; i<k; i++){
            ans.push(`Gene ${i+1}`)
        }
        console.log('column names: ', ans)
        setColumnNames(ans);
    }, [k, geneSets]);

    const rowSelected = (idx: number) => {
        return selectedRows.indexOf(idx) !== -1;
    }

    const handleRowSelect = (event: React.MouseEvent<unknown>, idx: number) => {
        const selectedIdx = selectedRows.indexOf(idx);
        var newSelectedRows: number[] = [...selectedRows];
        if(selectedIdx == -1){
            newSelectedRows.push(idx);
        } else{
            newSelectedRows = newSelectedRows.filter((x, id)=>x!=idx)
        }
        setSelectedRows(newSelectedRows);
        console.log('handleRowSelect: ', newSelectedRows);
        onRowClick(newSelectedRows);
    }

    return (
        <Panel
        initiallyDeployed
        title={
            <>
            Target Gene Sets
            </>
        }>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto'}}>
                <Table size="small" sx={{minWidth: 400, width: `${k*110+140}px`}}>
                    <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            disabled
                        />
                        </TableCell>
                        {columnNames.map((name) => (
                            <TableCell align="left" style={{minWidth: 110, fontSize: '0.7rem'}}>{name}</TableCell>
                        ))}
                        <TableCell align="right" style={{minWidth: 70, fontSize: '0.7rem'}}>PDist with oncogenes</TableCell>
                        <TableCell align="right" style={{minWidth: 70, fontSize: '0.7rem'}}>Distance</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {geneSets.map((pair, idx) => {
                        const isSelected = rowSelected(idx);
                        return(
                            <TableRow
                            key={idx}
                            hover
                            selected={isSelected}
                            aria-checked={isSelected}
                            onClick = {(event) => handleRowSelect(event, idx)}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, fontSize: '0.7rem' }}
                            >
                                <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={isSelected}
                                    inputProps={{
                                        'aria-labelledby': String(idx),
                                    }}
                                />
                                </TableCell>
                                {columnNames.map((name, id) => (
                                    <TableCell align="left" sx={{fontSize: '0.7rem'}}>{pair[id]}</TableCell>
                                ))}
                                <TableCell align="right" sx={{fontSize: '0.7rem'}}>{pair[k]}</TableCell>
                                <TableCell align="right" sx={{fontSize: '0.7rem'}}>{pair[k+1]}</TableCell>
                            </TableRow>
                        )
                    })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
            component="div"
            count={geneSets.length}
            rowsPerPage={10}
            page={tablePage}
            onPageChange={(e: any, n: number) => {setTablePage(n)}}
            />
            
        </Panel>
    )
}

export default GeneTargetsTable