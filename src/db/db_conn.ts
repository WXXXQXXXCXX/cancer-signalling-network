import { findIndex } from "lodash";
import * as neo4j from "neo4j-driver"
import { Children } from "react";
import { NodeAttributes, NodeData, EdgeData, ResNode, ResEdge, Pathway, PathwayTree } from "../types";

const uri = "neo4j://localhost:7687";
const user_name = "sig_net";
const pwd = "sig_net_v6";
const db_name = "neo4j";
const neo_driver = neo4j.driver(uri, neo4j.auth.basic(user_name, pwd));
const session = neo_driver.session({
    database: db_name
})

export async function GetNodeAttributeByEntrezName (entrez_name: string): Promise<any> {
    var attr : NodeAttributes = {
        name:  entrez_name,
        entrez_id : "",
        drugs : [],
    }

    const q = 
    "MATCH res=(g: Gene)<-[:TARGET]-(d:Drug) WHERE g.name = $entrez_name return res\n"
    +"UNION\n"
    +"MATCH res=(g: Gene) WHERE g.name = $entrez_name return res\n"
    +"UNION\n"
    +"MATCH res=(g: Gene)<-[:ONCOGENE]-(d:Oncogene) WHERE g.name = $entrez_name return res\n"

    const res = await session.run(q, {entrez_name: entrez_name});
    const recs = res.records;

    if (recs.length >0) {
        attr.entrez_id = recs[0].get(0).start.properties.entrez_id;
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

}

export async function GetDrugTargets(callback: (node: string[])=>void): Promise<any> {
    const res = await session.run("match (g:Gene) where g.isDrugTarget=true return g.name");
    const recs = res.records;
    console.log(recs);
    const node_list:string[] = []
    res.records.forEach((rec) => {
        node_list.push(rec.get(0));
    });
    callback(node_list);
}

export async function GetOncogenes(callback: (nodes: string[]) => void): Promise<any> {
    const res = await session.run("match (g:Gene)-[]-(o:Oncogene) return g.name");
    const recs = res.records;
    const node_list:string[] = []
    res.records.forEach((rec) => {
        node_list.push(rec.get(0));
    });
    callback(node_list);
}

export async function GetSubGraphWithLabel(
    label: string, 
    callback:(src:NodeData, dest:NodeData, e?:EdgeData) => void): Promise<any> {
        console.log("get subgraph", label);
        const q = "match (src: "+label+")-[rel*0..1]-(dest: "+label+") return src, rel, dest"
        const res = await session.run(q);
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
    const res = await session.run(q, {label: gene});
    const p_list:Pathway[] = [];
    res.records.forEach((rec)=>{
        p_list.push({
            id: rec.get("p").properties.id,
            name: rec.get("p").properties.name,
        })
    });
    callback(p_list)

    
}

export async function GetPathwayTree(callback:(tree:PathwayTree)=>any):Promise<any>{
    const q = "match res=(p:Pathway)-[r:PARENT_OF*1..2]->(p1:Pathway)\n"+
    "where exists(()-[:IN_PATHWAY]->(p1))\n"+ 
    "and not exists(()-[:PARENT_OF]->(p))\n"+
    "and not exists((p1)-[:PARENT_OF]->())\n"+
    "return nodes(res) order by length(res)";
    const res = await session.run(q);
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

export async function GetNodesByPathwayId(id: string, callback: (nodes: string[])=>any):Promise<any> {
    const res = await session.run("match (g:Gene)-[:IN_PATHWAY]->(p:Pathway) where p.id=$id return g.name", {id: id});
    const node_list: string[] = [];
    res.records.forEach((rec) => {
        node_list.push(rec.get(0));
    });
    callback(node_list);
}

export async function GetHallmarkGene(callback: (nodes: string[])=>any):Promise<any> {
    console.log('fetching hallmarks');
    const res = await session.run("match (g:Gene)-[]-(o:Oncogene) where o.hallmark=\"Yes\" return g.name");
    const node_list: string[] = [];
    res.records.forEach((rec) => {
        node_list.push(rec.get(0));
    });
    callback(node_list);
}

export function Driver_Close() {
    session.close();
    neo_driver.close();
}