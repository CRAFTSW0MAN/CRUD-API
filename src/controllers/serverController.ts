import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { z, ZodSafeParseResult } from "zod";
import {
  Product,
  ParamsId,
  ProductBody,
  ProductBodySchema,
  ParamsProduct,
} from "../schemas_and_types/schemas_and_types.js";
import { ERRORS, HTTP_STATUS } from "../constants/constants.js";

const products: Product[] = [];

export const getAllProducts = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  return reply.send(products);
};

export const getOneProduct = async (
  request: FastifyRequest<{ Params: ParamsId }>,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  const { id } = request.params;
  const idResult: ZodSafeParseResult<string> = z
    .uuid({ version: "v4" })
    .safeParse(id);
  if (!idResult.success) {
    return reply
      .status(HTTP_STATUS.BAD_REQUEST)
      .send({ message: ERRORS.INVALID_ID });
  }
  const findProduct: Product | undefined = products.find(
    (product: Product): boolean => product.id === id,
  );
  if (!findProduct) {
    return reply
      .status(HTTP_STATUS.NOT_FOUND)
      .send({ message: ERRORS.NOT_FOUND });
  }
  return reply.send(findProduct);
};

export const postCreateNewProduct = async (
  request: FastifyRequest<{ Body: ProductBody }>,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  const result = ProductBodySchema.safeParse(request.body);
  if (!result.success) {
    return reply
      .status(HTTP_STATUS.BAD_REQUEST)
      .send({ message: ERRORS.INVALID_INPUT });
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
  return reply.status(HTTP_STATUS.CREATED).send(newProduct);
};

export const deleteProduct = async (
  request: FastifyRequest<{ Params: ParamsProduct }>,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  const { productId } = request.params;
  const idResult: ZodSafeParseResult<string> = z
    .uuid({ version: "v4" })
    .safeParse(productId);
  if (!idResult.success) {
    return reply
      .status(HTTP_STATUS.BAD_REQUEST)
      .send({ message: ERRORS.INVALID_ID });
  }

  const indexProduct: number = products.findIndex(
    (product: Product): boolean => product.id === productId,
  );
  if (indexProduct === -1) {
    return reply
      .status(HTTP_STATUS.NOT_FOUND)
      .send({ message: ERRORS.NOT_FOUND });
  }
  products.splice(indexProduct, 1);
  return reply.status(HTTP_STATUS.NO_CONTENT).send();
};

export const updateProduct = async ( request: FastifyRequest<{ Params: ParamsProduct; Body: ProductBody }>, reply: FastifyReply) => {
  const { productId } = request.params;
  const idResult: ZodSafeParseResult<string> = z
    .uuid({ version: "v4" })
    .safeParse(productId);
  if (!idResult.success) {
    return reply
      .status(HTTP_STATUS.BAD_REQUEST)
      .send({ message: ERRORS.INVALID_ID });
  }

  const indexProduct: number = products.findIndex(
    (product: Product): boolean => product.id === productId,
  );
  if (indexProduct === -1) {
    return reply
      .status(HTTP_STATUS.NOT_FOUND)
      .send({ message: ERRORS.NOT_FOUND });
  }
  const result = ProductBodySchema.safeParse(request.body);
  if (!result.success) {
    return reply
      .status(HTTP_STATUS.BAD_REQUEST)
      .send({ message: ERRORS.INVALID_INPUT });
  }
  const updatedProduct: Product = {
  id: productId,
  name: result.data.name,
  description: result.data.description,
  price: result.data.price,
  category: result.data.category,
  inStock: result.data.inStock,
};

products[indexProduct] = updatedProduct;

return reply.status(HTTP_STATUS.OK).send(updatedProduct);
};
