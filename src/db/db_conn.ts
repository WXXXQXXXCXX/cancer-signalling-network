import { NodeAttributes, NodeData, EdgeData, ResNode, ResEdge, Pathway, PathwayTree } from "../types";
import { neo_driver } from "../db";

// console.log('establishing connection...')
// const uri = "bolt://localhost:7687";
// const user_name = "sig_net";
// const pwd = "sig_net_v6";
// const db_name = "neo4j";
// const neo_driver = neo4j.driver(uri, neo4j.auth.basic(user_name, pwd));
const db_name = "neo4j";
const session = neo_driver.session({
    database: db_name
})

export async function GetNodeAttributeByEntrezName (entrez_name: string): Promise<any> {
    const s = neo_driver.session({
        database: db_name
    })
    var attr : NodeAttributes = {
        name:  entrez_name,
        hallmarks: [],
        entrez_id : "",
        drugs : [],
    }

    const q = 
    "MATCH res=(g: Gene)<-[:TARGET]-(d:Drug) WHERE g.name = $entrez_name return res\n"
    +"UNION\n"
    +"MATCH res=(g: Gene) WHERE g.name = $entrez_name return res\n"
    +"UNION\n"
    +"MATCH res=(g: Gene)<-[:ONCOGENE]-(d:Oncogene) WHERE g.name = $entrez_name return res\n"
    const t1 = performance.now()
    try{
        const res = await s.run(q, {entrez_name: entrez_name});
        const t2 = performance.now()
        console.log('cypher GetGeneAttributes took %s to complete', t2-t1)
        const recs = res.records;
        console.log(recs)
        if (recs.length >0) {
            attr.entrez_id = recs[0].get(0).start.properties.entrez_id;
        }

        if(recs.length > 1){
            attr.hallmarks = recs[1].get(0).start.properties.hallmarks;
        }
        
        recs.forEach((rec) => {
            const ele = rec.get(0).end;
            if (ele.labels[0]=="Oncogene") {
                attr.oncogene = ele.properties;
            }

            if (ele.labels[0]=="Drug"){
                const re = /^<a href=\"(.*)\">(.*)<\/a>$/g
                var drug_bank_re = re.exec(ele.properties.drugbank_id)
                const re2 = /^<a href=\"(.*)\">(.*)<\/a>$/g
                var chembl_re = re2.exec(ele.properties.ChEMBL)
                attr.drugs.push({
                    indications: ele.properties.indications,
                    name: ele.properties.name,
                    EMA: ele.properties.EMA,
                    FDA: ele.properties.FDA,
                    other: ele.properties.other,
                    WHO: ele.properties.WHO,
                    drugbank_id: drug_bank_re?drug_bank_re[2]:null,
                    drugbank_link: drug_bank_re?drug_bank_re[1]:null,
                    ATC: ele.properties.ATC,
                    ChEMBL_id: chembl_re?chembl_re[2]:null,
                    ChEMBL_link: chembl_re?chembl_re[1]:null,
                    targets: ele.properties.targets,
                })
            } 
            
        })
        return attr;
    } finally {
        await s.close()
    }
    
   

}

export async function GetDrugTargets(callback: (node: string[])=>void): Promise<any> {
    const t1 = performance.now()
    const res = await session.run("match (g:Gene) where g.isDrugTarget=true return g.name");
    const t2 = performance.now()
    console.log('cypher GetFrugTargets took %s to complete', t2-t1)
    const recs = res.records;
    console.log(recs);
    const node_list:string[] = []
    res.records.forEach((rec) => {
        node_list.push(rec.get(0));
    });
    callback(node_list);
}

export async function GetOncogenes(callback: (nodes: string[]) => void): Promise<any> {
    const t1 = performance.now()
    const res = await session.run("match (g:Gene)-[]-(o:Oncogene) return g.name");
    const t2 = performance.now()
    console.log('cypher GetOncogene took %s to complete', t2-t1)
    const node_list:string[] = []
    res.records.forEach((rec) => {
        node_list.push(rec.get(0));
    });
    callback(node_list);
}

export async function GetSubGraphWithLabel(
    label: string, 
    callback:(src:NodeData, dest:NodeData, e?:EdgeData) => void): Promise<any> {

        const q = "match (src: "+label+")-[rel*0..1]-(dest: "+label+") return src, rel, dest"
        const t1 = performance.now()
        const res = await session.run(q);
        const t2 = performance.now()
        console.log('cypher GetSubGraphWithLabel took %s to complete', t2-t1)
        const records = res.records;
        records.forEach((r)=>{
            const src:ResNode = r.get("src");
            const dest:ResNode = r.get("dest");
            const rel: ResEdge[] = r.get("rel");
            const src_node:NodeData = {
                id: src.properties.name,
                label: src.properties.name,
                color: "",
                x: 0,
                y: 0,
                size: 0,
                attributes: {isDrugTarget:src.properties.isDrugTarget}
            }
            const dest_node: NodeData={
                id: dest.properties.name,
                label: dest.properties.name,
                color: "",
                x: 0,
                y: 0,
                size: 0,
                attributes: {isDrugTarget:dest.properties.isDrugTarget}
            }
            if(rel.length==0){
                callback(src_node, dest_node);
            } else{
                rel.forEach((edge)=>{
                    const e:EdgeData = {
                        source: src_node.label,
                        target: dest_node.label,
                        color: "",
                        type: edge.type,
                    }
                    callback(src_node, dest_node, e);
                })
                
            }
        })
}

export async function GetPathwayOfGene(
    gene: string,
    callback:(p:Pathway[])=>void
):Promise<any>{
    const q = "match (g:Gene)-[:IN_PATHWAY]->(p:Pathway) where g.name = $label return p";
    const t1 = performance.now()
    const res = await session.run(q, {label: gene});
    const t2 = performance.now()
    console.log('cypher GetPathwayOfGene took %s to complete', t2-t1)
    const p_list:Pathway[] = [];
    res.records.forEach((rec)=>{
        p_list.push({
            id: rec.get("p").properties.id,
            name: rec.get("p").properties.name,
        })
    });
    callback(p_list)

    
}

export async function GetGeneByAttribute(
    oncogene: boolean,
    drug_target: boolean,
    pathway: string[],
    callback: (nodes: string[])=>any
):Promise<any> {
    const filters: string[] = [];
    
    let use_params = false;
    if(oncogene){
        filters.push("match (g:Gene)-[]-(o:Oncogene) return g.name")
    }

    if(drug_target) {
        filters.push("match (g:Gene) where g.isDrugTarget=true return g.name")
    }

    if(pathway.length > 0){
        filters.push("match (g:Gene)-[:IN_PATHWAY]->(p:Pathway) where p.id in $id return g.name")
        use_params = true;
    }

    const q = filters.join(' union ');
    var res;
    const t1 = performance.now()
    if(use_params){
        res = await session.run(q, {id: pathway});
    } else {
        res = await session.run(q);
    }
    const t2 = performance.now()
    console.log('get cancer gene/drug target: ', t2-t1);
    const node_list: string[] = [];
        res.records.forEach((rec) => {
            node_list.push(rec.get(0));
        });
        callback(node_list);
}

export async function GetGeneByHallmarks(
    hallmarks: string[],
    callback: (nodes: {node: string, hallmarks: string[]}[])=>any
) {
    const res = await session.run(
        'match (g:Gene)\n'+ 
        'where any(h in $hallmarks where h in g.hallmarks)'+
        'return g.name, [x in $hallmarks where x in g.hallmarks | x] as hallmarks', 
        {hallmarks: hallmarks}
    );
    const node_list:{node: string, hallmarks: string[]}[] = [];
    res.records.forEach((rec) => {
        node_list.push({
            node:rec.get(0) as string, 
            hallmarks:rec.get(1) as string[]
        });
    });
    
    callback(node_list);
}

export async function GetGeneByStat(
    stat_name: string, 
    min: number,
    max: number,
    callback: (nodes: {node: string, percent: number}[])=> any
) {
    const q = 
    `match (g:Gene)
    with toFloat(min(g.${stat_name})) as x, toFloat(max(g.${stat_name})) as y
    match (n:Gene)
    where toFloat(n.${stat_name}) > ${min} and toFloat(n.${stat_name}) < ${max}
    return n.name, (toFloat(n.${stat_name})-x)/(y-x) as percent`
    console.log('GetGeneByStat\n', q);
    const s = neo_driver.session({
        database: db_name
    })
    try{
        const res = await session.run(q);
        const node_list:{node: string, percent: number}[] = [];
        res.records.forEach((rec) => {
            node_list.push({
                node:rec.get(0) as string, 
                percent :rec.get(1) as number
            });
        });
        
        callback(node_list);
    } finally {
        await s.close()
    }
    

}
export async function GetStatBound(stat: string, callback: (min: number, max: number) => any): Promise<any> {
    console.log('GetStatBound')
    const s = neo_driver.session({
        database: db_name
    })
    const q = 
    `match (n:Gene) 
    with min(n.${stat}) as min,max(n.${stat}) as max
    return min,max`;
    console.log(q);
    try{
        const res = await s.run(q);
        if (res.records.length ==0){
            callback(0,1);
        } else {
            callback(Number(res.records[0].get(0)), Number(res.records[0].get(1)))
        }
    } finally {
        await s.close()
    }
    
}

export async function GetStats(stat: string, callback: (x: number[]) => any): Promise<any>{
    const s = neo_driver.session({
        database: db_name
    })
    const q = 
    `match (n:Gene) return n.${stat}`;
    console.log(q);
    try{
        const res = await s.run(q);
        const data: number[] = []
        res.records.forEach((rec) => {
            data.push(rec.get(0));
        });
        callback(data);
       
    } finally {
        await s.close()
    }
}

export async function GetPathwayTree(callback:(tree:PathwayTree)=>any):Promise<any>{
    const q = "match res=(p:Pathway)-[r:PARENT_OF*1..2]->(p1:Pathway)\n"+
    "where exists(()-[:IN_PATHWAY]->(p1))\n"+ 
    "and not exists(()-[:PARENT_OF]->(p))\n"+
    "and not exists((p1)-[:PARENT_OF]->())\n"+
    "return nodes(res) order by length(res)";
    const t1 = performance.now()
    const res = await session.run(q);
    const t2 = performance.now()
    console.log('cypher GetPathwayTree took %s to complete', t2-t1)
    const root: PathwayTree = {
        id: "root",
        name: "Pathway",
        children: [],
    };
    res.records.forEach((rec) => {
        const nodes = rec.get(0);
        var cur = root;
        for(let i=0; i<nodes.length; i++){
            const prop:Pathway = nodes[i].properties;
            var idx = -1;
            if(cur.children){
                idx = cur.children.findIndex((e)=>e.id==prop.id);
                
            }
            if(idx==undefined|| idx<0){
                cur.children?.push({
                    ...prop,
                    children: [],
                });
                cur = cur.children[cur.children?.length-1];
            } else {
                cur = cur.children[idx];
            }
        }
    })
    callback(root);
}

export async function GetPathwayNetwork(callback: (records: any[])=>void):Promise<any> {
    const q =  `
    match (p1:Pathway)-[:PARENT_OF]->(p2)
    where not exists(()-[:PARENT_OF*3]->(p2))
    and exists(()-[:IN_PATHWAY]->(p2))
    return p1, p2,'h' as type
    union
    match (p:Pathway)
    where not exists(()-[:PARENT_OF*3]->(p))
    with collect(p) as cands
    match (p1:Pathway)<-[:IN_PATHWAY]-(:Gene)-[:IN_PATHWAY]->(p2:Pathway)
    where p1 in cands and p2 in cands
    and not exists(()-[:PARENT_OF*3]->(p2))
    return p1,p2,'c' as type
    `
    const s = neo_driver.session({
        database: db_name
    })
    let res;
    try{
        res = await s.run(q);
        
    } finally {
        await s.close()
    }
    if(res == undefined){
        return;
    }
    console.log(res.records);
    callback(res.records);

}

export async function GetSignallingNetwork(callback: (records: any[])=>void):Promise<any>{
    const q =  `
    match (g1:Gene)-[r:REGULATE]->(g2:Gene)
    return g1.name, g1.x, g1.y, r.type, g2.name, g2.x, g2.y
    `

    const s = neo_driver.session({
        database: db_name
    })
    let res;
    try{
        res = await s.run(q);
        
    } finally {
        await s.close()
    }
    if(res == undefined){
        return;
    }
    callback(res.records);

}

export async function GetPathwayCirclePack(callback: (records: any[])=>void):Promise<any> {
    const q = `
    match res=(p1:Pathway)-[:PARENT_OF*1..2]->(p2)
    where not exists(()-[:PARENT_OF]->(p1))
    with res, size([(p2)-[:IN_PATHWAY]-(m:Gene) | m ]) as size
    where size > 0
    return nodes(res), size
    `
    const s = neo_driver.session({
        database: db_name
    })
    let res;
    try{
        res = await s.run(q);
        
    } finally {
        await s.close()
    }
    if(res == undefined){
        return;
    }
    console.log(res.records);
    callback(res.records);
}

export async function GetPathwayLinks(id: string, callback:(records: string[])=>void):Promise<any> {
    const q = `
    match (p1:Pathway {id:'${id}'})<-[:IN_PATHWAY]-(:Gene)-[:IN_PATHWAY]->(p2:Pathway)
    return p2.id;
    `

    const s = neo_driver.session({
        database: db_name
    })
    let res;
    try{
        res = await s.run(q);
        
    } finally {
        await s.close()
    }
    if(res == undefined){
        return;
    }
    console.log(res.records);
    callback(res.records.map(x=>x.get(0)));
}

export async function GroupNodesByPathway(
    nodes: string[], 
    callback: (groups: {[pathway: string]: string[]}) => void
): Promise<any> {
    const s = neo_driver.session({
        database: db_name
    })
    const q = 
    "MATCH (gene:Gene)-[:IN_PATHWAY]->(pathway:Pathway)\n"
    +"WHERE gene.name in $nodes\n"
    +"WITH pathway, collect(gene) as genes\n"
    +"WHERE size(genes) >= 3\n"
    +"RETURN pathway, genes\n"
    +"ORDER BY size(genes) DESC LIMIT 100";
    const start = performance.now()
    let res;
    try{
        res = await s.run(q, {nodes: nodes});
        
    } finally {
        await s.close()
    }
    if(res == undefined){
        return;
    }
    const ans: {[pathway: string]: string[]} = {};
    res.records.forEach((rec) => {
        const genes: any = rec.get("genes");
        const pathway: any = rec.get("pathway");
        const pathway_id: string = pathway.properties.id;
        ans[pathway_id] = []
        genes.forEach((gene:any) => {
            ans[pathway_id].push(gene.properties.name)
        })
    })
    const end = performance.now()
    console.log('cypher query GroupNodesByPathway took %s to complete', end-start)
    callback(ans);
    
    
}

export function Driver_Close() {
    session.close();
    neo_driver.close();
}