import Graph from "graphology"
import { Neighborhood, PDistOpts } from "./type"


const getNeighborhood = (graph: Graph): Neighborhood => {
    var adjs: Neighborhood = {
        starts: [],
        degree: [],
        neighborhood: [],
        nodes:[]
    }
    var cnt = 0;
    adjs.nodes = graph.nodes();
    var ids: any = {};
    for(let i=0, l=graph.order; i<l; i++) ids[adjs.nodes[i]] = i;
    for(let i=0, l=graph.order; i<l; i++){
        const node = adjs.nodes[i];
        adjs.starts[i] = cnt;
        graph.forEachInNeighbor(node, (neighbor, attr) => {
            adjs.neighborhood[cnt] = ids[neighbor];
            adjs.degree[ids[neighbor]] ++;
            cnt++;
        })
        //adjs.degree[i] = graph.outDegree(node);
    }
    adjs.starts[graph.order] = adjs.neighborhood.length;
    
    return adjs;
}


const pdist = (graph: Graph, opt: PDistOpts) => {
    const adj = getNeighborhood(graph);
    var x = new Float64Array(graph.order);
    const N = graph.order;

    for(let i=0; i<N; i++){
        var ppr = new Float64Array(graph.order);
        ppr[i] = 1;
        for(let iter = 0; iter<opt.numIter; iter++){
            
            var ans = new Float64Array(ppr.length);
            var err = 0;
            for(let i=0; i<ppr.length; i++){
                const start = adj.starts[i];
                const end = adj.starts[i+1];

                for(let j=start; j<end; j++){
                    const src = adj.neighborhood[j]
                    const weight = 1.0/adj.degree[src];
                    ans[i] += (1-opt.alpha)*ppr[src]*weight;
                }
                
                err += Math.abs(ans[i]-ppr[i]);
            }
            ppr[i] += 1;
            ppr = ans;
            
        }
        console.log(ppr);
        ppr = ppr.map((val)=>1-Math.log(adj.degree[i]*val+1e-5));
       
        x[i] = ppr.reduce((a, b) => a + b, 0)/N;
        //console.log("calculating pdist for i", i, 'value, ', x[i]);
    }
    for(let i=0; i<N; i++){
        graph.setNodeAttribute(adj.nodes[i], "pdist", x[i]);
    }

}


export default pdist;
