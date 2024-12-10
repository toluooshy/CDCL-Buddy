import { useState, useEffect } from "react";

import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

const Graph = ({ playzoneData, onDropVariable, active }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const levelSpacing = 100; // Vertical spacing between levels
  const nodeSpacing = 120; // Horizontal spacing between nodes

  const handleDragOver = (e) => {
    if (active) {
      e.preventDefault();
    }
  };

  const handleDrop = (e) => {
    if (active) {
      e.preventDefault();
      const item = JSON.parse(e.dataTransfer.getData("text/plain"));
      onDropVariable(item);
    }
  };

  // Generate nodes and edges based on playzoneData
  useEffect(() => {
    const initialNodes = [];
    const initialEdges = [];
    const levelGroups = {};

    // Group nodes by levels
    Object.entries(playzoneData).forEach(([key, value]) => {
      if (!levelGroups[value.level]) {
        levelGroups[value.level] = [];
      }
      levelGroups[value.level].push(key);
    });

    // Create nodes with default positions
    Object.entries(playzoneData).forEach(([key, value]) => {
      const levelIndex = levelGroups[value.level].indexOf(key);
      const numNodesInLevel = levelGroups[value.level].length;

      const xOffset =
        250 -
        (numNodesInLevel - 1) * (nodeSpacing / 2) +
        levelIndex * nodeSpacing;
      const yOffset =
        value.level * (levelSpacing / 2) + (value.clauseid * nodeSpacing) / 5;

      initialNodes.push({
        id: key,
        type: "customNode",
        data: {
          conflict: value.conflict,
          implied: value.implied,
          label: value.positive
            ? `${key} @ ${value.level}`
            : `-${key} @ ${value.level}`,
        },
        position: { x: xOffset, y: yOffset },
        draggable: true,
      });

      // Add edges for implied relationships
      if (value.implied && value.nodes.length > 0) {
        value.nodes.forEach((source) => {
          initialEdges.push({
            id: `e-${source}-${key}`,
            type: "customEdge",
            source: source.replace("-", ""),
            target: key,
            data: {
              label: `C${value.clauseid}`,
            },
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
              width: 20,
              height: 20,
              color: "#ffffff",
            },
          });
        });
      }
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [playzoneData]);

  const onNodesChange = (changes) => {
    if (nodes) {
      setNodes((nodes) => applyNodeChanges(changes, nodes));
    }
  };

  const onEdgesChange = (changes) => {
    if (edges) {
      setEdges((edges) => applyEdgeChanges(changes, edges));
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "49.5vh",
        margin: "5px auto",
        backgroundColor: "#13161d",
        borderRadius: 8,
      }}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} size={0.75} />
      </ReactFlow>
    </div>
  );
};

export default Graph;
