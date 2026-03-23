import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import { ERRORS, HTTP_STATUS } from "../constants/constants.js";
import serverRoutes from "../routes/serverRoutes.js";
import ProductRepository from "../state/ProductRepository.js";

dotenv.config();

export async function createApp(port: number, repository: ProductRepository) {
  const server: Fastify.FastifyInstance = Fastify({
    logger: true,
  });

  server.decorate('productRepository', repository);

  server.setErrorHandler(
    (
      error: FastifyError,
      request: FastifyRequest,
      reply: FastifyReply,
    ): FastifyReply => {
      server.log.error(error);
      return reply
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .send({ message: ERRORS.INTERNAL_SERVER_ERROR });
    },
  );

  server.register(serverRoutes);
  await server.listen({ port: port });
  console.log(`Server listening on http://localhost:${port}`);
  return server;

}
