interface Graph {
  graph?: string;
  nodes?: any;
  edges?: any;
  graph_cost?: number;
  timestamp?: Date;
  id_creator?: number;
}

class GraphBuilder {
  private graph: Graph;

  constructor() {
    this.graph = {};
  }

  setGraph(graph: any): GraphBuilder {
    this.graph.graph = JSON.stringify(graph);
    return this;
  }

  setNodes(nodes: any): GraphBuilder {
    this.graph.nodes = nodes;
    return this;
  }

  setEdges(edges: any): GraphBuilder {
    this.graph.edges = edges;
    return this;
  }

  setGraphCost(total_cost: number): GraphBuilder {
    this.graph.graph_cost = parseFloat(total_cost.toFixed(3));
    return this;
  }

  setTimestamp(): GraphBuilder {
    this.graph.timestamp = new Date();
    return this;
  }

  setIdCreator(user: { id_user: string }): GraphBuilder {
    this.graph.id_creator = parseInt(user.id_user);
    return this;
  }

  build(): Graph {
    return this.graph;
  }
}

export default GraphBuilder;
