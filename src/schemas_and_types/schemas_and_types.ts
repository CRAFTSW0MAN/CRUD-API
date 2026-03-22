import { z } from "zod";
import ProductRepository from "../state/ProductRepository.js";

declare module "fastify" {
  interface FastifyInstance {
    productRepository: ProductRepository;
  }
}
export type WorkerData = { pid: number; port: number };
export type WorkersArr = WorkerData[];

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
