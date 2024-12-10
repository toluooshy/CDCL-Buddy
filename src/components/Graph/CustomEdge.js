import { getBezierPath, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";

import "@xyflow/react/dist/style.css";
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  // Generate a Bezier path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* The edge line */}
      <BaseEdge id={id} path={edgePath} />
      {/* The edge label */}
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              color: "#ffffff",
              background: "none",
              padding: 0,
              fontSize: 14,
              pointerEvents: "none", // Prevent interfering with edge interactions
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
