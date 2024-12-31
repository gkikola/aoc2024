class ConnectionGraph {
  #connections; // Maps computer names to their node in the network graph

  constructor(connectionData = '') {
    this.#connections = new Map();
    this.addConnectionsFromString(connectionData);
  }

  addConnectionsFromString(connectionData) {
    connectionData.split('\n').forEach((connection) => {
      if (connection.length === 0) return;
      this.connect(...connection.split('-'));
    });
  }

  connect(a, b) {
    let aNode = this.#connections.get(a);
    let bNode = this.#connections.get(b);
    if (aNode == null) {
      aNode = { name: a, neighbors: [] };
      this.#connections.set(a, aNode);
    }
    if (bNode == null) {
      bNode = { name: b, neighbors: [] };
      this.#connections.set(b, bNode);
    }

    // If connection does not already exist, add it
    if (aNode.neighbors.findIndex((node) => node.name === b) < 0) {
      aNode.neighbors.push(bNode);
      bNode.neighbors.push(aNode);
    }
  }

  isConnected(a, b) {
    return (
      (this.#connections
        .get(a)
        ?.neighbors.findIndex((node) => node.name === b) ?? -1) >= 0
    );
  }

  countThreeNodeCliques(startsWith = 't') {
    const threeNodeCliques = new Set();
    this.#connections.forEach((node, name) => {
      if (!name.startsWith(startsWith)) return;

      for (let i = 0; i < node.neighbors.length - 1; i++) {
        for (let j = i + 1; j < node.neighbors.length; j++) {
          const name1 = node.neighbors[i].name;
          const name2 = node.neighbors[j].name;
          if (this.isConnected(name1, name2)) {
            threeNodeCliques.add([name, name1, name2].sort().join(','));
          }
        }
      }
    });
    return threeNodeCliques.size;
  }

  #findMaximalCliqueAt(start) {
    return start.neighbors.reduce(
      (clique, neighbor) => {
        // Check if the neighbor is connected to every vertex in the clique
        if (
          clique.findIndex(
            (node) => !this.isConnected(node.name, neighbor.name),
          ) < 0
        ) {
          // Grow the clique
          clique.push(neighbor);
        }

        return clique;
      },
      [start],
    );
  }

  getMaximumClique() {
    /* For each vertex in the network graph, find a maximal clique containing
     * that vertex. Then assume that the maximum clique will be the largest of
     * these maximal cliques. This method may fail on general graphs, but
     * appears to work for the problem inputs. */
    return [...this.#connections.values()]
      .reduce((clique, node) => {
        const localMaximalClique = this.#findMaximalCliqueAt(node);
        if (localMaximalClique.length > clique.length)
          return localMaximalClique;
        return clique;
      }, [])
      .map((node) => node.name)
      .sort()
      .join(',');
  }
}

export default function run(input) {
  const connections = new ConnectionGraph(input);
  return [connections.countThreeNodeCliques(), connections.getMaximumClique()];
}
