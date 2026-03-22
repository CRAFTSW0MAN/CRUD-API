import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import http from "node:http";
import { DEFAULT_PORT, ERRORS, HTTP_STATUS} from "../constants/constants.js";
import { createApp } from "../serverApp/serverApp.js";
import ProductRepository from "../state/ProductRepository.js";
import { WorkerProxyRepository } from "../state/WorkerProxyRepository.js";
import {
  Product,
  WorkerData,
  WorkerToMasterMessage,
} from "../schemas_and_types/schemas_and_types.js";

const MAIN_PORT: number = parseInt(
  process.env.PORT || String(DEFAULT_PORT),
  10,
);
const numCPUs: number = availableParallelism();
const numWorkers: number = Math.max(1, numCPUs - 1);

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  const masterRepository: ProductRepository = new ProductRepository();
  const workers: WorkerData[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const workerPort: number = MAIN_PORT + i + 1;
    const worker: cluster.Worker = cluster.fork({
      PORT: workerPort.toString(),
    });
    workers.push({ worker, pid: worker.process.pid!, port: workerPort });
    console.log(`Worker ${worker.process.pid} started on port ${workerPort}`);
    worker.on("online", () => {
      const initialData: Product[] = masterRepository.getAllProducts();
      worker.send({ type: "INIT_DATA", data: initialData });
    });
  }

  let nextWorker: number = 0;
  const balancer: http.Server = http.createServer((req, res) => {
    const worker: WorkerData = workers[nextWorker % workers.length];
    nextWorker++;
    console.log(
      `Balancer → Worker on port ${worker.port} (${req.method} ${req.url})`,
    );
    const options = {
      hostname: "localhost",
      port: worker.port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };
    const proxyReq: http.ClientRequest = http.request(
      options,
      (proxyRes): void => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    req.pipe(proxyReq);
    proxyReq.on("error", (err): void => {
      console.error(`Proxy error for worker ${worker.port}:`, err);
      res.statusCode = HTTP_STATUS.INTERNAL_ERROR;
      res.end("Proxy error");
    });
  });
  balancer.listen(MAIN_PORT, (): void => {
    console.log(`Balancer listening on port ${MAIN_PORT}`);
  });

  cluster.on(
    "message",
    async (worker: cluster.Worker, message:WorkerToMasterMessage): Promise<void> => {
      const { type, payload, requestId } = message;
      if (type === "CREATE") {
        const newProduct:Product = await masterRepository.createNewProduct(payload);
        worker.send({ type: "CREATE_RESPONSE", data: newProduct, requestId });
        const allProducts:Product[] = masterRepository.getAllProducts();
        for (const w of workers) {
          w.worker.send({ type: "UPDATE_DATA", data: allProducts });
        }
      } else if (type === "UPDATE") {
        const { id, productData } = payload;
        const updated = await masterRepository.updateById(id, productData);
        if (updated) {
          worker.send({ type: "UPDATE_RESPONSE", data: updated, requestId });
          const allProducts:Product[] = masterRepository.getAllProducts();
          for (const w of workers) {
            w.worker.send({ type: "UPDATE_DATA", data: allProducts });
          }
        } else {
          worker.send({
            type: "UPDATE_RESPONSE",
            error: ERRORS.NOT_FOUND,
            requestId,
          });
        }
      } else if (type === "DELETE") {
        const { id } = payload;
        const deleted: boolean = await masterRepository.deleteById(id);
        if (deleted) {
          worker.send({ type: "DELETE_RESPONSE", success: true, requestId });
          const allProducts:Product[] = masterRepository.getAllProducts();
          for (const w of workers) {
            w.worker.send({ type: "UPDATE_DATA", data: allProducts });
          }
        } else {
          worker.send({
            type: "DELETE_RESPONSE",
            success: false,
            error: ERRORS.NOT_FOUND,
            requestId,
          });
        }
      }
    },
  );

  cluster.on("exit", (worker, code, signal): void => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
  });
} else {
  const port: number = parseInt(process.env.PORT!);
  console.log(`Worker ${process.pid} starting Fastify on port ${port}`);
  const workerRepo: WorkerProxyRepository = new WorkerProxyRepository();
  createApp(port, workerRepo).catch((err) => {
    console.error(`Worker ${process.pid} failed:`, err);
    process.exit(1);
  });
}
