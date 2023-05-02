import * as neo4j from "neo4j-driver"

console.log('establishing connection...')
const uri = "bolt://localhost:7687";
const user_name = "sig_net";
const pwd = "sig_net_v6";
export const neo_driver = neo4j.driver(uri, neo4j.auth.basic(user_name, pwd));
