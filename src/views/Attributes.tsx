import React, { FC, useEffect, useMemo } from "react";
import { useSigma } from "react-sigma-v2";
import { NodeAttributes, Drug } from "../types";

import Panel from "./Panel";

const Attributes: FC<{attr: NodeAttributes|null}> = ({attr}) => {

  const sigma = useSigma();
  const graph = sigma.getGraph();
  
  const reactants = useMemo(()=>{
    const adjs:JSX.Element[] = [];
    graph.forEachNode((node, n_attr)=>{
      if (graph.areNeighbors(node, attr?.name)){
        adjs.push(<ul>{node}</ul>)
      }
    })
    return adjs;
  }, [attr]);

  return (
    <Panel
      initiallyDeployed
      title={
        <>
           Attributes
        </>
      }
    >
      <p>
      <table style={{
        width:"100%",
        border: "none",
        paddingTop: "1px"
      }}>
      <tr><td width={"25%"}>Name:</td><td>{attr?.name}</td></tr>
      <tr><td width={"25%"}>Entrez ID:</td><td>{attr?.entrez_id}</td></tr>
      </table>
  
        <h3>Drugs: </h3>
        
        {attr?.drugs.map((drug: Drug)=>(
          <>
          <hr />
          <table style={{
            width:"100%",
            border: "none",
            paddingTop: "2px"
          }}>
            <tr><td width={"20%"}>Name:</td><td>{drug.name}</td></tr>
            <tr><td width={"20%"}>Drug Bank:</td><td><a href={drug.drugbank_link?drug.drugbank_link:undefined}>{drug.drugbank_id}</a></td></tr>
            <tr><td width={"20%"}>ChEMBL:</td><td><a href={drug.ChEMBL_link?drug.ChEMBL_link:undefined}>{drug.ChEMBL_id}</a></td></tr>
            <tr><td width={"20%"}>EMA:</td><td>{drug.EMA}</td></tr>
            <tr><td width={"20%"}>FDA:</td><td>{drug.FDA}</td></tr>
            <tr><td width={"20%"}>WHO:</td><td>{drug.WHO}</td></tr>
            <tr><td width={"20%"}>ATC:</td><td>{drug.ATC}</td></tr>
            <tr><td width={"20%"}>Indications:</td><td>{drug.indications}</td></tr>
            <tr><td width={"20%"}>Targets:</td><td>{drug.targets}</td></tr>
          </table>
          </>
        ))}
        
          <h3>Related Genes: </h3>
          <ul>
            {reactants}
          </ul>
          {attr?.oncogene?
            <>
              <h3>Oncogene: </h3>
              <table style={{
                width:"100%",
                border: "none",
                paddingTop: "2px"
              }}>
                <tr><td width={"30%"}>Name:</td><td>{attr.oncogene.name}</td></tr>
                <tr><td width={"30%"}>Somatic:</td><td>{attr.oncogene.somatic}</td></tr>
                <tr><td width={"30%"}>ChrBand:</td><td>{attr.oncogene.ChrBand}</td></tr>
                <tr><td width={"30%"}>Genom Location:</td><td>{attr.oncogene.genome_location}</td></tr>
                <tr><td width={"30%"}>Germline:</td><td>{attr.oncogene.germline}</td></tr>
                <tr><td width={"30%"}>Tumor Type (Germline):</td><td>{attr.oncogene.germline_type}</td></tr>
                <tr><td width={"30%"}>Tumor Type (Somatic):</td><td>{attr.oncogene.somatic_tumor_type}</td></tr>
                <tr><td width={"30%"}>Synonnyms:</td><td>{attr.oncogene.synonyms}</td></tr>
                <tr><td width={"30%"}>Hallmark:</td><td>{attr.oncogene.hallmark}</td></tr>
                <tr><td width={"30%"}>Other Germline Mutation:</td><td>{attr.oncogene.other_germline_mut}</td></tr>
                <tr><td width={"30%"}>Other Syndromes:</td><td>{attr.oncogene.other_syndrome}</td></tr>
                <tr><td width={"30%"}>Role in Cancer:</td><td>{attr.oncogene.role}</td></tr>
              </table>
            </>
          :<></>}
      </p>
    </Panel>
  );
};

export default Attributes;
