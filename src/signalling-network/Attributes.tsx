import React, { FC, useEffect, useMemo } from "react";
import { useSigma } from "react-sigma-v2";
import { GeneAttribute } from "../component/GeneAttribute";
import { NodeAttributes, Drug } from "../types";
import { hallmarks } from "./consts";

import Panel from "./Panel";

const Attributes: FC<{attr: NodeAttributes|null}> = ({attr}) => {
  
  return (
    <Panel
      initiallyDeployed ={true}
      title={
        <>
           Attributes
        </>
      }
    >
    { 
    attr? <GeneAttribute 
      attr = {attr}/> 
    : <></>
    }
    </Panel>
  );
};

export default Attributes;
