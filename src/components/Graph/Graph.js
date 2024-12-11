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
  customNode: CustomNode, // Custom node type definition
};

const edgeTypes = {
  customEdge: CustomEdge, // Custom edge type definition
};

const Graph = ({ playzoneData, onDropVariable, active }) => {
  const [nodes, setNodes] = useState([]); // State to manage graph nodes
  const [edges, setEdges] = useState([]); // State to manage graph edges

  const levelSpacing = 100; // Vertical spacing between node levels
  const nodeSpacing = 120; // Horizontal spacing between nodes within the same level

  const handleDragOver = (e) => {
    if (active) {
      e.preventDefault(); // Allow dropping when the graph is active
    }
  };

  const handleDrop = (e) => {
    if (active) {
      e.preventDefault();
      const item = JSON.parse(e.dataTransfer.getData("text/plain")); // Parse dropped data
      onDropVariable(item); // Trigger callback with the dropped item
    }
  };

  // Update nodes and edges based on playzoneData
  useEffect(() => {
    const initialNodes = []; // Temporary array to hold generated nodes
    const initialEdges = []; // Temporary array to hold generated edges
    const levelGroups = {}; // Group nodes by their levels

    // Organize nodes into levels based on playzoneData
    Object.entries(playzoneData).forEach(([key, value]) => {
      if (!levelGroups[value.level]) {
        levelGroups[value.level] = [];
      }
      levelGroups[value.level].push(key);
    });

    // Create nodes and assign their positions
    Object.entries(playzoneData).forEach(([key, value]) => {
      const levelIndex = levelGroups[value.level].indexOf(key); // Index within the level
      const numNodesInLevel = levelGroups[value.level].length; // Total nodes in the level

      // Calculate X and Y positions
      const xOffset =
        250 -
        (numNodesInLevel - 1) * (nodeSpacing / 2) +
        levelIndex * nodeSpacing; // Horizontal alignment
      const yOffset =
        value.level * (levelSpacing / 2) + (value.clauseid * nodeSpacing) / 5; // Vertical alignment

      initialNodes.push({
        id: key, // Unique node ID
        type: "customNode", // Use the custom node type
        data: {
          conflict: value.conflict, // Whether the node represents a conflict
          implied: value.implied, // Whether the node is implied
          label: value.positive
            ? `${key} @ ${value.level}` // Positive literal label
            : `-${key} @ ${value.level}`, // Negative literal label
        },
        position: { x: xOffset, y: yOffset }, // Assign calculated position
        draggable: true, // Make the node draggable
      });

      // Add edges for implied relationships
      if (value.implied && value.nodes.length > 0) {
        value.nodes.forEach((source) => {
          initialEdges.push({
            id: `e-${source}-${key}`, // Unique edge ID
            type: "customEdge", // Use the custom edge type
            source: source.replace("-", ""), // Edge source node ID
            target: key, // Edge target node ID
            data: {
              label: `C${value.clauseid}`, // Edge label with clause ID
            },
            animated: true, // Animate the edge
            markerEnd: {
              type: MarkerType.Arrow, // Add an arrow marker at the end
              width: 20, // Arrow width
              height: 20, // Arrow height
              color: "#ffffff", // Arrow color
            },
          });
        });
      }
    });

    setNodes(initialNodes); // Update state with generated nodes
    setEdges(initialEdges); // Update state with generated edges
  }, [playzoneData]);

  // Handle node changes (e.g., position updates)
  const onNodesChange = (changes) => {
    if (nodes) {
      setNodes((nodes) => applyNodeChanges(changes, nodes));
    }
  };

  // Handle edge changes (e.g., addition or deletion)
  const onEdgesChange = (changes) => {
    if (edges) {
      setEdges((edges) => applyEdgeChanges(changes, edges));
    }
  };

  return (
    <div
      style={{
        width: "100%", // Full width container
        height: "49.5vh", // Half the viewport height
        margin: "5px auto", // Center the container vertically
        backgroundColor: "#13161d", // Graph background color
        borderRadius: 8, // Rounded corners for the container
      }}
    >
      <ReactFlow
        nodeTypes={nodeTypes} // Use custom node types
        edgeTypes={edgeTypes} // Use custom edge types
        nodes={nodes} // Pass nodes to the graph
        edges={edges} // Pass edges to the graph
        onNodesChange={onNodesChange} // Handle node updates
        onEdgesChange={onEdgesChange} // Handle edge updates
        onDragOver={handleDragOver} // Handle drag-over events
        onDrop={handleDrop} // Handle drop events
        proOptions={{ hideAttribution: true }} // Hide attribution watermark
        fitView // Fit the graph view to the container
      >
        <Controls /> {/* Render graph control buttons */}
        <Background color="#aaa" gap={16} size={0.75} />
        {/* Render grid background */}
      </ReactFlow>
    </div>
  );
};

export default Graph;
