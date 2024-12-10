const Clause = ({ clause, activeVariables }) => {
  const isSatisfied = clause.data.some((literal) => {
    const negated = literal.startsWith("-");
    const variable = negated ? literal.substring(1) : literal;
    return negated
      ? activeVariables[variable] === false
      : activeVariables[variable] === true;
  });

  return (
    <div
      style={{
        margin: "10px 10px 0px 0px",
        padding: "10px",
        backgroundColor: isSatisfied ? "#d4edda" : "#f8d7da",
        border: `1px solid ${isSatisfied ? "#c3e6cb" : "#f5c6cb"}`,
        fontSize: 12,
        borderRadius: 5,
        height: "fit-content",
        userSelect: "auto",
      }}
    >
      C{clause.id}: (
      {clause.data
        .map(
          (literal, index) =>
            `${literal}${index < clause.data.length - 1 ? "∨" : ""}`
        )
        .join("")}
      ) {clause.learned ? " 💡" : ""}
    </div>
  );
};

export default Clause;
