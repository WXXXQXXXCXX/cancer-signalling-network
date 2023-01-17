import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma } from "react-sigma-v2";
import { Attributes } from "graphology-types";
import { BsSearch } from "react-icons/bs";

import { FiltersState } from "../types";

const SearchField: FC<{ filters: FiltersState }> = ({ filters }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const [search, setSearch] = useState<string>("");
  const [values, setValues] = useState<Array<{ id: string; label: string }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  

  const refreshValues = () => {
    const newValues: Array<{ id: string; label: string }> = [];
    const lcSearch = search.toLowerCase();
    if (!selected && search.length > 1) {
      graph.forEachNode((key: string, attributes: Attributes): void => {
        if (!attributes.hidden && attributes.label && attributes.label.toLowerCase().indexOf(lcSearch) === 0)
          newValues.push({ id: key, label: attributes.label });
      });
    }
    setValues(newValues);
  };


  useEffect(() => refreshValues(), [search]);

  useEffect(() => {
    requestAnimationFrame(refreshValues);
  }, [filters]);

  useEffect(() => {
    if (!selected) return;
    graph.setNodeAttribute(selected, "color", "#EE5050");
    graph.setNodeAttribute(selected, "highlighted", true);
    graph.forEachEdge(selected, (edge, attributes, source, target, sourceAttributes, targetAttributes) => {
      console.log(source, target, edge);
      graph.setEdgeAttribute(edge, "zIndex", 1);
      graph.setEdgeAttribute(edge, "weight", 1.5);
      if(source == selected){
        graph.setNodeAttribute(target, "color", "#f28a8a")
      } else{
        graph.setNodeAttribute(source, "color", "#f28a8a")
      }

    })
    const nodeDisplayData = sigma.getNodeDisplayData(selected);
    
    if (nodeDisplayData)
      sigma.getCamera().animate(
        { ...nodeDisplayData},
        {
          duration: 600,
        },
      );

    return () => {
      sigma.getGraph().setNodeAttribute(selected, "color", "rgba(0, 120, 170, 0.9)");
      sigma.getGraph().setNodeAttribute(selected, "highlighted", false);
      graph.forEachEdge(selected, (edge, attributes, source, target, sourceAttributes, targetAttributes) => {
        graph.setEdgeAttribute(edge, "weight", 0.5);
        graph.setEdgeAttribute(edge, "zIndex", 0);
        if(source == selected){
          graph.setNodeAttribute(target, "color", "rgba(0, 120, 170, 0.9)")
        } else{
          graph.setNodeAttribute(source, "color", "rgba(0, 120, 170, 0.9)")
        }
  
      })
    };
  }, [selected]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchString = e.target.value;
    const valueItem = values.find((value) => value.label === searchString);
    if (valueItem) {
      setSearch(valueItem.label);
      setValues([]);
      setSelected(valueItem.id);
    } else {
      setSelected(null);
      setSearch(searchString);
    }
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && values.length) {
      setSearch(values[0].label);
      setSelected(values[0].id);
      console.log(values[0].id);
    }
  };

  return (
    <div className="search-wrapper">
      <input
        type="search"
        placeholder="Search a node"
        list="nodes"
        value={search}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
      />
      <BsSearch className="icon" />
      <datalist id="nodes">
        {values.map((value: { id: string; label: string }) => (
          <option key={value.id} value={value.label}>
            {value.label}
          </option>
        ))}
      </datalist>
    </div>
  );
};

export default SearchField;
