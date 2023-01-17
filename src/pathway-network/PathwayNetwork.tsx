import React, { useState, FC, useEffect} from 'react';

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import drawLabel from "../canvas-utils";
import { SigmaContainer, ZoomControl, FullScreenControl } from "react-sigma-v2";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { Dataset } from '../types';
import GraphDataController from './GraphDataController';
import GraphSettingsController from './GraphSettingsController';
import GraphEventsController from './GraphEventsController';
import { BiRadioCircleMarked } from 'react-icons/bi';
import SearchField from './search';

const PathwayNetwork: FC = () => {
    const [dataset, setDataset] = useState<any | null>(null);
    const [dataReady, setDataReady] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/pathway.json`)
          .then((res) => res.json())
          .then((dataset: Dataset) => {
            setDataset(dataset);
            requestAnimationFrame(() => setDataReady(true));
          });
      }, []);

    if (!dataset) return null;

    return (
        <div id='app-root'>
            <SigmaContainer
                graphOptions={{ type: "undirected" }}
                initialSettings={{
                    nodeProgramClasses: { image: getNodeProgramImage() },
                    labelRenderer: drawLabel,
                    defaultNodeType: "image",
                    defaultEdgeType: "arrow",
                    labelDensity: 0.07,
                    labelGridCellSize: 60,
                    labelRenderedSizeThreshold: 15,
                    labelFont: "Lato, sans-serif",
                    zIndex: true,
                  }}>
                    <GraphDataController dataset={dataset} />
                    <GraphSettingsController hoveredNode={hoveredNode} />
                    <GraphEventsController setHoveredNode={setHoveredNode} />

                    {dataReady && (
                      <>
                        <div className="controls">
                          
                          <FullScreenControl
                            className="ico"
                            customEnterFullScreen={<BsArrowsFullscreen />}
                            customExitFullScreen={<BsFullscreenExit />}
                          />
                          <ZoomControl
                            className="ico"
                            customZoomIn={<BsZoomIn />}
                            customZoomOut={<BsZoomOut />}
                            customZoomCenter={<BiRadioCircleMarked />}
                          />
                        </div>
                        <div className="panels">
                          <SearchField  />
                        </div>
                      </>
                    )}
            </SigmaContainer>
            
        </div>

    );
}

export default PathwayNetwork;

