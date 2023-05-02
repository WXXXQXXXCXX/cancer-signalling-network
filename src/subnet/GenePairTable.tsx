import { Dialog, DialogContentText, DialogTitle, 
    Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TablePagination,
    Paper} from "@mui/material";
import { FC, useState } from "react";


const GenePairTable: FC<{
    open: boolean, 
    onClose: () => void,
    genePairs: any[],
    onRowClick: (g1: string, g2:string) => void
}> = ({open, onClose, genePairs, onRowClick}) => {

    const [tablePage, setTablePage] = useState(0);

    return (
        <Dialog
        open = {open}
        onClose = {onClose}>
            <DialogTitle>Gene Pairs</DialogTitle>
            <DialogContentText>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 300 }} size="small">
                    <TableHead>
                    <TableRow>
                        <TableCell>Gene 1</TableCell>
                        <TableCell align="right">Gene 2</TableCell>
                        <TableCell align="right">Similarity</TableCell>
                        <TableCell align="right">Distance</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {genePairs.map((pair, idx) => (
                        <TableRow
                        key={idx}
                        hover
                        onClick = {() => {
                            onRowClick(pair[0], pair[1]);
                            onClose()
                        }}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell component="th" scope="row">{pair[0]}</TableCell >
                        <TableCell align="left">{pair[1]}</TableCell>
                        <TableCell align="left">{pair[2]}</TableCell>
                        <TableCell align="left">{pair[3]}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
            component="div"
            count={genePairs.length}
            rowsPerPage={10}
            page={tablePage}
            onPageChange={(e: any, n: number) => {setTablePage(n)}}
            />
            </DialogContentText>
        </Dialog>
    )
}

export default GenePairTable;