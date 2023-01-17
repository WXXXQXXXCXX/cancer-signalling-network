export interface Neighborhood {
    starts: number[];
    degree: number[];
    neighborhood: number[];
    nodes: string[]
}

export interface PDistOpts {
    alpha: number,
    numIter: number,
    tolerance: number,
}