const ConflictModal = ({ setConflictModalVisible, addLearnedClause }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#945f19", marginBottom: "15px" }}>
          Conflict detected! A learned clause can be added. 🤔
        </p>
        <button
          onClick={() => addLearnedClause()}
          style={{
            backgroundColor: "#f2ca74",
            padding: "10px 20px",
            color: "#13161d",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            margin: 5,
            marginRight: 10,
            fontSize: "16px",
          }}
        >
          <span style={{ margin: 0, padding: 0 }}>Add Learned Clause</span>
          <span style={{ marginLeft: 4, padding: 0, fontSize: 12 }}>💡</span>
        </button>
        <button
          onClick={() => setConflictModalVisible(false)}
          style={{
            padding: "11px 20px",
            backgroundColor: "#000000",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ConflictModal;
