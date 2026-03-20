import { FastifyInstance } from "fastify";
import { ROUTES } from "../constants/constants.js";
import { deleteProduct, getAllProducts, getOneProduct, postCreateNewProduct } from "../controllers/serverController.js";

export default async function serverRoutes(server: FastifyInstance): Promise<void> {
  server.get(ROUTES.PRODUCTS, getAllProducts);
  server.get(ROUTES.PRODUCT_ID, getOneProduct);
  server.post(ROUTES.PRODUCTS, postCreateNewProduct);
  server.delete(ROUTES.PRODUCT_ID_PATTERN, deleteProduct);
}
