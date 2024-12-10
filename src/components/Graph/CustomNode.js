import { Handle, Position } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const CustomNode = ({ data }) => {
  return (
    <div
      style={{
        padding: "12.5px 15px",
        border: `1px solid ${
          data.conflict ? "#c24c46" : data.implied ? "#f8f8f8" : "#4c98f5"
        }`,
        color: data.conflict ? "#c24c46" : data.implied ? "#f8f8f8" : "#4c98f5",
        borderRadius: "100%",
        textAlign: "center",
        width: "fit-content",
      }}
    >
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#ffffff",
          borderRadius: "50%",
          border: "1px solid #ffffff",
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          type: "target",
          background: "#ffffff",
          borderRadius: "50%",
          border: "1px solid #ffffff",
        }}
      />
    </div>
  );
};

export default CustomNode;
