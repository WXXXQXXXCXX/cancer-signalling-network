import * as neo4j from "neo4j-driver"
import { NodeAttributes } from "../types";

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

    console.log(recs);
    if (recs.length >0) {
        attr.entrez_id = recs[0].get(0).start.properties.entrez_id;
    }
    
    recs.forEach((rec) => {
        const ele = rec.get(0).end;
        console.log(ele)
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
export function Driver_Close() {
    session.close();
    neo_driver.close();
}