import React, { useEffect } from 'react';
import * as d3 from 'd3';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid } from '@mui/material';
import useDebounce from '../use-debounce';
import TreeItem from '@mui/lab/TreeItem';
import { CloseSquare, MinusSquare, PlusSquare } from '../component/StyledTree';
import TreeView from '@mui/lab/TreeView';


const CirclePack:React.FC<{
    pathways: string[],
    callback: (pathway: string)=>void,
    onClose: (param?: any)=>void,
    open: boolean
}> = ({pathways, callback, onClose, open}) => {
    const width = 740;
    const height = 740;
    const r = height/2;
    const padding = 0;

    const ref = React.useRef(null);
    const [data, setData] = React.useState<any>();
    const [nodes, setNodes] = React.useState<any>();
    const [names, setNames] = React.useState<{[key:string]:string}>({});
    const [links, setLinks] = React.useState<{[key: string]: string[]}>({});
    const [selected, setSelected] = React.useState<string[]>([]);
    const [expanded, setExpanded] = React.useState<string[]>(['root']);
    const [hoveredNode, setHoveredNode] = React.useState('');
    const debouncedHoveredNode = useDebounce(hoveredNode, 40);

    const handleToggle = (event:any, nodeIds:string[]) => {
        setExpanded(nodeIds);
      };
    
    const handleSelect = (event:any, nodeIds:string[]) => {
        setSelected(nodeIds);
    };

    let focus;
    let view;

    const pack = d3.pack()
    .size([width - 1, height - 1]);

    var color = d3.scaleLinear<string>()
            .domain([0, 5])
            .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
            .interpolate(d3.interpolateHsl);
            
    var tooltip = d3
            .select("#d3-data-vis")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("border-width", "2px")
            .style("border-radius", "3px")
            .style("padding", "2px")
            .style("visibility", "hidden");

    const svg = d3
            .select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr('padding-left', 10)
            .attr("viewBox", `${padding} ${padding} ${height+padding*2} ${width+padding*2}`);


    React.useEffect(()=>{
        d3.json(`${process.env.PUBLIC_URL}/result.json`)
        .then((data)=>{     
            
            setData(data);
        })

        fetch(`${process.env.PUBLIC_URL}/pathway_links.json`)
        .then((res)=>res.json())
        .then((data)=>setLinks(data));
        fetch(`${process.env.PUBLIC_URL}/pathway_names.csv`)
        .then((res)=>res.text())
        .then((data)=>{
            const dict:{[key:string]:string}={};
            const lines = data.split('\n').slice(1);
            for(let i=0; i<lines.length; i++){
                const line:string[] = lines[i].split(',');
                dict[line[0]]=line[1];
            }
            setNames(dict);
        });

    }, [])


    React.useEffect(()=>{
        if(!data) return;
        var root = d3.hierarchy(data)
                .sum(function(d:any) { return d.size; })
                .sort(function(a:any, b:any) { return b.value - a.value; });
        var g = svg.append("g").attr("transform", "translate(2,2)");
        var format = d3.format(",d");
        svg.append('svg:defs').append('svg:marker')
            .attr('id', 'head')
            .attr('orient', 'auto')
            .attr('markerWidth', '2')
            .attr('markerHeight', '4')
            .attr('refX', '0.1')
            .attr('refY', '2')
            .append('marker:polygon')
            .attr('points', '0,0 0,4 2,2')
            .attr('fill', 'red');
        root = pack(root);
        focus = root;
        var node = g.selectAll(".node")
                    .data(root.descendants())
                    .enter().append("g")
                    .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
                    .attr('id', (d:any)=>d.data.name)
                    .style("fill", function(d:any) { return d.children ? color(d.depth+1) : '#ffffff'; })
                    .attr("transform", function(d:any) {return "translate(" + d.x + "," + d.y + ")"; })
       
        setNodes(node);
        var timeout:any = null;
        node.append("circle")
            .attr("r", function(d:any) { return d.r; })
            .on("click", (event:any, d:any)=> {
                svg
                .transition()
                .duration(1000)
                .attr("viewBox", 
                `${d.x - d.r - 1} ${d.y - d.r - 1} ${d.r * 2 + padding*2} ${d.r * 2 + padding*2}`);
            })
            .on('mouseover', (event: any, d:any)=>{
                tooltip
                .text(d.data.name)
                .style("visibility", "visible");
                console.log(tooltip);
                setHoveredNode(d.data.name);
                showRels(d);
            })
            .on("mousemove", function(event: any, d: any){
                tooltip
                .style("top", (event.pageY-10)+"px")
                .style("left",(event.pageX+10)+"px");
            })
	        .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
            .on('dblclick', (event: any, d: any)=>{
                svg
                    .transition()
                    .duration(1000)
                    .attr("viewBox", 
                    `${d.x - d.r - 1} ${d.y - d.r - 1} ${d.r * 2 + padding*2} ${d.r * 2 + padding*2}`)
                    .on('end', ()=>{
                        onClose();
                        callback(d.data.name);
                    });
                
            })


        var label = node.append("text")
                    .style("font", "2px sans-serif")
                    .style("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .style('fill', 'black')
                    .text( (d:any) => {
                        return `${d.data.name.substring(0,6)}\n${d.data.name.substring(6)}`
                    });

        const showRels=(d: any)=>{
            const activeNode = d;
            
            g
            .selectAll("path")
            .remove();
            g
            .selectAll("path")
            .data(node.filter((o:any)=>{
                return links[d.data.name]?.includes(o.data.name)
            }))
            .enter()
            .append("svg:path")
            .attr('d', function(d:any) {
                //console.log(activeNode);
                const transform = d.getAttribute("transform");
                const [x, y]=transform?transform.substring(transform.indexOf("(")+1, transform.indexOf(")")).split(","):"";
                var fX = activeNode.x;
                var fY = activeNode.y;
                //console.log('M ' + fX + ' ' + fY + ' Q ' + (fX + 20) + ' ' + y / 2 + ' ' + x + ' ' + y);
                return 'M ' + fX + ' ' +fY + ' Q ' + fX+20 + ' ' + y+30 + ' ' + x + ' ' + y
              })
            .attr("style", function(d) {
                return "stroke:#4169E1;stroke-width:2;fill:none;";
              })
            .attr('marker-end', 'url(#Cross)');
        }
            
    }, [data, links, open])


    const renderTree = (nodes: any) => (
        <TreeItem key={nodes.name} nodeId={nodes.name} label={names[nodes.name]}>
          {Array.isArray(nodes.children)
            ? nodes.children.map((node:any) => renderTree(node))
            : null}
        </TreeItem>
    );

    const listView = React.useMemo(()=>{
        console.log(data?.name);
        if(!names||!links||!data){
            return <></>;
        }
        return renderTree(data);
    }, [names, links, data]);

    


    React.useEffect(()=>{
        if(!debouncedHoveredNode||!names||!links||debouncedHoveredNode=='root'){
            return;
        }
        const neighbors = links[debouncedHoveredNode]
        if(!neighbors||neighbors.length==0) return;
        console.log(neighbors, debouncedHoveredNode);
        setExpanded([...neighbors, debouncedHoveredNode, 'root']);
        setSelected([...neighbors, debouncedHoveredNode]);
    }, [debouncedHoveredNode, names, links])



    return (
        
        <Dialog
        open={open}
        fullScreen
        >
            <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ width: '100%'}}> 
            <Grid 
            container 
            rowSpacing={1} 
            columnSpacing={{ xs: 2, sm: 2, md: 2 }}>
                <Grid xs={8}>
                    <div id='#d3-data-vis'>
                        <svg ref={ref} style={{paddingLeft: '30px'}}></svg>
                    </div>
                </Grid>
                <Grid xs={4} direction='column' sx={{'paddingTop': '10px'}}>
                <TreeView
                defaultExpanded={['root']}
                selected={selected}
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
                expanded={expanded}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}>
                    {listView}
                </TreeView>
                    
                </Grid>
            </Grid>
        </Box>
           
        </Dialog>

    )
}

export default CirclePack;