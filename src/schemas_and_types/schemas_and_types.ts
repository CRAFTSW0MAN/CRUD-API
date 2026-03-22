import { z } from "zod";
import ProductRepository from "../state/ProductRepository.js";
import cluster from "node:cluster";

declare module "fastify" {
  interface FastifyInstance {
    productRepository: ProductRepository;
  }
}

export const ProductBodySchema = z
  .object({
    id: z.string().min(1).optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    category: z.string().min(1),
    inStock: z.boolean(),
  })
  .strict();

const ProductSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    category: z.string().min(1),
    inStock: z.boolean(),
  })
  .strict();

const ParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

const ParamsProductSchema = z
  .object({
    productId: z.string().min(1),
  })
  .strict();

export type ProductBody = z.infer<typeof ProductBodySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ParamsId = z.infer<typeof ParamsSchema>;
export type ParamsProduct = z.infer<typeof ParamsProductSchema>;
export type ResolverCreate = ((result: Product) => void) | undefined;
export type ResolverUpdate = (result: Product | null) => void; 
export type ResolverDelete = (result: boolean) => void;
export type MasterToWorkerMessage =
  | { type: "INIT_DATA"; data: Product[] }
  | { type: "UPDATE_DATA"; data: Product[] }
  | { type: "CREATE_RESPONSE"; data: Product; requestId: string }
  | { type: "UPDATE_RESPONSE"; data: Product; requestId: string }
  | { type: "UPDATE_RESPONSE_ERROR"; error: string; requestId: string }
  | { type: "DELETE_RESPONSE"; success: boolean; requestId: string };
export type WorkerToMasterMessage =
  | { type: "CREATE"; payload: ProductBody; requestId: string }
  | {
      type: "UPDATE";
      payload: { id: string; productData: ProductBody };
      requestId: string;
    }
  | { type: "DELETE"; payload: { id: string }; requestId: string };
export type WorkerData = { worker: cluster.Worker; pid: number; port: number };
