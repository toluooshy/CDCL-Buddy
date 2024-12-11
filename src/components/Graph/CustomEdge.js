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
  // Generate a Bezier path for the edge based on the provided source and target coordinates.
  // Also calculates the position (x, y) where the label should be rendered.
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, // X-coordinate of the source node
    sourceY, // Y-coordinate of the source node
    sourcePosition, // Position of the source node (e.g., top, left)
    targetX, // X-coordinate of the target node
    targetY, // Y-coordinate of the target node
    targetPosition, // Position of the target node (e.g., bottom, right)
  });

  return (
    <>
      {/* Render the edge line using the calculated Bezier path */}
      <BaseEdge id={id} path={edgePath} />

      {/* Render the edge label, if data.label is provided */}
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute", // Position the label absolutely relative to the canvas
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, // Center the label and place it at the calculated position
              color: "#ffffff", // Label text color
              background: "none", // Transparent background for the label
              padding: 0, // No padding for a clean appearance
              fontSize: 14, // Font size for the label
              pointerEvents: "none", // Allow pointer interactions to pass through the label (e.g., clicking the edge)
            }}
          >
            {data.label} {/* Display the label text */}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
