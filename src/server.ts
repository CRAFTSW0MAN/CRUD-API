import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import serverRoutes from "./routes/serverRoutes.js";
import { DEFAULT_PORT, ERRORS, HTTP_STATUS } from "./constants/constants.js";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

const server: Fastify.FastifyInstance = Fastify({
  logger: true,
});

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

const start: () => Promise<void> = async (): Promise<void> => {
  try {
    await server.listen({ port: PORT });
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
