import Fastify from "fastify";
import dotenv from "dotenv";
import { z } from "zod";
import { randomUUID } from "node:crypto";

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

type ProductBody = z.infer<typeof ProductBodySchema>;
type Product = z.infer<typeof ProductSchema>;
dotenv.config();

const products: Product[] = [];

const PORT: number = parseInt(process.env.PORT || "4000", 10);

const server: Fastify.FastifyInstance = Fastify({
  logger: true,
});

server.get("/api/products", async (request, reply) => {
  return reply.send(products);
});

server.post("/api/products", async (request, reply):Promise<void> => {
  const result = ProductBodySchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ message: "Invalid input" });
  }

  const newProduct: Product = {
    id: randomUUID(),
    name: result.data.name,
    description: result.data.description,
    price: result.data.price,
    category: result.data.category,
    inStock: result.data.inStock,
  };
  products.push(newProduct);
  return reply.status(201).send(newProduct);
});

const start = async () :Promise<void>=> {
  try {
    await server.listen({ port: PORT });
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
