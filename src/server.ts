import Fastify, { FastifyReply } from "fastify";
import dotenv from "dotenv";
import { z, ZodSafeParseResult } from "zod";
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

const ParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

type ProductBody = z.infer<typeof ProductBodySchema>;
type Product = z.infer<typeof ProductSchema>;
type ParamstId = z.infer<typeof ParamsSchema>;

dotenv.config();

const products: Product[] = [];

const PORT: number = parseInt(process.env.PORT || "4000", 10);

const server: Fastify.FastifyInstance = Fastify({
  logger: true,
});

server.get("/api/products", async (request, reply): Promise<FastifyReply>=> {
  return reply.send(products);
});

server.get<{ Params: ParamstId }>(
  "/api/products/:id",
  async (request, reply): Promise<FastifyReply> => {
    const { id } = request.params;

    const idResult: ZodSafeParseResult<string> = z
      .uuid({ version: "v4" })
      .safeParse(id);
    if (!idResult.success) {
      return reply.status(400).send({ message: "Invalid product id" });
    }
    const findProduct: Product | undefined = products.find(
      (product: Product): boolean => product.id === id,
    );
    if (!findProduct) {
      return reply.status(404).send({ message: "Product not found" });
    }
    return reply.send(findProduct);
  },
);

server.post<{ Body: ProductBody }>(
  "/api/products",
  async (request, reply): Promise<FastifyReply>=> {
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
  },
);

const start = async (): Promise<void> => {
  try {
    await server.listen({ port: PORT });
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
