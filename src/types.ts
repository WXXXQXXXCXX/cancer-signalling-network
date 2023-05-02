import { internal } from "neo4j-driver-core";

export interface NodeData {
  id: string;
  label: string;
  color: string
  x: number;
  y: number;
  size: number;
  inViewport?:boolean;
  attributes: Attributes;
}

export interface EdgeData {
  source: string;
  target: string;
  color: string;
  type: string;
  inViewport?:boolean;
  attributes?: EdgeAttributes; 
}

export interface Attributes {
  isDrugTarget?: boolean;
  isOncogene?: boolean;
  pathwayLevel?: number;
  expanded?: boolean;
  
}

export interface EdgeAttributes {
  category: string;
}

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
}

export interface Tag {
  key: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: EdgeData[];

}

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
}

export interface NodeAttributes {
  name: string;
  entrez_id: string;
  drugs: Drug[];
  oncogene?: Oncogene;
  hallmarks: string[]|null;
}


export interface Drug {
  name: string;
  EMA: string;
  FDA: string;
  other: string;
  WHO: string;
  drugbank_id: string|null;
  drugbank_link: string|null;
  ATC: string;
  ChEMBL_id: string|null;
  ChEMBL_link: string|null;
  indications: string;
  targets: string;
}

export interface Oncogene {
  name: string;
  ChrBand: number;
  genome_location:string;
  germline: string;
  germline_type: string;
  somatic_tumor_type: string;
  hallmark: string;
  molecular_genetics: string;
  other_germline_mut: string;
  other_syndrome: string;
  role: string;
  somatic: string;
  synonyms: string;
  tier: string;
  translocation_partner: string;
}

export interface ResNode {
  identity: number;
  labels: string[];
  properties: ResNodeProp;
}

export interface ResNodeProp {
  name: string;
  isDrugTarget: boolean;
  entrez_id: string;
}

export interface ResEdge {
  identity: number;
  start: number;
  end: number;
  type: string;
  properties: ResEdgeProp;
}

export interface ResEdgeProp {

}

export interface Pathway {
  id: string;
  name: string;
}

export interface GraphOps{
  edge_type: string;
  view_by: string;
}

export interface PathwayTree {
  id: string;
  name:string;
  children: PathwayTree[];
}