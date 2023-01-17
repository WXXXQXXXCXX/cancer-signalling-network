
export const min_cog_load = (adj: {[key: string]:string[]}) => {
    var v = Object.keys(adj).length;
    var e = Object.keys(adj).reduce((sum,key)=>sum+adj[key].length,0);

    var sorted_v = Object.keys(adj).sort((one, two) => {
        return adj[one].length - adj[two].length;
    })

    const remove_edge = [];
    const remove_node = [];
    while(cog_load(e,v)>= 0.7){

        const node = sorted_v[0];
        console.log(e,v, adj[node].length)
        e -= adj[node].length;
        remove_edge.push(...adj[node]);
        delete adj[node];
        remove_node.push(node);

        sorted_v = Object.keys(adj).sort((one, two) => {
            return adj[one].length - adj[two].length;
        });
    }

    return [remove_edge, remove_node];
}

function cog_load(e: number, v: number){
    const x = -0.5*(e+2*e/(v*(v-1))+e-3*v+6-10)
    const l = 1/(Math.exp(x)+1)

    return l
}

