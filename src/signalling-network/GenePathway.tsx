import React, { FC, useEffect, useMemo } from "react";
import { Pathway } from "../types";
import Panel from "./Panel";

const GenePathway: FC<{pathway:Pathway[]}> = ({pathway}) => {
    const p_list = useMemo(()=>{
        const ps: JSX.Element[] = [];
        pathway.forEach((p)=>{
            ps.push(
                <>
                <table style={{
                    width:"100%",
                    border: "none",
                    paddingTop: "2px"
                  }}>
                    <tr><td width={"20%"}>ID:</td><td>{p.id}</td></tr>
                    <tr><td width={"20%"}>Name:</td><td>{p.name}</td></tr>
                  </table>
                  <hr />
                </>
            )
        })
        return ps;

    },[pathway])
    return (
        <Panel
        initiallyDeployed
        title={
            <>
            Pathways
            </>
        }>
            <>
            {p_list}
            </>
        </Panel>
    )
}

export default GenePathway;