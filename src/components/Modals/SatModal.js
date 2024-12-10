const SatModal = ({ setSatModalVisible, formulaSatisfied }) => {
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
        <p style={{ color: "#18522a", marginBottom: "15px" }}>
          Hurray! We found a way to satisfy the function! 😁
        </p>
        <p>{formulaSatisfied}</p>
        <button
          onClick={() => setSatModalVisible(false)}
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
          Done
        </button>
      </div>
    </div>
  );
};

export default SatModal;
