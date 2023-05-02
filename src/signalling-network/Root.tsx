import React, { FC, Profiler, useEffect, useState } from "react";
import { SigmaContainer, ZoomControl } from "react-sigma-v2";
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";
import Attributes from "./Attributes";
import { FiltersState, GraphOps, NodeAttributes, Pathway } from "../types";
import SearchField from "./SearchField";
import drawLabel from "../canvas-utils";
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import "react-sigma-v2/lib/react-sigma-v2.css";
import { BiRadioCircleMarked, BiBookContent } from "react-icons/bi";
import { VscGraphLine } from "react-icons/vsc"
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import NodeOverlay from "./NodeOverlay";
import GenePathway from "./GenePathway";
import ViewSetting from "./ViewSetting";
import { Backdrop, CircularProgress, IconButton, Tooltip } from "@mui/material";
import DiagramModal from "./DiagramModal";
import CirclePack from "./PathwayGraph";
import GraphOverview from "./GraphOverview";
import PropertySlider from "./PropertySlider";
import Legend from "./Legend";
import PathwayGraphOverlay from "./PathwayGraphOverlay";
import Neighborhood from "./NeighborhoodModal";
import GeneTargetsTable from "./GeneTargetsTable";


const Root: FC = () => {
  const [dataReady, setDataReady] = useState(true);
  const [dataset, setDataset] = useState<string | null>("empty");
  const [attr, setAttr] = useState<NodeAttributes | null>(null);

  // overlay related state variables
  const [pos, setPos] = useState<{x: number, y: number}>({x:0, y:0});
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedNode, setSelectedNode] = useState("");
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showPathwayGraph, setShowPWGraph] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [pgSelectorAnchor, setPGSelectorAnchor] = useState<HTMLButtonElement | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  const [dataFilter, setDataFilter] = useState<any>();
  const [edgeType, setEdgeType] = useState("");
  const [viewBy, setViewBy] = useState<string[]>([]);
  const [statType, setStatType] = useState("");
  const [update, setUpdate] = useState(0);
  const [showPGSelector, setShowPGSelector] = useState(false);
  const [graphOps, setGraphOps] = useState<GraphOps>({
    view_by:"",
    edge_type:"",
  });
  const [geneSets, setGeneSets] = useState<any[]>([]);
  const [geneSetSize, setGeneSetSize] = useState(0);
  const [selectedGenes, setSelectedGenes] = useState<string[]>([]);
  
  useEffect(() => {
    function checkPathway() {
      const item = window.localStorage.getItem('pathway')
      console.log(item)
      if (item) {
        setDataFilter(null);
        setStatType('');
        setViewBy([item]);
      }
    }
  
    window.addEventListener('storage', checkPathway)
  
    return () => {
      window.removeEventListener('storage', checkPathway)
    }
  },[])

  useEffect(() => {
    if(edgeType != ''){
      setViewBy([]);
      setStatType('');
      setDataFilter(null);
    }
  }, [edgeType])

  const onDialogClose = () => {
    setShowDialog(false);
  }
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const [showTargets, setShowTargets] = useState(false);
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false)

  const handleOverlayOnNodeClick = (e:any) => {
    console.log('click:', e.node);
    setPos({
      x: e.event.clientX,
      y: e.event.clientY,
    })
    if(e.node==selectedNode){
      setSelectedNode("");
      setShowOverlay(false);
      const mouseLayer = document.querySelector(".sigma-mouse");
        if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
    }
    else{
      setSelectedNode(e.node);
      setShowOverlay(true);
    }
  }

  const handleClickAway = () => {
    const re = new RegExp('^R-.*$');
    if(re.test(selectedNode)){
      const idx = viewBy.indexOf(selectedNode);
      const newVal = [...viewBy];
      if(idx>=0){
        newVal.splice(idx, 1);
      }
    }
    setSelectedNode("");
  }
  const handleOverlayClose = () => {
    setShowOverlay(false);
  }

  
  
  if (!dataset) return null;

  return (
    <div id="app-root" className={""}>
      
      <SigmaContainer
        graphOptions={{ allowSelfLoops: true, multi: true }}
        initialSettings={{
          nodeProgramClasses: { image: getNodeProgramImage() },
          labelRenderer: drawLabel,
          defaultNodeType: "image",
          defaultEdgeType: "arrow",
          labelDensity: 0.2,
          labelGridCellSize: 30,
          labelRenderedSizeThreshold: 5,
          labelFont: "Lato, sans-serif",
          
          zIndex: true,
        }}
        className="react-sigma"
      >
      
        <GraphEventsController 
        setHoveredNode={setHoveredNode} 
        dataReady = {dataReady}
        setNodeAttributes={setAttr}
        handleClickNode = {handleOverlayOnNodeClick}
        handleClickAway = {handleClickAway}/>
      
        <GraphDataController dataset={dataset} graphOps={graphOps} setDataReady = {setDataReady}/>

        <GraphSettingsController
          statFilter={dataFilter}
          statType={statType}
          geneSets={selectedGenes}
          hoveredNode={hoveredNode} 
          viewBy={viewBy}
          edgeType={edgeType}
          showDrugTarget={showTargets}
          graphLoaded={dataReady}
          dataset={dataset}
          updateCallback={setUpdate}/>

        {
          statType!=undefined && statType != ''?<PropertySlider
          statType = {statType}
          setFilter={setDataFilter}
          />:<></>
        }
        <DiagramModal 
        open={showDialog} 
        onClose={onDialogClose}
        setFilter={(v) => {
          setDataFilter(v);
          setViewBy([]);
        }} />
        <Neighborhood
        open={showNeighborhoodModal}
        setGenePairs={setGeneSets}
        setSetSize={setGeneSetSize}
        onClose={()=>{
          setShowNeighborhoodModal(false)
        }} />
          <>
            <NodeOverlay
            xPos={pos.x}
            yPos={pos.y}
            node={selectedNode}
            show={showOverlay} 
            attrCallback={setAttr}
            pathwayCallback={setPathways}
            onClose={handleOverlayClose}/>
            
             <GraphOverview
             onClose={()=>setAnchorEl(null)}
             anchorEl={anchorEl}
             viewBy={viewBy}
             edgeType={edgeType}
             statType={statType}
             statFilter={dataFilter}
             update={update}
              />
            <div className="controls">
              <div className="ico">
              </div>
              <ZoomControl
                className="ico"
                customZoomIn={<BsZoomIn />}
                customZoomOut={<BsZoomOut />}
                customZoomCenter={<BiRadioCircleMarked />}
              />
              
            </div>
            {
              showPathwayGraph && <CirclePack
              pathways={viewBy}
              onClose={()=>{setShowPWGraph(false)}}
              callback={(node)=>{setViewBy([node])}}
              open={showPathwayGraph } />
            }
            <div className="contents">
            <Tooltip title="graph summary" placement="top">
              <IconButton 
              sx={{position:"fixed", right:"430px", top:"10px", border:2}} 
              onClick={(e)=>{setAnchorEl(e.currentTarget)}}
              color="primary">
                <SummarizeOutlinedIcon/>
              </IconButton>
              </Tooltip>

              <Tooltip title="Graph Property" placement="top">
              <IconButton 
              sx={{position:"fixed", right:"380px", top:"10px", border:2}} 
              onClick={()=>{setShowDialog(true);}}
              color="primary">
                <VscGraphLine />
              </IconButton>
              </Tooltip>
              
              <Tooltip title="Pathway Graph" placement="top">
              <IconButton 
              sx={{position:"fixed", right:"480px", top:"10px", border:2}} 
              onClick={(e)=>{setShowPGSelector(true); setPGSelectorAnchor(e.currentTarget)}}
              color="primary">
                <HubRoundedIcon />
              </IconButton>
              </Tooltip>
              { 
                pgSelectorAnchor && 
                  <PathwayGraphOverlay 
                    anchorEl = {pgSelectorAnchor}
                    show = {showPGSelector}
                    openDialog = {()=>{
                      setShowPGSelector(false);
                      setPGSelectorAnchor(null);
                      setShowPWGraph(true);
                    }}
                    onClose = {()=>{
                      setShowPGSelector(false); 
                      setPGSelectorAnchor(null)
                    }}
                  />
              }

              <Tooltip title="Reset" placement="top">
              <IconButton 
              sx={{position:"fixed", right:"530px", top:"10px", border:2}} 
              onClick={()=>{
                setViewBy([]); 
                setEdgeType('all'); 
                setStatType(''); 
                setDataFilter(null)}}
              color="primary">
                <RestartAltIcon />
              </IconButton>
              </Tooltip>

              <Tooltip title="Subnetwork" placement="top">
                <IconButton
                sx={{position:"fixed", right:"580px", top:"10px", border:2}}
                onClick={()=>{
                  setShowNeighborhoodModal(true)
                }}
                color="primary">
                  <HighlightAltIcon />
                </IconButton>
              </Tooltip>

              <SearchField filters={filtersState} />

              <Legend viewBy = {viewBy}/>

              {
                dataReady? 
                <div className="panels">
                  <ViewSetting 
                  viewBy={viewBy} 
                  edgeType={edgeType}
                  statType={statType} 
                  setViewBy={(v) => {
                    setViewBy(v);
                    setDataFilter(null);
                    setStatType("")
                  }} 
                  setStatType={(v) => {
                    setStatType(v);
                    setDataFilter(null);
                    setViewBy([]);
                  }}
                  setEdgeType={setEdgeType}/>
                  <Attributes attr={attr}/>
                  <GenePathway pathway={pathways}/>
                  {
                    geneSets.length!=0?
                    <GeneTargetsTable
                    geneSets={geneSets}
                    k={geneSetSize}
                    onRowClick={(rows: number[])=>{
                      const genes: string[] = []
                      for(let i of rows){
                        for(let j=0; j<geneSetSize; j++){
                          genes.push(geneSets[i][j]);
                        }
                      }
                      console.log("update selectedGenes: ", genes)
                      setSelectedGenes(genes);
                    }} />
                    :<></>
                  }
                </div>:<></>
              }
              
            </div>
          </>
          <Backdrop
          open={!dataReady}
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit"/>
          </Backdrop>
        
      </SigmaContainer>
    </div>
  );
};

export default Root;
