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
  // State variables for formula, clauses, and logic tracking
  const [formula, setFormula] = useState(""); // Input formula in DNF
  const [clauses, setClauses] = useState([]); // Parsed clauses
  const [variables, setVariables] = useState({}); // All variables in formula
  const [decisions, setDecisions] = useState({}); // User decisions on variables
  const [activeVariables, setActiveVariables] = useState({}); // Current variable assignments
  const [conflict, setConflict] = useState(false); // Conflict detection
  const [unsatFormula, setUnsatFormula] = useState(false); // Unsatisfiable formula flag
  const [formulaSatisfied, setFormulaSatisfied] = useState(null); // Formula satisfaction status
  const [learnedClause, setLearnedClause] = useState(null); // Learned clause (if applicable)
  const [history, setHistory] = useState([]); // History for undo functionality
  const [future, setFuture] = useState([]); // Future states for redo functionality
  const [currentLevel, setCurrentLevel] = useState(1); // Current decision level
  const [conflictModalVisible, setConflictModalVisible] = useState(false); // Conflict modal visibility
  const [unsatModalVisible, setUnsatModalVisible] = useState(false); // UNSAT modal visibility
  const [satModalVisible, setSatModalVisible] = useState(false); // SAT modal visibility
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false); // Tutorial modal visibility
  const [learnedClauseHeuristic, setLearnedClauseHeuristic] = useState("uip"); // Clause learning heuristic

  // Effect: Check implications and conflicts when activeVariables change
  useEffect(() => {
    checkImplications(activeVariables);
    detectConflict(activeVariables);
    if (clauses.length > 0) {
      checkAllSatisfied(clauses, decisions);
    }
  }, [activeVariables]);

  // Parse the input formula in DNF and return a list of clauses
  const parseDNFFormula = (input) => {
    const clausePattern = /\((.*?)\)/g; // Match clauses in parentheses
    const matches = [...input.matchAll(clausePattern)];
    return matches.map((match, index) => ({
      id: index + 1,
      data: match[1].split(",").map((lit) => lit.trim()),
    }));
  };

  // Extract unique variables from the parsed clauses
  const extractVariables = (clauses) => {
    const vars = {};
    clauses.forEach((clause) => {
      clause.data.forEach((literal) => {
        const variableName = literal.startsWith("-")
          ? literal.slice(1) // Remove "-" if negated
          : literal;
        if (!(variableName in vars)) {
          vars[variableName] = true; // Initialize variable
        }
      });
    });
    return vars;
  };

  // Handle submission of the formula
  const handleFormulaSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    const parsedClauses = parseDNFFormula(formula); // Parse the formula
    setClauses(parsedClauses); // Update clauses
    setVariables(extractVariables(parsedClauses)); // Extract and set variables
    setActiveVariables({}); // Reset active variables
    setDecisions({}); // Clear decisions
    setHistory([]); // Clear history
    setFuture([]); // Clear future states
    setCurrentLevel(1); // Reset decision level
    setFormulaSatisfied(false); // Reset satisfaction status
    setUnsatFormula(false); // Reset unsatisfiable status
    setConflictModalVisible(false); // Hide conflict modal
    setUnsatModalVisible(false); // Hide UNSAT modal
    setSatModalVisible(false); // Hide SAT modal
  };

  // Handle dropping a variable to make a decision
  const handleDropVariable = (item) => {
    const newDecision = {
      [item.name]: {
        positive: item.positive, // Value of the variable
        level: currentLevel, // Decision level
        implied: false, // Explicit decision
        clauseid: null, // No associated clause yet
        nodes: [],
        conflict: false,
      },
    };

    setHistory((prev) => [...prev, { activeVariables, decisions }]); // Save current state
    setFuture([]); // Clear redo stack
    setDecisions((prev) => ({ ...prev, ...newDecision })); // Update decisions
    setActiveVariables((prev) => ({ ...prev, [item.name]: item.positive })); // Update active variables
    setCurrentLevel(currentLevel + 1); // Increment decision level
  };

  // Undo the last decision
  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1)); // Remove last state from history
      setFuture((prev) => [{ activeVariables, decisions }, ...prev]); // Save current state to future
      setActiveVariables(lastState.activeVariables); // Restore active variables
      setDecisions(lastState.decisions); // Restore decisions
      setFormulaSatisfied(false); // Reset satisfaction status
      setUnsatFormula(false); // Reset unsatisfiable status
      setCurrentLevel(currentLevel - 1); // Decrement decision level
    }
  };

  // Redo the last undone decision
  const handleRedo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      setFuture((prev) => prev.slice(1)); // Remove from future stack
      setHistory((prev) => [...prev, { activeVariables, decisions }]); // Save to history
      setActiveVariables(nextState.activeVariables); // Restore active variables
      setDecisions(nextState.decisions); // Restore decisions
      setCurrentLevel(currentLevel + 1); // Increment decision level
    }
  };

  // Reset all states to their initial values
  const handleReset = () => {
    setFormula(""); // Clear formula
    setClauses([]); // Clear clauses
    setVariables({}); // Clear variables
    setActiveVariables({}); // Clear active variables
    setDecisions({}); // Clear decisions
    setHistory([]); // Clear history
    setFuture([]); // Clear future states
    setCurrentLevel(1); // Reset decision level
    setFormulaSatisfied(false); // Reset satisfaction status
    setUnsatFormula(false); // Reset unsatisfiable status
    setConflictModalVisible(false); // Hide conflict modal
    setUnsatModalVisible(false); // Hide UNSAT modal
    setSatModalVisible(false); // Hide SAT modal
  };

  // Helper to transform array based on a base variable
  function transformArray(inputArray, baseVariable) {
    const normalizedBase = baseVariable.replace("-", ""); // Normalize base variable
    return inputArray
      .filter((element) => element.replace("-", "") !== normalizedBase) // Exclude base variable
      .map((element) =>
        element.startsWith("-") ? element.slice(1) : `-${element}`
      ); // Negate the remaining variables
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
    // Main container div for the application with global styles
    <div
      style={{
        fontFamily: "Sono, serif, Arial, sans-serif", // Sets the font
        backgroundColor: "#323741", // Dark background for the app
        position: "fixed", // Fixes the app to occupy the entire screen
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflowY: "scroll", // Enables vertical scrolling
        userSelect: "none", // Disables text selection
      }}
    >
      {/* Header section with a gradient background and title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // Ensures content in the header is spaced apart
          alignContent: "center", // Vertically centers content
          background: "linear-gradient(to top, #222834, #13161d)", // Gradient background
          padding: 10,
          borderBottom: ".25px solid #555", // Thin bottom border
        }}
      >
        {/* App title */}
        <div style={{ width: "fit-content" }}>
          <span
            style={{
              flex: 1,
              background: "linear-gradient(to right, #f2ca74, #db69bb)", // Text gradient
              WebkitBackgroundClip: "text", // Clips gradient to the text
              WebkitTextFillColor: "transparent", // Makes the background color visible
              fontSize: 28, // Title font size
              fontWeight: 600, // Bold font weight
            }}
          >
            CDCL Buddy
          </span>
        </div>

        {/* Menu button to open tutorial modal */}
        <div
          style={{
            flex: 0,
            display: "flex",
            marginRight: 8,
          }}
          onClick={() => {
            setTutorialModalVisible(true); // Opens tutorial modal
          }}
        >
          <img src={menu} /> {/* Menu icon */}
        </div>
      </div>

      {/* Main content area */}
      <div style={{ padding: 10 }}>
        {/* Input for the user to enter the formula */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)} // Updates formula state
            placeholder="Enter your CNF formula here, e.g. (A,B)(-A,C)(-B,-C)" // Input hint
            style={{
              padding: 10, // Padding inside the input box
              flexGrow: 1, // Expands to fill available space
              border: "none",
              borderRadius: "5px 0px 0px 5px", // Rounded corners for the left side
              height: 14, // Input height
            }}
          />
          <div
            onClick={handleFormulaSubmit} // Submits the formula
            style={{
              fontFamily: "Sono, serif, Arial, sans-serif",
              height: 14,
              padding: "7px 10px 13px 10px", // Padding for the button
              background: "#f2ca74", // Button background
              color: "#13161d", // Button text color
              border: "none",
              borderRadius: "0px 5px 5px 0px", // Rounded corners for the right side
              cursor: "pointer", // Pointer cursor for clickability
            }}
          >
            Submit
          </div>
        </div>

        {/* Conditional rendering for modals */}
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

        {/* Section for variables and actions */}
        <div style={{ marginTop: 5 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // Space between variable list and actions
              marginBottom: 5,
            }}
          >
            {/* Displaying variables */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap", // Wrap variables into multiple lines if needed
                marginLeft: -5, // Negative margin for spacing adjustment
              }}
            >
              {Object.entries(variables)
                .sort(([a], [b]) => a.localeCompare(b)) // Alphabetically sorts variables
                .map(([name, positive]) => (
                  <VariableBox
                    key={name}
                    variableName={name}
                    isPositive={positive}
                    onDragStart={
                      !conflict && !formulaSatisfied && !unsatFormula
                        ? () => {}
                        : null // Prevents dragging during conflicts or solved states
                    }
                    active={!conflict && !formulaSatisfied && !unsatFormula} // Toggles interactivity
                    onToggle={() => {
                      setVariables((prev) => ({
                        ...prev,
                        [name]: !prev[name], // Toggles the variable state
                      }));
                    }}
                  />
                ))}

              {/* Button to add learned clause during conflicts */}
              {!!conflict && !unsatFormula ? (
                <div
                  onClick={() => addLearnedClause()} // Adds a learned clause
                  style={{
                    backgroundColor: "#f2ca74", // Button color
                    padding: "4px 8px", // Button padding
                    color: "#13161d",
                    borderRadius: 5, // Rounded corners
                    cursor: "pointer", // Pointer cursor
                    margin: 5,
                    fontSize: 13, // Button font size
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

            {/* Action buttons for undo, redo, and reset */}
            <div
              style={{
                display: "flex",
                height: "fit-content",
                marginTop: 5,
                fontSize: 13, // Font size for buttons
              }}
            >
              <div
                onClick={handleUndo} // Undo action
                disabled={history.length === 0} // Disabled if no history
                style={{
                  padding: "5px 10px",
                  background: history.length === 0 ? "#707682" : "#db69bb", // Color based on state
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  marginRight: "10px",
                  cursor: history.length === 0 ? "not-allowed" : "pointer", // Changes cursor
                }}
              >
                Undo
              </div>
              <div
                onClick={handleRedo} // Redo action
                disabled={future.length === 0} // Disabled if no future actions
                style={{
                  padding: "5px 10px",
                  background: future.length === 0 ? "#707682" : "#db69bb", // Color based on state
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  marginRight: "10px",
                  cursor: future.length === 0 ? "not-allowed" : "pointer", // Changes cursor
                }}
              >
                Redo
              </div>
              <div
                onClick={handleReset} // Reset action
                style={{
                  padding: "5px 10px",
                  background: "red", // Red for reset
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Reset
              </div>
            </div>
          </div>

          {/* Graph area */}
          <div style={{}}>
            <div style={{ display: "flex" }}>
              <Graph
                onDropVariable={handleDropVariable} // Handles variable drops
                playzoneData={decisions} // Passes decision data to the graph
                active={!conflict && !formulaSatisfied && !unsatFormula} // Toggles interactivity
              />
            </div>

            {/* Display the satisfying configuration if present */}
            {!!formulaSatisfied ? (
              <p style={{ color: "#ffffff" }}>
                Satisfying configuration: {formulaSatisfied}
              </p>
            ) : null}

            {/* Clause display area */}
            <div
              style={{
                overflowY: "scroll", // Scrollable clause list
                height: 180,
                backgroundColor: "#707682",
                borderRadius: 8,
                marginTop: 5,
                padding: "0px 10px", // Padding for readability
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
  );
};

export default App;
