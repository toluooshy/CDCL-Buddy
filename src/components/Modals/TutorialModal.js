import { useState } from "react";
import arrow from "../../arrow.svg";
import graph1 from "../../images/graph1.png";
import graph2 from "../../images/graph2.png";
import graph3 from "../../images/graph3.png";
import graph4 from "../../images/graph4.png";
import graph5 from "../../images/graph5.png";
import demo from "../../images/demo.gif";

const TutorialModal = ({
  setTutorialModalVisible,
  learnedClauseHeuristic,
  setLearnedClauseHeuristic,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);

  const modes = {
    uip: {
      title: "First UIP",
      description:
        "The First Unique Implication Point (UIP) heuristic is a technique used in SAT solvers to identify efficient learned clauses during conflict analysis. When a conflict occurs in the implication graph, this heuristic identifies the first UIP, which is the unique decision node encountered while traversing back from the conflict clause toward the decision level. The clause generated based on this UIP is used as a learned clause because it provides the most significant pruning of the search space, helping to avoid similar conflicts in the future.",
      images: [graph1, graph3, graph4, graph5],
    },
    neg: {
      title: "Negated Decisions",
      description:
        "In this approach, when a conflict is encountered, the solver identifies the sequence of decision literals (the trail of decisions) that led to the conflict. It then generates a learned clause by negating the combination of these decisions. This learned clause represents a new constraint, explicitly forbidding the solver from revisiting the same combination of decisions, effectively pruning the search space.",
      images: [graph1, graph2],
    },
  };

  const currentImages = modes[learnedClauseHeuristic].images;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === currentImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  const papers = [
    {
      title: "GRASP—A New Search Algorithm for Satisfiability",
      link: "https://dl.acm.org/doi/10.5555/244522.244560",
      summary: `
        The GRASP paper introduces a SAT-solving algorithm that combines systematic search techniques with 
        conflict analysis. GRASP leverages clause learning and non-chronological backtracking, which form 
        the foundation of modern CDCL solvers. The key innovation is the conflict-driven clause learning 
        approach, allowing the solver to analyze conflicts to derive new clauses and improve the search process.
      `,
      relation: `
        CDCL Buddy implements concepts introduced in GRASP, such as clause learning and conflict analysis. 
        By visualizing the solver's implication graph and non-chronological backtracking, CDCL Buddy helps 
        users understand GRASP's innovations. Future enhancements could include modules or example problems 
        that highlight the historical significance of GRASP in modern SAT solvers.
      `,
    },
    {
      title: "Propositional SAT Solving(Handbook of Model Checking 2018)",
      link: "https://collaborate.princeton.edu/en/publications/propositional-sat-solving",
      summary: `
        This work provides a comprehensive overview of propositional SAT solving, covering theoretical 
        foundations and practical implementations. It discusses key components like CDCL, preprocessing 
        techniques, heuristics, and applications in verification, planning, and optimization, highlighting 
        SAT solving's broader implications in computer science.
      `,
      relation: `
        CDCL Buddy could incorporate educational content from this paper, such as preprocessing techniques 
        or applications of SAT solvers. Adding a "history" or "foundations" section to the app would deepen 
        its value as a learning resource, aligning the tool with concepts discussed in this reference.
      `,
    },
    {
      title: "The Quest for Efficient Boolean Satisfiability Solvers",
      link: "https://link.springer.com/chapter/10.1007/3-540-45620-1_26",
      summary: `
        This paper surveys the ongoing efforts to improve SAT solvers' efficiency, discussing optimization 
        strategies like decision heuristics, clause learning, and restart policies. It highlights the 
        balance between theoretical advancements and practical implementations to enhance solver performance.
      `,
      relation: `
        CDCL Buddy can showcase optimization strategies from this paper, such as customizable heuristics 
        or restart policies. By allowing users to toggle solver configurations and visualize their impacts, 
        the tool aligns with the pursuit of efficient SAT solving.
      `,
    },
    {
      title: "Multiple Decision Making in Conflict-Driven Clause Learning",
      link: "https://ieeexplore.ieee.org/document/9288221",
      summary: `
        This paper explores how decision-making strategies affect performance in CDCL solvers. It highlights 
        the role of heuristics in guiding decisions, showing their impact on conflict resolution and clause 
        learning efficiency.
      `,
      relation: `
        CDCL Buddy focuses on decision heuristics and their impact on solving. Future enhancements could 
        include features to explore multiple decision-making strategies, visualizing their effects in 
        real-time to practically demonstrate concepts from this paper.
      `,
    },
    {
      title:
        "Better Decision Heuristics in CDCL through Local Search and Target Phases",
      link: "https://www.jair.org/index.php/jair/article/view/13666",
      summary: `
        This paper proposes new decision heuristics combining CDCL techniques with local search ideas, 
        particularly through target phases. These heuristics aim to improve solver efficiency in finding 
        satisfying assignments.
      `,
      relation: `
        CDCL Buddy could expand its heuristic options to include those proposed in this paper. By enabling 
        users to experiment with local search and hybrid techniques, the app can align with cutting-edge 
        advancements in SAT solving.
      `,
    },
  ];

  const currentPapers = papers;

  const handleNextPaper = () => {
    setCurrentPaperIndex((prev) =>
      prev === currentPapers.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevPaper = () => {
    setCurrentPaperIndex((prev) =>
      prev === 0 ? currentPapers.length - 1 : prev - 1
    );
  };

  const getOS = () => {
    // To dictate how external links are opened
    const userAgent = navigator.userAgent;
    let os = null;

    if (/Windows NT 10.0/.test(userAgent)) {
      os = "Windows 10";
    } else if (/Windows NT 6.3/.test(userAgent)) {
      os = "Windows 8.1";
    } else if (/Windows NT 6.2/.test(userAgent)) {
      os = "Windows 8";
    } else if (/Windows NT 6.1/.test(userAgent)) {
      os = "Windows 7";
    } else if (/Windows NT 6.0/.test(userAgent)) {
      os = "Windows Vista";
    } else if (/Windows NT 5.1/.test(userAgent)) {
      os = "Windows XP";
    } else if (/Macintosh/.test(userAgent)) {
      os = "Mac OS";
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      os = "iOS";
    } else if (/Android/.test(userAgent)) {
      os = "Android";
    } else if (/Linux/.test(userAgent)) {
      os = "Linux";
    }

    return os;
  };

  const openInNewTab = async (url) => {
    const os = getOS();
    console.log(os);
    if (os === "iOS" || os === "Android") {
      try {
        await navigator.clipboard.writeText(url);
        alert(`URL copied to clipboard:\n${url}`);
      } catch (err) {
        console.error("Failed to copy URL to clipboard:", err);
      }
      window.open(
        url,
        "_blank",
        "noopener,noreferrer,scrollbars=yes,resizable=yes"
      );
    } else {
      window.open(url, "_blank", "noreferrer");
    }
  };

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
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            onClick={() => {
              setActiveTab(Math.max(activeTab - 1, 0));
            }}
          >
            <img src={arrow} />
          </div>

          {activeTab === 0 ? (
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                How to Use CDCL Buddy
              </div>
              <img src={demo} style={{ width: "100%" }} />
              <div
                style={{
                  fontSize: 13,
                  overflowY: "scroll",
                  height: 300,
                  margin: "10px 0px 10px 0px",
                }}
              >
                <ol>
                  <li>
                    <strong>Input Your Formula:</strong>
                    <div>
                      At the top of the interface, you will find an input box
                      labeled <em>"Enter your CNF formula here."</em>
                      Type a CNF (Conjunctive Normal Form) formula in the format{" "}
                      <code>(A,B)(-A,C)(-B,-C)</code> and press the{" "}
                      <strong>Submit</strong> button.
                    </div>
                    <br />
                  </li>
                  <li>
                    <strong>Visualize the Graph:</strong>
                    <div>
                      Once you submit the formula, the interface will generate a
                      visualization of the SAT-solving process. The implication
                      graph dynamically updates as the CDCL solver processes the
                      formula.
                    </div>
                    <br />
                  </li>
                  <li>
                    <strong>Interactive Features:</strong>
                    <ul>
                      <li>
                        <strong>Undo/Redo Buttons:</strong> Use these to revert
                        or reapply actions during your exploration.
                      </li>
                      <li>
                        <strong>Reset Button:</strong> This clears the current
                        state, allowing you to start fresh with a new formula.
                      </li>
                    </ul>
                    <br />
                  </li>
                  <li>
                    <strong>Graph Controls:</strong>
                    <div>
                      Use the <strong>zoom in/out</strong> and{" "}
                      <strong>reset view</strong> buttons on the left-hand
                      toolbar to navigate and adjust the graph for better
                      visibility.
                    </div>
                    <br />
                  </li>
                  <li>
                    <strong>Output Window:</strong>
                    <div>
                      The panel at the bottom provides textual feedback or logs
                      related to the solver's progress, including
                      decision-making, conflict detection, and learned clauses.
                    </div>
                    <br />
                  </li>
                  <li>
                    <strong>Experiment and Learn:</strong>
                    <div>
                      Modify the CNF formula or interact with the graph to
                      observe how the solver reacts to different configurations.
                      Explore heuristics and their impact on the SAT-solving
                      process.
                    </div>
                    <br />
                  </li>
                </ol>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Tips for Best Use:
                </div>
                <ul>
                  <li>
                    Start with simple CNF formulas to familiarize yourself with
                    the tool’s interface and solver behavior.
                  </li>
                  <li>
                    Use the visual updates to observe how conflicts are detected
                    and resolved in real-time.
                  </li>
                  <li>
                    Experiment with the drag-and-drop functionality to deepen
                    your understanding of how implication graphs evolve.
                  </li>
                  <br />
                </ul>
              </div>
            </div>
          ) : activeTab === 1 ? (
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Learned Clause Heuristics
              </div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>
                (Press one of the buttons below to alter CDCL Buddy's algorithm)
              </div>
              <div style={{ display: "flex" }}>
                {["uip", "neg"].map((mode) => (
                  <div
                    style={{
                      backgroundColor: "#000000",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "5px 20px",
                      fontSize: 12,
                      margin: "0px 10px 10px 0px",
                      opacity: learnedClauseHeuristic === mode ? 1 : 0.5,
                    }}
                    onClick={() => {
                      setLearnedClauseHeuristic(mode);
                    }}
                  >
                    {modes[mode].title}
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: 13,
                  marginTop: 10,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                {modes[learnedClauseHeuristic].title}
              </div>
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  onClick={() => {
                    handlePrevImage();
                  }}
                  style={{ paddingTop: "25%", marginRight: 10 }}
                >
                  <img src={arrow} />
                </div>

                <img
                  src={currentImages[currentImageIndex]}
                  style={{ width: "80%", borderRadius: "10px" }}
                  alt="Carousel"
                />

                <div
                  onClick={() => {
                    handleNextImage();
                  }}
                  style={{ paddingTop: "25%", marginLeft: 10 }}
                >
                  <img src={arrow} style={{ transform: "rotate(180deg)" }} />
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  marginTop: 10,
                  marginBottom: 30,
                }}
              >
                {modes[learnedClauseHeuristic].description}
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                More Reading
              </div>

              <div
                style={{
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  onClick={() => {
                    handlePrevPaper();
                  }}
                  style={{ paddingTop: "25%", marginRight: 10 }}
                >
                  <img src={arrow} />
                </div>

                <div
                  style={{
                    marginBottom: "30px",
                    paddingBottom: "20px",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}
                    onClick={() => {
                      openInNewTab(currentPapers[currentPaperIndex].link);
                    }}
                  >
                    {currentPapers[currentPaperIndex].title} 🚀
                  </div>
                  <div style={{ fontWeight: 600 }}>Summary:</div>
                  <div style={{ marginBottom: 10 }}>
                    {currentPapers[currentPaperIndex].summary}
                  </div>
                  <div style={{ fontWeight: 600 }}>Relation to CDCL Buddy:</div>
                  <div>{currentPapers[currentPaperIndex].relation}</div>
                </div>

                <div
                  onClick={() => {
                    handleNextPaper();
                  }}
                  style={{ paddingTop: "25%", marginLeft: 10 }}
                >
                  <img src={arrow} style={{ transform: "rotate(180deg)" }} />
                </div>
              </div>
            </div>
          )}

          <div
            onClick={() => {
              setActiveTab(Math.min(activeTab + 1, 2));
            }}
          >
            <img src={arrow} style={{ transform: "rotate(180deg)" }} />
          </div>
        </div>
        <div style={{ width: "100%", textAlign: "center", marginTop: 10 }}>
          <button
            onClick={() => setTutorialModalVisible(false)}
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
    </div>
  );
};

export default TutorialModal;
