const VariableBox = ({
  variableName,
  isPositive,
  onToggle,
  onDragStart,
  active,
}) => {
  const handleDragStart = (e) => {
    if (active) {
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ name: variableName, positive: isPositive })
      );
      onDragStart(variableName, isPositive);
    }
  };

  const handleClick = (e) => {
    if (active) {
      // Prevent drag from overriding the click event
      e.stopPropagation();
      onToggle(variableName);
    }
  };

  return (
    <div
      draggable={active ? true : false}
      onDragStart={active ? handleDragStart : null}
      onClick={active ? handleClick : null}
      style={{
        userSelect: "none",
        margin: "5px",
        padding: "4px 8px 4px 8px",
        backgroundColor: "#4c98f5",
        color: "white",
        borderRadius: "5px",
        cursor: "pointer",
        opacity: active ? 1 : 0.5,
        fontSize: 13,
      }}
    >
      {isPositive ? variableName : `¬${variableName}`}
    </div>
  );
};

export default VariableBox;
