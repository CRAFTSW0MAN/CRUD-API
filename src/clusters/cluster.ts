import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import http from "node:http";
import { DEFAULT_PORT } from "../constants/constants.js";
import { createApp } from "../serverApp/serverApp.js";
import ProductRepository from "../state/ProductRepository.js";
import {
  Product,
  WorkersArr,
  WorkerData,
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

  const workers: WorkersArr = [];

  for (let i = 0; i < numWorkers; i++) {
    const workerPort: number = MAIN_PORT + i + 1;
    const worker: cluster.Worker = cluster.fork({
      PORT: workerPort.toString(),
    });
    workers.push({ pid: worker.process.pid!, port: workerPort });
    console.log(`Worker ${worker.process.pid} started on port ${workerPort}`);

    worker.on("online", (): void => {
      const initialData: Product[] = masterRepository.getAllProducts();
      worker.send({ type: "INIT_DATA", data: initialData });
    });
  }

  let nextWorker: number = 0;
  const balancer: http.Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  > = http.createServer((req, res) => {
    const worker: WorkerData = workers[nextWorker % workers.length];
    nextWorker++;

    console.log(
      `Balancer → Worker on port ${worker.port} (${req.method} ${req.url})`,
    );

    const options: http.RequestOptions = {
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
      res.statusCode = 500;
      res.end("Proxy error");
    });
  });

  balancer.listen(MAIN_PORT, (): void => {
    console.log(`Balancer listening on port ${MAIN_PORT}`);
  });
  cluster.on("message", (worker, message) => {
    console.log(`Master received from worker ${worker.process.pid}:`, message);
  });

  cluster.on("exit", (worker, code, signal): void => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
  });
}  else {
  const port: number = parseInt(process.env.PORT!);
  console.log(`Worker ${process.pid} starting Fastify on port ${port}`);
  const workerController: ProductRepository = new ProductRepository();
  if (process.send) {
    process.send({ type: 'TEST', data: 'hello from worker' });
  } else {
    console.warn('process.send is not available');
  }
  createApp(port, workerController).catch((err) => {
    console.error(`Worker ${process.pid} failed:`, err);
    process.exit(1);
  });
}
