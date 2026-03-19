import { z } from "zod";

const ProductBodySchema = z
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

export type ProductBody = z.infer<typeof ProductBodySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ParamstId = z.infer<typeof ParamsSchema>;
