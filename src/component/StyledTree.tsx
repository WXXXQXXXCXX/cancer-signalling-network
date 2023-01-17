import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { TreeItemProps, treeItemClasses, useTreeItem,
  TreeItemContentProps } from '@mui/lab/TreeItem';
import Collapse from '@mui/material/Collapse';
// web.cjs is required for IE11 support
import { useSpring, animated } from 'react-spring';
import { TransitionProps } from '@mui/material/transitions';
import PanoramaFishEyeRoundedIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';

const CustomContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps,
    ref,
  ) {
    const {
      classes,
      className,
      label,
      nodeId,
      icon: iconProp,
      expansionIcon,
      displayIcon,
    } = props;
  
    const {
      disabled,
      expanded,
      selected,
      focused,
      handleExpansion,
      handleSelection,
      preventSelection,
    } = useTreeItem(nodeId);
  
    const icon = iconProp || expansionIcon || displayIcon;
  
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      preventSelection(event);
    };
  
    const handleExpansionClick = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
      handleExpansion(event);
    };
  
    const handleSelectionClick = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
      handleSelection(event);
    };
  
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={clsx(className, classes.root, {
          [classes.expanded]: expanded,
          [classes.selected]: selected,
          [classes.focused]: focused,
          [classes.disabled]: disabled,
        })}
        onMouseDown={handleMouseDown}
        ref={ref as React.Ref<HTMLDivElement>}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography
          onClick={handleSelectionClick}
          component="div"
          className={classes.label}
        >
          {label}
        </Typography>
      </div>
    );
  });
  
export function MinusSquare(props: SvgIconProps) {
    return (
      <HighlightOffRoundedIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props} />
  
    );
  }
  
export function PlusSquare(props: SvgIconProps) {
    return (
      <AddCircleOutlineRoundedIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props} />
      
    );
  }
  
export function CloseSquare(props: SvgIconProps) {
    return (
      <PanoramaFishEyeRoundedIcon
        className="close"
        fontSize="inherit"
        style={{ width: 14, height: 14 }}
        {...props}
      />
      
  
    );
  }
  
  function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
      from: {
        opacity: 0,
        transform: 'translate3d(20px,0,0)',
      },
      to: {
        opacity: props.in ? 1 : 0,
        transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
      },
    });
  
    return (
      <animated.div style={style}>
        <Collapse {...props} />
      </animated.div>
    );
  }
  
export const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} 
    TransitionComponent={TransitionComponent} 
    // ContentComponent={CustomContent}
    />
  ))(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
      '& .close': {
        opacity: 0.3,
      },
    },
    [`& .${treeItemClasses.group}`]: {
      marginLeft: 14,
      paddingLeft: 8,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
  }));