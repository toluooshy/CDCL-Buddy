import React, { useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Handle,
  Position,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import "./App.css";
import menu from "./menu.svg";

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
        backgroundColor: "#2b6bba",
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

const CustomNode = ({ data }) => {
  return (
    <div
      style={{
        padding: "12.5px 15px",
        border: `1px solid ${
          data.conflict ? "#c24c46" : data.implied ? "#f8f8f8" : "#4b8dde"
        }`,
        color: data.conflict ? "#c24c46" : data.implied ? "#f8f8f8" : "#4b8dde",
        borderRadius: "100%",
        textAlign: "center",
        width: "fit-content",
      }}
    >
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#ffffff",
          borderRadius: "50%",
          border: "1px solid #ffffff",
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          type: "target",
          background: "#ffffff",
          borderRadius: "50%",
          border: "1px solid #ffffff",
        }}
      />
    </div>
  );
};

// Register custom node type
const nodeTypes = {
  customNode: CustomNode,
};

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

const edgeTypes = {
  customEdge: CustomEdge,
};

const PlayzoneGraph = ({ playzoneData, onDropVariable, active }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const levelSpacing = 100; // Vertical spacing between levels
  const nodeSpacing = 120; // Horizontal spacing between nodes

  const handleDragOver = (e) => {
    if (active) {
      e.preventDefault();
    }
  };

  const handleDrop = (e) => {
    if (active) {
      e.preventDefault();
      const item = JSON.parse(e.dataTransfer.getData("text/plain"));
      onDropVariable(item);
    }
  };

  // Generate nodes and edges based on playzoneData
  useEffect(() => {
    const initialNodes = [];
    const initialEdges = [];
    const levelGroups = {};

    // Group nodes by levels
    Object.entries(playzoneData).forEach(([key, value]) => {
      if (!levelGroups[value.level]) {
        levelGroups[value.level] = [];
      }
      levelGroups[value.level].push(key);
    });

    // Create nodes with default positions
    Object.entries(playzoneData).forEach(([key, value]) => {
      const levelIndex = levelGroups[value.level].indexOf(key);
      const numNodesInLevel = levelGroups[value.level].length;

      const xOffset =
        250 -
        (numNodesInLevel - 1) * (nodeSpacing / 2) +
        levelIndex * nodeSpacing;
      const yOffset =
        value.level * (levelSpacing / 2) + (value.clauseid * nodeSpacing) / 5;

      initialNodes.push({
        id: key,
        type: "customNode",
        data: {
          conflict: value.conflict,
          implied: value.implied,
          label: value.positive
            ? `${key} @ ${value.level}`
            : `-${key} @ ${value.level}`,
        },
        position: { x: xOffset, y: yOffset },
        draggable: true,
      });

      // Add edges for implied relationships
      if (value.implied && value.nodes.length > 0) {
        value.nodes.forEach((source) => {
          initialEdges.push({
            id: `e-${source}-${key}`,
            type: "customEdge",
            source: source.replace("-", ""),
            target: key,
            data: {
              label: `C${value.clauseid}`,
            },
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
              width: 20,
              height: 20,
              color: "#ffffff",
            },
          });
        });
      }
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [playzoneData]);

  const onNodesChange = (changes) => {
    if (nodes) {
      setNodes((nodes) => applyNodeChanges(changes, nodes));
    }
  };

  const onEdgesChange = (changes) => {
    if (edges) {
      setEdges((edges) => applyEdgeChanges(changes, edges));
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: 320,
        margin: "5px auto",
        backgroundColor: "#13161d",
        borderRadius: 8,
      }}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} size={0.75} />
      </ReactFlow>
    </div>
  );
};

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

      const uips = findUIP(graph);

      const grandparents = findGrandparentsWithoutBlacklistedChildren(
        fullgraph,
        uips
      );

      const learned = learnClause(uips, grandparents);
      setLearnedClause({
        id: clauses.length + 1,
        data: learned,
        learned: true,
      });
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

  const learnClause = (uips, grandparents) => {
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
        >
          <img src={menu} />
          {/* <p
            style={{
              padding: 0,
              margin: 0,
              marginRight: 20,
              color: "#f2ca74",
              fontSize: 15,
              width: "fit-content",
            }}
          >
            Tutorial
          </p>
          <p
            style={{
              padding: 0,
              margin: 0,
              color: "#f2ca74",
              fontSize: 15,
              width: "fit-content",
            }}
          >
            About
          </p> */}
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
              padding: "10px",
              flexGrow: 1, // Makes the input expand to fill the available space
              border: "none",
              borderRadius: "5px 0px 0px 5px",
            }}
          />
          <button
            onClick={handleFormulaSubmit} // Changed from onSubmit
            style={{
              padding: "10px 20px",
              background: "#f2ca74",
              color: "#13161d",
              border: "none",
              borderRadius: "0px 5px 5px 0px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>

        {conflict && conflictModalVisible && (
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
                <span style={{ margin: 0, padding: 0 }}>
                  Add Learned Clause
                </span>
                <span style={{ marginLeft: 4, padding: 0, fontSize: 12 }}>
                  💡
                </span>
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
        )}

        {unsatFormula && unsatModalVisible && (
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
        )}

        {clauses.length > 0 && !!formulaSatisfied && satModalVisible && (
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
                <PlayzoneGraph
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
