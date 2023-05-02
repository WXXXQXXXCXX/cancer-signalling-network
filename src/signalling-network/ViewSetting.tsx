import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { GraphOps, PathwayTree } from '../types';
import { GetPathwayTree } from '../db/db_conn';
import Panel from './Panel';
import { CloseSquare, MinusSquare, PlusSquare, StyledTreeItem } from '../component/StyledTree';

const ViewSetting: React.FC<{viewBy: string[], edgeType: string, statType: string,
    setViewBy: (val: string[])=>void, 
    setEdgeType: (val: string)=>void,
    setStatType:(val: string)=>void }> = ({
        viewBy, edgeType, statType, 
        setViewBy, setEdgeType, setStatType}) => {
    const [root, setRoot] = React.useState<PathwayTree>({
        id: "6",
        name: "Pathways",
        children: [],
    });

    const renderTree = (tree: PathwayTree) => {
        return  (
        <StyledTreeItem nodeId={tree.id} label={tree.name}>
            {Array.isArray(tree.children) && tree.children.length>0
            ? tree.children.map((c)=>renderTree(c))
            : null
        }
        </StyledTreeItem>)
    }
    
    const tree = React.useMemo (() => renderTree(root), [root]);

    React.useEffect(()=>{
        GetPathwayTree(setRoot);
    }, [])

    const handleItemSelect = (e:React.SyntheticEvent, idx: string[]) => {
        
        idx = idx.filter((v, i)=>v!="root"&& v!='hallmark'&&v.length>1)
        setViewBy(idx);
    }
    const handleStatChange = () => {
        console.log(statVal, value);
        if(value=='') return;
        if(value=='neutral_link'){
            setStatType('p'+statVal);
        } else{
            setStatType('a'+statVal);
        }
    }

    const [value, setValue] = React.useState("");
    const [statVal, setStatVal] = React.useState("");
    return(
        <Panel
        title={
            <>
               Settings
            </>
        }>
            <form onSubmit = {(e)=>{
                e.preventDefault();
                setEdgeType(value);
                }}>
                <FormControl sx={{ m: 3 }} variant="standard">
                    <FormLabel id="edge-type">Human Signalling Network</FormLabel>
                    <RadioGroup
                    name="edgeType"
                    value={value}
                    onChange={(e)=>{setValue(e.target.value)}}
                    >
                    <FormControlLabel value="signal_link" control={<Radio />} label="signal links" />
                    <FormControlLabel value="neutral_link" control={<Radio />} label="neutral links" />
                    <FormControlLabel value="all_edge" control={<Radio />} label="all" />
                    </RadioGroup>
                    <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
                    Load Graph
                    </Button>
                </FormControl>
            </form>
            {
                edgeType != ''?
                <>
                <form onSubmit = {(e)=>{
                e.preventDefault();
                handleStatChange();
                }}>
                    <FormControl sx={{ m: 3 }} variant="standard">
                        <FormLabel id="stat">Network Properties</FormLabel>
                        <RadioGroup
                        name="networkStat"
                        value={statVal}
                        onChange={(e)=>{setStatVal(e.target.value)}}
                        >
                        <FormControlLabel value="In_Degree" control={<Radio />} label="In Degree" />
                        <FormControlLabel value="Out_Degree" control={<Radio />} label="Out Degree" />
                        <FormControlLabel value="Degree" control={<Radio />} label="Degree" />
                        <FormControlLabel value="Degree_Centrality" control={<Radio />} label="Degree Centrality" />
                        <FormControlLabel value="Closeness_Centrality" control={<Radio />} label="Closeness Centrality" />
                        <FormControlLabel value="Eigenvector_Centrality" control={<Radio />} label="Eigenvector Centrality" />
                        <FormControlLabel value="Betweenness_Centrality" control={<Radio />} label="Betweenness Centrality" />
                        <FormControlLabel value="Pagerank" control={<Radio />} label="Pagerank" />
                        </RadioGroup>
                        <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
                        Load Property
                        </Button>
                    </FormControl>
                </form>
                <TreeView
                    defaultCollapseIcon={<MinusSquare />}
                    defaultExpandIcon={<PlusSquare />}
                    defaultEndIcon={<CloseSquare />}
                    sx={{ maxHeight: 700, flexGrow: 1, maxWidth: 320, overflowY: 'auto' }}
                    multiSelect
                    onNodeSelect={handleItemSelect}
                >
                    <StyledTreeItem nodeId="2" label="View">
                        <StyledTreeItem nodeId={"cancer_gene"} label="Cancer genes" />
                        <StyledTreeItem nodeId={"drug_targets"} label="Drug targets" />
                        {tree}
                        <StyledTreeItem nodeId={"all"} label="All" />
                        <StyledTreeItem nodeId="hallmark" label="Hallmarks" >
                            <StyledTreeItem nodeId='hallmark_0' label='promote proliferation' />
                            <StyledTreeItem nodeId='hallmark_1' label='evade growth repressor' />
                            <StyledTreeItem nodeId='hallmark_2' label='resist cell death' />
                            <StyledTreeItem nodeId='hallmark_3' label='enable replicative immortality' />
                            <StyledTreeItem nodeId='hallmark_4' label='Induce angiogenesis' />
                            <StyledTreeItem nodeId='hallmark_5' label='Activate invasion & metastasis' />
                            <StyledTreeItem nodeId='hallmark_6' label='Reprogramme energy metabolism' />
                            <StyledTreeItem nodeId='hallmark_7' label='Evade immune destruction' />
                            <StyledTreeItem nodeId='hallmark_8' label='Genome instability' />
                            <StyledTreeItem nodeId='hallmark_9' label='Tumor promoting inflammation' />
                        </StyledTreeItem>
                    </StyledTreeItem>
                </TreeView>
                </>:<></>
            }
            
            
        </Panel>
    );
}

export default ViewSetting;