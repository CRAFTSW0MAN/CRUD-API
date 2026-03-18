import Fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

const server = Fastify({
  logger: true
});

server.get('/api/products', async (request, reply) => {
  return { message: 'Сервер работает! Список продуктов пока пуст' };
});

const start = async () => {
  try {
    await server.listen({ port: PORT });
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();