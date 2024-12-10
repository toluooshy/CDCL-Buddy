const UnsatModal = ({ setUnsatModalVisible, addLearnedClause }) => {
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
        <p style={{ color: "#721c24", marginBottom: "15px" }}>
          This formula is unsatisfiable! 😩
        </p>

        <button
          onClick={() => setUnsatModalVisible(false)}
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

export default UnsatModal;
