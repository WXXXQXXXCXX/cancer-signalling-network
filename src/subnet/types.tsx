export interface MotifResponse {
    nodes: {[key: string]: Node};
    groups: {[key: string]: Group};
    edges: Edge[];
    levels: any[];
}
export interface Node {
    data: NodeData;
    classes: string;
    group: string;
    
}

export interface NodeData {
    id: string;
    size: number;
}

export interface NodePosition {
    x: number;
    y: number;
}

export interface Edge {
    data: EdgeData;
    group: string;
}

export interface EdgeData {
    source: string;
    target: string;
    category: string;
}

export interface Group {
    data: any;
    group: string;
    classes: string;
}

export interface GroupData {
    id: string;
    children: string[];
    type: string;
    size: number;

}