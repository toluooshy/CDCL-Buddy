import { useState, useEffect } from "react";

import "./App.css";
import menu from "./menu.svg";
import VariableBox from "./components/UI/VariableBox";
import Graph from "./components/Graph/Graph";
import Clause from "./components/UI/Clause";
import ConflictModal from "./components/Modals/ConflictModal";
import SatModal from "./components/Modals/SatModal";
import UnsatModal from "./components/Modals/UnsatModal";
import TutorialModal from "./components/Modals/TutorialModal";

const App = () => {
  const [formula, setFormula] = useState("");
  const [clauses, setClauses] = useState([]);
  const [variables, setVariables] = useState({});
  const [decisions, setDecisions] = useState({});
  const [activeVariables, setActiveVariables] = useState({});
  const [conflict, setConflict] = useState(false);
  const [unsatFormula, setUnsatFormula] = useState(false);
  const [formulaSatisfied, setFormulaSatisfied] = useState(null);
  const [learnedClause, setLearnedClause] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [unsatModalVisible, setUnsatModalVisible] = useState(false);
  const [satModalVisible, setSatModalVisible] = useState(false);
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false);
  const [learnedClauseHeuristic, setLearnedClauseHeuristic] = useState("uip"); // Dictates the heuristic for adding learned clauses

  useEffect(() => {
    checkImplications(activeVariables);
    detectConflict(activeVariables);
    if (clauses.length > 0) {
      checkAllSatisfied(clauses, decisions);
    }
  }, [activeVariables]);

  const parseDNFFormula = (input) => {
    const clausePattern = /\((.*?)\)/g;
    const matches = [...input.matchAll(clausePattern)];
    return matches.map((match, index) => ({
      id: index + 1,
      data: match[1].split(",").map((lit) => lit.trim()),
    }));
  };

  const extractVariables = (clauses) => {
    const vars = {};
    clauses.forEach((clause) => {
      const clauseData = clause.data;
      clauseData.forEach((literal) => {
        const variableName = literal.startsWith("-")
          ? literal.slice(1)
          : literal;
        if (!(variableName in vars)) {
          vars[variableName] = true;
        }
      });
    });
    return vars;
  };

  const handleFormulaSubmit = (e) => {
    e.preventDefault();
    const parsedClauses = parseDNFFormula(formula);
    setClauses(parsedClauses);
    setVariables(extractVariables(parsedClauses));
    setActiveVariables({});
    setDecisions({});
    setHistory([]);
    setFuture([]);
    setCurrentLevel(1);
    setFormulaSatisfied(false);
    setUnsatFormula(false);
    setConflictModalVisible(false);
    setUnsatModalVisible(false);
    setSatModalVisible(false);
  };

  const handleDropVariable = (item) => {
    const newDecision = {
      [item.name]: {
        positive: item.positive,
        level: currentLevel,
        implied: false,
        clauseid: null,
        nodes: [],
        conflict: false,
      },
    };

    setHistory((prev) => [...prev, { activeVariables, decisions }]);
    setFuture([]);
    setDecisions((prev) => ({ ...prev, ...newDecision }));
    setActiveVariables((prev) => ({ ...prev, [item.name]: item.positive }));
    setCurrentLevel(currentLevel + 1);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setFuture((prev) => [{ activeVariables, decisions }, ...prev]);
      setActiveVariables(lastState.activeVariables);
      setDecisions(lastState.decisions);
      setFormulaSatisfied(false);
      setUnsatFormula(false);
      setCurrentLevel(currentLevel - 1);
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      setFuture((prev) => prev.slice(1));
      setHistory((prev) => [...prev, { activeVariables, decisions }]);
      setActiveVariables(nextState.activeVariables);
      setDecisions(nextState.decisions);
      setCurrentLevel(currentLevel + 1);
    }
  };

  const handleReset = () => {
    setFormula("");
    setClauses([]);
    setVariables({});
    setActiveVariables({});
    setDecisions({});
    setHistory([]);
    setFuture([]);
    setCurrentLevel(1);
    setFormulaSatisfied(false);
    setUnsatFormula(false);
    setConflictModalVisible(false);
    setUnsatModalVisible(false);
    setSatModalVisible(false);
  };

  function transformArray(inputArray, baseVariable) {
    const normalizedBase = baseVariable.replace("-", "");

    return inputArray
      .filter((element) => element.replace("-", "") !== normalizedBase)
      .map((element) =>
        element.startsWith("-") ? element.slice(1) : `-${element}`
      );
  }

  const checkImplications = (activeVariables) => {
    const implications = [];
    let seenLiterals = new Set();

    clauses.forEach((clause) => {
      let unsatisfiedCount = 0;
      let potentialLiteral = null;
      let highestLevel = 0;

      for (const literal of clause.data) {
        const variable = literal.replace("-", ""); // Extract variable name
        const isNegated = literal.startsWith("-");

        if (activeVariables.hasOwnProperty(variable)) {
          const value = activeVariables[variable];
          const isSatisfied = (isNegated && !value) || (!isNegated && value);

          if (isSatisfied) {
            return; // Clause satisfied
          }
        } else {
          if (potentialLiteral === null) {
            potentialLiteral = literal;
          }
          unsatisfiedCount++;
        }

        // Track the highest decision level of variables in the clause
        if (decisions[variable]) {
          highestLevel = Math.max(highestLevel, decisions[variable].level);
        }
      }

      if (unsatisfiedCount === 1 && potentialLiteral !== null) {
        const variable = potentialLiteral.replace("-", "");
        const isNegated = potentialLiteral.startsWith("-");
        if (!seenLiterals.has(variable)) {
          implications.push({
            variable,
            positive: !isNegated,
            level: highestLevel,
            clause: clause,
            nodes: transformArray(
              clause.data,
              isNegated ? `-${variable}` : variable
            ),
          });
        }
        seenLiterals.add(variable);
      }
    });

    implications.forEach(({ variable, positive, level, clause }) => {
      setActiveVariables((prev) => ({
        ...prev,
        [variable]: positive,
      }));
      setDecisions((prev) => ({
        ...prev,
        [variable]: {
          positive,
          level,
          implied: true,
          clauseid: clause.id,
          nodes: transformArray(
            clause.data,
            !positive ? `-${variable}` : variable
          ),
          conflict: false,
        },
      }));
      if (level === 0) {
        setUnsatFormula(true);
        setUnsatModalVisible(true);
        setConflictModalVisible(false);
        setDecisions((prev) => ({
          ...prev,
          ["κ"]: {
            positive: true,
            level: 0,
            implied: true,
            clauseid: clause.id,
            nodes: [variable],
            conflict: true,
          },
        }));
      }
    });
  };

  const detectConflict = (activeVariables) => {
    let conflictDetails = null;

    const hasConflict = clauses.some((clause) => {
      const isConflicting = clause.data.every((literal) => {
        const negated = literal.startsWith("-");
        const variable = negated ? literal.substring(1) : literal;
        const value = activeVariables[variable];
        return value !== undefined && value === negated;
      });

      if (isConflicting) {
        conflictDetails = {
          clause,
          conflictingVariables: clause.data.map((literal) => {
            const negated = literal.startsWith("-");
            const variable = negated ? literal.substring(1) : literal;
            return {
              variable,
              expected: !negated,
              actual: activeVariables[variable],
            };
          }),
        };
      }

      return isConflicting;
    });

    if (hasConflict) {
      setConflict(true);

      const highestLevel = Math.max(
        ...Object.values(decisions).map((node) => node.level)
      );

      const highestLevelNodes = Object.entries(decisions).reduce(
        (acc, [key, value]) => {
          if (value.level === highestLevel) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const graph = {};
      let levelNodes = [];
      Object.keys(highestLevelNodes).forEach((node) => {
        levelNodes = [
          ...levelNodes,
          highestLevelNodes[node].positive ? node : `-${node}`,
        ];
      });
      Object.keys(highestLevelNodes).forEach((node) => {
        const label = highestLevelNodes[node].positive ? node : `-${node}`;
        graph[label] = {
          parents: highestLevelNodes[node].nodes.filter((parent) =>
            levelNodes.includes(parent)
          ),
        };
      });
      const candidateNodes = Object.keys(graph);

      function findNegatedMatches(conflictNodes, candidateNodes) {
        // Create a set of negated versions of the nodes in conflictNodes
        const negatedSet = new Set(
          conflictNodes.map((node) => {
            return node.startsWith("-") ? node.substring(1) : "-" + node;
          })
        );

        // Find nodes from candidateNodes that have their negated versions in array1
        const result = candidateNodes.filter((node) => {
          return negatedSet.has(node);
        });

        return result;
      }

      const conflictParents = findNegatedMatches(
        conflictDetails.clause.data,
        candidateNodes
      );

      setDecisions((prev) => ({
        ...prev,
        ["κ"]: {
          positive: true,
          level: currentLevel - 1,
          implied: true,
          clauseid: conflictDetails.clause.id,
          nodes: conflictParents,
          conflict: true,
        },
      }));
      graph["κ"] = { parents: conflictParents };

      const fullgraph = {};
      Object.keys(decisions).forEach((node) => {
        const label = decisions[node].positive ? node : `-${node}`;
        fullgraph[label] = {
          parents: decisions[node].nodes,
        };
      });
      fullgraph["κ"] = { parents: conflictParents };

      if (learnedClauseHeuristic === "uip") {
        const uips = findUIP(graph);

        const grandparents = findGrandparentsWithoutBlacklistedChildren(
          fullgraph,
          uips
        );

        const learned = learnClauseUIP(uips, grandparents);
        setLearnedClause({
          id: clauses.length + 1,
          data: learned,
          learned: true,
        });
      } else if (learnedClauseHeuristic === "neg") {
        const learned = learnClauseNEG(decisions);
        setLearnedClause({
          id: clauses.length + 1,
          data: learned,
          learned: true,
        });
      }
      if (!unsatFormula) {
        setConflictModalVisible(true);
      }
    } else {
      setConflict(false);
    }
  };

  const findUIP = (graph) => {
    // Helper function to perform DFS and track paths
    function dfs(node, graph, path, allPaths) {
      path.push(node);

      if (!graph[node] || graph[node].parents.length === 0) {
        // If no parents (leaf node), record the path
        allPaths.push([...path]);
      } else {
        // Traverse all parents
        for (const parent of graph[node].parents) {
          dfs(parent, graph, path, allPaths);
        }
      }

      path.pop(); // Backtrack
    }

    // Reverse the graph (to make it parent -> child relationships)
    let reversedGraph = {};
    for (let node in graph) {
      const parents = graph[node].parents;
      parents.forEach((parent) => {
        if (!reversedGraph[parent]) {
          reversedGraph[parent] = { parents: [] };
        }
        reversedGraph[parent].parents.push(node);
      });
    }

    // Find all paths starting from leaf nodes (nodes with no parents)
    let leafNodes = Object.keys(graph).filter(
      (node) => graph[node].parents.length === 0
    );
    let allPaths = [];

    // Perform DFS from each leaf node
    leafNodes.forEach((leaf) => {
      dfs(leaf, reversedGraph, [], allPaths);
    });

    // Find common nodes across all paths
    if (allPaths.length > 0) {
      let commonNodes = new Set(allPaths[0]);

      // Intersect with nodes from other paths
      allPaths.slice(1).forEach((path) => {
        commonNodes = new Set(
          [...commonNodes].filter((node) => path.includes(node))
        );
      });

      return Array.from(commonNodes).slice(0, -1);
    }

    return [];
  };

  function findGrandparentsWithoutBlacklistedChildren(graph, blacklist) {
    // Get the parents of the given node
    const parents = graph["κ"] ? graph["κ"].parents : [];

    // Collect the grandparents by looking at the parents of the parents
    const grandparentsSet = new Set();

    // Set of parents of the node, so we can filter them out from grandparents
    const parentsSet = new Set(parents);

    parents.forEach((parent) => {
      const parentOfParent = graph[parent] ? graph[parent].parents : [];
      parentOfParent.forEach((grandparent) => {
        // Exclude if the grandparent is also a parent of the node
        if (parentsSet.has(grandparent)) return; // Skip if grandparent is already a parent

        // Exclude if the grandparent itself is blacklisted
        if (blacklist.includes(grandparent)) return; // Skip if grandparent is blacklisted

        // Exclude if the grandparent has blacklisted children
        if (hasBlacklistedChildren(grandparent, blacklist, graph)) {
          return; // Skip this grandparent if it has blacklisted children
        }

        // Add valid grandparent to the set
        grandparentsSet.add(grandparent);
      });
    });

    // Convert the set to an array and return
    return Array.from(grandparentsSet);
  }

  // Helper function to check if a grandparent has any blacklisted children
  function hasBlacklistedChildren(grandparent, blacklist, graph) {
    if (!graph[grandparent]) return false;

    // Get all children of the grandparent (parents are children of the grandparent)
    const children = graph[grandparent].parents;

    // Check if any child is in the blacklist
    return children.some((child) => blacklist.includes(child));
  }

  const learnClauseUIP = (uips, grandparents) => {
    const firstUip = uips.pop();
    const grandparent = grandparents[0];
    let learningClause = [];
    if (!!grandparent) {
      learningClause.push(
        !grandparent.startsWith("-") ? `-${grandparent}` : grandparent.slice(1)
      );
    }
    if (!!firstUip) {
      learningClause.push(
        !firstUip.startsWith("-") ? `-${firstUip}` : firstUip.slice(1)
      );
    }

    return learningClause;
  };

  const learnClauseNEG = (decisions) => {
    return Object.keys(decisions)
      .filter((key) => !decisions[key].implied)
      .map((key) => (decisions[key].positive ? `-${key}` : key));
  };

  const addLearnedClause = () => {
    setClauses((prev) => [...prev, learnedClause]);
    setActiveVariables({});
    setDecisions({});
    setCurrentLevel(1);
    setConflict(false);
  };

  const checkAllSatisfied = async (currentClauses, currentDecisions) => {
    // Check each clause
    for (const clause of currentClauses) {
      let clauseSatisfied = false;

      // Check each literal in the clause
      for (const literal of clause.data) {
        const isNegated = literal.startsWith("-");
        const literalName = isNegated ? literal.slice(1) : literal;

        // Ensure the literal is in the current decisions
        const decision = currentDecisions[literalName];

        if (decision) {
          // Check if the literal satisfies the clause
          if (
            (isNegated && !decision.positive) ||
            (!isNegated && decision.positive)
          ) {
            clauseSatisfied = true;
            break; // No need to check further literals if the clause is already satisfied
          }
        }
      }

      // If a clause is not satisfied, return false
      if (!clauseSatisfied) {
        return false;
      }
    }

    const literals = [];

    // Iterate over each decision
    for (const variable in currentDecisions) {
      if (currentDecisions.hasOwnProperty(variable)) {
        const decision = currentDecisions[variable];

        // If positive is true, include the variable name (e.g., "x2")
        // If positive is false, include the negation (e.g., "-x5")
        if (decision.positive) {
          literals.push(variable); // variable is positive
        } else {
          literals.push(`-${variable}`); // variable is negated
        }
      }
    }
    setFormulaSatisfied(`(${literals.join(" ∧ ")})`);
    setSatModalVisible(true);
    return true;
  };

  return (
    <div
      style={{
        fontFamily: "Sono, serif, Arial, sans-serif",
        backgroundColor: "#323741",
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflowY: "scroll",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "center",
          background: "linear-gradient(to top, #222834, #13161d)",
          padding: 10,
          borderBottom: ".25px solid #555",
        }}
      >
        <div style={{ width: "fit-content" }}>
          <span
            style={{
              flex: 1,
              padding: 0,
              margin: 0,
              background: "linear-gradient(to right, #f2ca74, #db69bb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 10,
              width: "fit-content",
            }}
          >
            CDCL Buddy
          </span>
        </div>
        <div
          style={{
            flex: 0,
            display: "flex",
            marginRight: 8,
          }}
          onClick={() => {
            setTutorialModalVisible(true);
          }}
        >
          <img src={menu} />
        </div>
      </div>
      <div style={{ padding: 10 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Enter your CNF formula here, e.g. (A,B)(-A,C)(-B,-C)"
            style={{
              padding: 10,
              flexGrow: 1, // Makes the input expand to fill the available space
              border: "none",
              borderRadius: "5px 0px 0px 5px",
              height: 14,
            }}
          />
          <div
            onClick={handleFormulaSubmit}
            style={{
              fontFamily: "Sono, serif, Arial, sans-serif",
              height: 14,
              padding: "7px 10px 13px 10px",
              background: "#f2ca74",
              color: "#13161d",
              border: "none",
              borderRadius: "0px 5px 5px 0px",
              cursor: "pointer",
            }}
          >
            Submit
          </div>
        </div>

        {conflict && conflictModalVisible && (
          <ConflictModal
            setConflictModalVisible={setConflictModalVisible}
            addLearnedClause={addLearnedClause}
          />
        )}

        {unsatFormula && unsatModalVisible && (
          <UnsatModal setUnsatModalVisible={setUnsatModalVisible} />
        )}

        {clauses.length > 0 && !!formulaSatisfied && satModalVisible && (
          <SatModal
            setSatModalVisible={setSatModalVisible}
            formulaSatisfied={formulaSatisfied}
          />
        )}
        {tutorialModalVisible && (
          <TutorialModal
            setTutorialModalVisible={setTutorialModalVisible}
            learnedClauseHeuristic={learnedClauseHeuristic}
            setLearnedClauseHeuristic={setLearnedClauseHeuristic}
          />
        )}

        <div style={{ marginTop: 5 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginLeft: -5,
              }}
            >
              {Object.entries(variables)
                .sort(([a], [b]) => a.localeCompare(b)) // Sort by variable name (key)
                .map(([name, positive]) => (
                  <VariableBox
                    key={name}
                    variableName={name}
                    isPositive={positive}
                    onDragStart={
                      !conflict && !formulaSatisfied && !unsatFormula
                        ? () => {}
                        : null
                    }
                    active={!conflict && !formulaSatisfied && !unsatFormula}
                    onToggle={() => {
                      setVariables((prev) => ({
                        ...prev,
                        [name]: !prev[name],
                      }));
                    }}
                  />
                ))}
              {!!conflict && !unsatFormula ? (
                <div
                  onClick={() => addLearnedClause()}
                  style={{
                    backgroundColor: "#f2ca74",
                    padding: "4px 8px 4px 8px",
                    color: "#13161d",
                    borderRadius: 5,
                    cursor: "pointer",
                    margin: 5,
                    marginLeft: 5,
                    fontSize: 13,
                  }}
                >
                  <span style={{ margin: 0, padding: 0 }}>
                    Add Learned Clause
                  </span>
                  <span style={{ marginLeft: 4, padding: 0, fontSize: 10 }}>
                    💡
                  </span>
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                height: "fit-content",
                marginTop: 5,
                fontSize: 13,
              }}
            >
              <div
                onClick={handleUndo}
                disabled={history.length === 0}
                style={{
                  padding: "5px 10px",
                  background: history.length === 0 ? "#707682" : "#db69bb",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  marginRight: "10px",
                  cursor: history.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Undo
              </div>
              <div
                onClick={handleRedo}
                disabled={future.length === 0}
                style={{
                  padding: "5px 10px",
                  background: future.length === 0 ? "#707682" : "#db69bb",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  marginRight: "10px",
                  cursor: future.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Redo
              </div>
              <div
                onClick={handleReset}
                style={{
                  padding: "5px 10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Reset
              </div>
            </div>
          </div>
          <div style={{}}>
            <div>
              <div style={{ display: "flex" }}>
                <Graph
                  onDropVariable={handleDropVariable}
                  playzoneData={decisions}
                  active={!conflict && !formulaSatisfied && !unsatFormula}
                />
              </div>

              {!!formulaSatisfied ? (
                <p style={{ color: "#ffffff" }}>
                  Satisfying configuration: {formulaSatisfied}
                </p>
              ) : null}
              <div
                style={{
                  overflowY: "scroll",
                  height: 180,
                  backgroundColor: "#707682",
                  borderRadius: 8,
                  marginTop: 5,
                  padding: "0px 10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexWrap: "wrap",
                    paddingBottom: 10,
                  }}
                >
                  {clauses.map((clause, index) => (
                    <Clause
                      key={index}
                      clause={clause}
                      activeVariables={activeVariables}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
