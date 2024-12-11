import { Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const CustomNode = ({ data }) => {
  return (
    <div
      style={{
        padding: "12.5px 15px", // Padding for the node content
        border: `1px solid ${
          data.conflict ? "#c24c46" : data.implied ? "#f8f8f8" : "#4c98f5"
        }`, // Dynamic border color based on node state (conflict, implied, or default)
        color: data.conflict ? "#c24c46" : data.implied ? "#f8f8f8" : "#4c98f5", // Dynamic text color matching the border
        borderRadius: "100%", // Circular node shape
        textAlign: "center", // Center-align text within the node
        width: "fit-content", // Fit the content width dynamically
      }}
    >
      {data.label} {/* Display the label for the node */}
      {/* Source handle positioned on the right of the node */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#ffffff", // Handle background color
          borderRadius: "50%", // Circular handle shape
          border: "1px solid #ffffff", // White border for the handle
        }}
      />
      {/* Target handle positioned on the left of the node */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#ffffff", // Handle background color
          borderRadius: "50%", // Circular handle shape
          border: "1px solid #ffffff", // White border for the handle
        }}
      />
    </div>
  );
};

export default CustomNode;
