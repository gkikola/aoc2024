class ConnectionGraph {
  #connections;

  constructor(connectionData = '') {
    this.#connections = new Map();
    this.addConnections(connectionData);
  }

  addConnections(connectionData) {
    connectionData.split('\n').forEach((connection) => {
      if (connection.length === 0) return;

      const [a, b] = connection.split('-');
      let aNeighbors = this.#connections.get(a);
      let bNeighbors = this.#connections.get(b);

      if (aNeighbors == null) {
        aNeighbors = new Set();
        this.#connections.set(a, aNeighbors);
      }
      if (bNeighbors == null) {
        bNeighbors = new Set();
        this.#connections.set(b, bNeighbors);
      }

      aNeighbors.add(b);
      bNeighbors.add(a);
    });
  }

  isConnected(a, b) {
    return this.#connections.get(a)?.has(b) ?? false;
  }

  countThreeNodeNetworks(startsWith = 't') {
    const threeNodeNetworks = new Set();
    this.#connections.forEach((neighbors, node) => {
      if (!node.startsWith(startsWith)) return;

      const neighborArray = [...neighbors.keys()];
      for (let i = 0; i < neighborArray.length - 1; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
          if (this.isConnected(neighborArray[i], neighborArray[j])) {
            threeNodeNetworks.add(
              [node, neighborArray[i], neighborArray[j]].sort().join(''),
            );
          }
        }
      }
    });
    return threeNodeNetworks.size;
  }
}

export default function run(input) {
  const connections = new ConnectionGraph(input);
  return connections.countThreeNodeNetworks();
}
