import chroma from 'chroma-js';

export const EDGE_FADE_COLOR = "rgba(20, 20, 20, 0.1)";
export const EDGE_HIDE_COLOR = 'rgba(25, 25, 25, 0.1)';
export const MIN_NODE_SIZE = 4;
export const MAX_NODE_SIZE = 10;

export const NODE_COLOR_MAX = {
    r: 0xf2,
    b: 0x7d,
    g: 0x7a,
}
//c5f9d7
export const NODE_COLOR_MIN = {
    r: 0x8b,
    b: 0xf8,
    g: 0x94,
}
export const PHY_COLOR = "rgba(39, 118, 245, 0.8)";
export const POS_COLOR = "rgba(60,179,113, 0.8)";
export const NEG_COLOR = "rgba(255, 40, 0, 0.8)";
export const NODE_COLOR = "rgba(0, 120, 170, 1)" ;
export const NODE_HIGHLIGHT_COLOR = "rgba(220,20,60,1)"
export const NODE_FADE_COLOR = "rgba(20, 20, 20, 0.1)";
export const NODE_HIDE_COLOR = "rgba(40, 40, 40, 0.2)";
export const PATHWAY_NODE_COLOR = ['rgba(133, 14, 53, 0.7)','rgba(238, 105, 131, 0.7)','rgba(255, 196, 196, 0.7)'];
export const PATHWAY_NODE_FADE_COLOR = ['rgba(133, 14, 53, 0.4)','rgba(238, 105, 131, 0.4)','rgba(255, 196, 196, 0.4)'];
export const PATHWAY_V_EDGE_COLOR = 'rgb(49, 17, 44)';
export const PATHWAY_H_EDGE_COLOR = 'rgb(255, 211, 114)';
export const PATHWAY_V_EDGE_FADE_COLOR = 'rgba(49, 17, 44, 0.4)';
export const PATHWAY_H_EDGE_FADE_COLOR = 'rgba(255, 211, 114, 0.4)';
export const gradient = chroma.scale(['#008bec', '#eeee22', '#F0000D']);
export const stats = [
    'pPagerank','pOutDegree','pInDegree','pDegree_Centrality','pDegree','pBetweenness_Centrality', 'pEigenvector_Centrality',
    'aPagerank','aOutDegree','aInDegree','aDegree_Centrality','aDegree','aBetweenness_Centrality', 'aEigenvector_Centrality'
];
export const PATHWAY_NODE_SIZE = [20,15,12]
export const hallmarks: {[key: number]:string}= {
    0: 'promote proliferation',
    1: 'evade growth repressor',
    2: 'resist cell death',
    3: 'enable replicative immortality',
    4: 'induce angiogenesis',
    5: 'activate invasion & metastasis',
    6: 'reprogramme energy metabolism',
    7: 'evade immune destruction',
    8: 'genome instability',
    9: 'tumor promoting inflammation',
};

export const hallmarks_color: {[key: number]:string}= {
    0: '#00f5d4',
    1: '#00bbf9',
    2: '#fee440',
    3: '#f15bb5',
    4: '#9b5de5',
    5: '#adc178',
    6: '#d62828',
    7: '#e63946',
    8: '#bc6c25',
    9: '#70e000',
};




export const SCALE_LINEAR = 0;
export const SCALE_LOG = 1;