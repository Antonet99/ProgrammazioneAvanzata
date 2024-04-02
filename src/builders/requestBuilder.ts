interface UpdateRequest {
  req_status: string;
  metadata: any;
  req_cost: number;
  timestamp: Date;
  req_users: number;
  req_graph: number;
}

class UpdateRequestBuilder {
  private request: UpdateRequest;

  constructor() {
    this.request = {
      req_status: "",
      metadata: {},
      req_cost: 0,
      timestamp: new Date(),
      req_users: 0,
      req_graph: 0,
    };
  }

  setReqStatus(req_status: string): UpdateRequestBuilder {
    this.request.req_status = req_status;
    return this;
  }

  setMetadata(metadata: any): UpdateRequestBuilder {
    this.request.metadata = metadata;
    return this;
  }

  setReqCost(req_cost: number): UpdateRequestBuilder {
    this.request.req_cost = req_cost;
    return this;
  }

  setTimestamp(): UpdateRequestBuilder {
    this.request.timestamp = new Date();
    return this;
  }

  setReqUsers(user: { id_user: string }): UpdateRequestBuilder {
    this.request.req_users = parseInt(user.id_user);
    return this;
  }

  setReqGraph(graph_id: number): UpdateRequestBuilder {
    this.request.req_graph = graph_id;
    return this;
  }

  build(): UpdateRequest {
    return this.request;
  }
}

export default UpdateRequestBuilder;
