import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { hallmarks, hallmarks_color, NEG_COLOR, PHY_COLOR, POS_COLOR } from './consts';

const hm = new RegExp('^hallmark.*$');
const Legend:React.FC<{viewBy: string[]}> = ({viewBy}) => {
    
    const children:JSX.Element = React.useMemo(() => {
        var children = <></>
        var show_hm = false;
        viewBy.forEach((x) => {
            if(hm.test(x)){
                show_hm = true;
                
            }
        })
        if(!show_hm){
            children = 
            <Stack direction='column'>
            <Stack direction="row" alignItems="center" gap={1}>
              <CircleIcon htmlColor={POS_COLOR}/>
              <Typography>Positive Edge</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <CircleIcon htmlColor={NEG_COLOR}/>
              <Typography>Negative Edge</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <CircleIcon htmlColor={PHY_COLOR}/>
              <Typography>Physical Edge</Typography>
            </Stack>
            </Stack>
        } else{
            const legends = [];
            for(let i=0; i<10; i++){
                legends.push(<Stack direction="row" alignItems="center" gap={1}>
                <CircleIcon htmlColor={hallmarks_color[i]}/>
                <Typography>{hallmarks[i]}</Typography>
              </Stack>)
            }
            children = 
            <Stack direction='column'>
            {legends}
            </Stack>
        }
        return children
    }, [viewBy])
    return (
        children
    )
}

export default Legend;