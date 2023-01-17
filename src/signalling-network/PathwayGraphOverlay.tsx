import { Link } from 'react-router-dom';
import { Menu, MenuItem } from '@mui/material';
import React, {  FC, useEffect, useState } from 'react';
import PathwayNetwork from '../pathway-network/PathwayNetwork';

const PathwayGraphOverlay: FC<{
    anchorEl:Element,
    show: boolean,
    openDialog: () => void, 
    onClose: ()=>void}
> = ({anchorEl, show,openDialog, onClose}) => {
    return (
        <Menu
        open={show}
        onClose={onClose}
        anchorEl = {anchorEl}>
            <MenuItem>  
                <Link to="/pathway-network" target = '_blank' >
                    Pathway Network
                </Link>     
                
            </MenuItem>
            <MenuItem onClick = {()=>{openDialog()}}>Pathway Circle Pack</MenuItem>
        </Menu>
    );
}

export default PathwayGraphOverlay;