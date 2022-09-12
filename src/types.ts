export interface NodeData {
  id: string;
  label: string;
  color: string
  x: number;
  y: number;
  size: number;
  attributes: any
}

export interface EdgeData {
  source: string;
  target: string;
  color: string;
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