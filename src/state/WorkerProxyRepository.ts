import {
  MasterToWorkerMessage,
  Product,
  ProductBody,
  ResolverCreateAndUpdate,
  ResolverDelete,
} from "../schemas_and_types/schemas_and_types.js";
import ProductRepository from "./ProductRepository.js";

export class WorkerProxyRepository extends ProductRepository {
  private pendingCreate: Map<string, ResolverCreateAndUpdate> = new Map();
  private pendingUpdate: Map<string, ResolverCreateAndUpdate> = new Map();
  private pendingDelete: Map<string, ResolverDelete> = new Map();
  private requestIdCounter: number = 0;

  constructor() {
    super();
    process.on("message", (message: MasterToWorkerMessage): void => {
      if (message.type === "INIT_DATA") {
        this.products = message.data;
      } else if (message.type === "UPDATE_DATA") {
        this.products = message.data;
      } else if (message.type === "CREATE_RESPONSE") {
        const resolver: ResolverCreateAndUpdate = this.pendingCreate.get(
          message.requestId,
        );
        if (resolver) {
          resolver(message.data);
          this.pendingCreate.delete(message.requestId);
        }
      } else if (message.type === "UPDATE_RESPONSE") {
        const resolver: ResolverCreateAndUpdate = this.pendingUpdate.get(
          message.requestId,
        );
        if (resolver) {
          resolver(message.data);
          this.pendingUpdate.delete(message.requestId);
        }
      } else if (message.type === "DELETE_RESPONSE") {
        const resolver: ResolverDelete | undefined = this.pendingDelete.get(
          message.requestId,
        );
        if (resolver) {
          resolver(message.success);
          this.pendingDelete.delete(message.requestId);
        }
      }
    });
  }

  override async createNewProduct(data: ProductBody): Promise<Product> {
    return this.sendAndWaitCreate(data);
  }

  override async deleteById(id: string): Promise<boolean> {
    return this.sendAndWaitDelete(id);
  }

  override async updateById(
    id: string,
    data: ProductBody,
  ): Promise<Product | null> {
    return this.sendAndWaitUpdate(id, data);
  }

  private sendAndWaitCreate(data: ProductBody): Promise<Product> {
    return new Promise((resolve) => {
      const requestId = `${Date.now()}-${this.requestIdCounter++}`;
      this.pendingCreate.set(requestId, resolve);
      process.send!({ type: "CREATE", payload: data, requestId });
    });
  }

  private sendAndWaitDelete(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const requestId = `${Date.now()}-${this.requestIdCounter++}`;
      this.pendingDelete.set(requestId, resolve);
      process.send!({ type: "DELETE", payload: { id }, requestId });
    });
  }

  private sendAndWaitUpdate(
    id: string,
    data: ProductBody,
  ): Promise<Product | null> {
    return new Promise((resolve) => {
      const requestId = `${Date.now()}-${this.requestIdCounter++}`;
      this.pendingUpdate.set(requestId, resolve);
      process.send!({
        type: "UPDATE",
        payload: { id, productData: data },
        requestId,
      });
    });
  }
}
