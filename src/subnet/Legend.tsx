import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { FC } from "react";


export const Legend:FC<{
    open: boolean,
    onClose: () => void

}> = ({open, onClose}) => {

    return (
        <Dialog
        open = {open}
        onClose = {onClose}>
            <DialogTitle>
                {"Graph Legends"}
            </DialogTitle>
            <DialogContent>
                
                <DialogContentText>
                    Triangle: Fans - A group of nodes that share a common and only neighbor<br /><br />
                    Hexagon: Cliques - A group of nodes that are <br /><br />
                    Diamond: Connectors - A group of nodes in which each pair is connected by at least one link<br /><br />
                    Vee Shape: Pathways<br /><br />
                </DialogContentText>
            </DialogContent>
            
        </Dialog>
    )
}

export default Legend