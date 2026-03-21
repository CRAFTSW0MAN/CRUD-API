import { FastifyInstance } from "fastify";
import { ROUTES } from "../constants/constants.js";
import { deleteProduct, getAllProducts, getOneProduct, notFoundRoutes, postCreateNewProduct, updateProduct } from "../controllers/serverController.js";

export default async function serverRoutes(server: FastifyInstance): Promise<void> {
  server.get(ROUTES.PRODUCTS, getAllProducts);
  server.get(ROUTES.PRODUCT_ID, getOneProduct);
  server.post(ROUTES.PRODUCTS, postCreateNewProduct);
  server.delete(ROUTES.PRODUCT_ID_PATTERN, deleteProduct);
  server.put(ROUTES.PRODUCT_ID_PATTERN, updateProduct);
  server.all(ROUTES.NOT_FOUND_ROUTE,notFoundRoutes)
}
