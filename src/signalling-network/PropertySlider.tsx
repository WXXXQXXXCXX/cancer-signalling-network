import * as React from 'react';
import Slider from '@mui/material/Slider';
import StyledSlider from '../component/StyledSlider';
import { assert } from 'console';
import { useSigma } from 'react-sigma-v2';
import { Box } from '@mui/material';
import { GetStatBound } from '../db/db_conn';

const PropertySlider: React.FC<{
    statType: string,
    setFilter: (filter: {min: number, max: number, filter_on: string})=>void}>= ({statType, setFilter}) => {

    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [min, setMin] = React.useState(0);
    const [max, setMax] = React.useState(1);
    const [step, setStep] = React.useState(0.1);
    const [vmin, setVMin] = React.useState(0);
    const [vmax, setVMax] = React.useState(1);

    React.useEffect(()=>{
        GetStatBound(
            statType,
            (min, max) => {
                console.log("min and max for slider: ",min, max);
                const scale = (max-min)/100;
                setMin(min);
                setMax(max);
                setVMax(max);
                setVMin(min);
                setStep(scale);
            })
    }, [statType])

   
    
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
                setVMax(value[1]);
                setVMin(value[0]);
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
            value = {[vmin, vmax]}
            />
        </Box>
    )
}

export default PropertySlider;