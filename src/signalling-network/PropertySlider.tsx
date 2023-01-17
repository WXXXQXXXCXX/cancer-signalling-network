import * as React from 'react';
import Slider from '@mui/material/Slider';
import StyledSlider from '../component/StyledSlider';
import { assert } from 'console';
import { useSigma } from 'react-sigma-v2';
import { Box } from '@mui/material';

const PropertySlider: React.FC<{
    statType: string,
    setFilter: (filter: {min: number, max: number, filter_on: string})=>void}>= ({statType, setFilter}) => {

    const sigma = useSigma();
    const graph = sigma.getGraph();

    const [min,max, step] = React.useMemo(()=>{
        if(statType==undefined || statType == ""){
            return [0,100,1];
        }
        const scores = graph.nodes().map((node) => {
            const val = graph.getNodeAttribute(node, statType);
            if(!val) return 0;
            return val;
          });
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const scale = (max-min)/100;
        console.log(min,max);
        return [min, max, scale];
    },[statType])
   
    
    return(
        <Box sx={{ 
            width: 300,
            left: '100px',
            position: 'absolute',
            bottom: '10px'
        }}>
            <StyledSlider 
            disabled = {statType==''||statType==undefined}
            orientation="horizontal"
            valueLabelDisplay='auto'
            sx={{width: 800}}
            onChange = {(e:Event, value: number|number[], activeThumb: number)=>{
                if(typeof value == 'number'){
                    return;
                }
                setFilter({
                    min: value[0],
                    max: value[1],
                    filter_on: statType,
                })
            }}
            min = {min}
            max = {max}
            step = {step}
            marks
            defaultValue={[min,max]}
            />
        </Box>
    )
}

export default PropertySlider;