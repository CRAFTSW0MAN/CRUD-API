import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodSafeParseResult } from "zod";
import {
  Product,
  ParamsId,
  ProductBody,
  ProductBodySchema,
  ParamsProduct,
} from "../schemas_and_types/schemas_and_types.js";
import { ERRORS, HTTP_STATUS } from "../constants/constants.js";


export const getAllProducts = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  return reply.send(request.server.productRepository.getAllProducts());
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
  const findProduct: Product | undefined = request.server.productRepository.findProduct(id);
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

  const newProduct: Product = await request.server.productRepository.createNewProduct(result.data);
  return reply.status(HTTP_STATUS.CREATED).send(newProduct);
};

export const deleteProduct = async (
  request: FastifyRequest<{ Params: ParamsProduct }>,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  const { productId } = request.params;
  const idResult = z.uuid({ version: 'v4' }).safeParse(productId);
  if (!idResult.success) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({ message: ERRORS.INVALID_ID });
  }
  const deleted = await request.server.productRepository.deleteById(productId);
  if (!deleted) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({ message: ERRORS.NOT_FOUND });
  }
  return reply.status(HTTP_STATUS.NO_CONTENT).send();
};

export const updateProduct = async (
  request: FastifyRequest<{ Params: ParamsProduct; Body: ProductBody }>,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  const { productId } = request.params;
  const idResult = z.uuid({ version: 'v4' }).safeParse(productId);
  if (!idResult.success) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({ message: ERRORS.INVALID_ID });
  }
  const result = ProductBodySchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({ message: ERRORS.INVALID_INPUT });
  }
  const updated = await request.server.productRepository.updateById(productId, result.data);
  if (!updated) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({ message: ERRORS.NOT_FOUND });
  }
  return reply.status(HTTP_STATUS.OK).send(updated);
};

export const notFoundRoutes = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> => {
  return reply.status(HTTP_STATUS.NOT_FOUND).send({ message: ERRORS.NOT_FOUND_ROUTE });
};
