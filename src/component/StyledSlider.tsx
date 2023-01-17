import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: '#3a8589',
  height: 3,
  padding: '13px 0',

  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
    '& .styled-bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: theme.palette.text.primary,
    '&:before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    },
  },
  '& .MuiSlider-track': {
    height: 2,
    backgroundImage: "linear-gradient(.25turn, #008bec 0%, #eeee22 49%, #F0000D 100%)"
  },
  '& .MuiSlider-rail': {
    color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#d8d8d8',
    backgroundImage: "linear-gradient(.25turn, #008bec 0%, #eeee22 49%, #F0000D 100%)",
    opacity: theme.palette.mode === 'dark' ? undefined : 1,
    height: 2,
  },
}));

export default StyledSlider;
