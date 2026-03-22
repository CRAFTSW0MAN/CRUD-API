import { FastifyInstance } from "fastify";
import { createApp } from "../serverApp/serverApp.js";
import ProductRepository from "../state/ProductRepository.js";
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { ERRORS, HTTP_STATUS, METOD, ROUTES } from "../constants/constants.js";
import {
  Product,
  ProductBody,
} from "../schemas_and_types/schemas_and_types.js";

describe("Products API", () => {
  let app: FastifyInstance;
  let repository: ProductRepository;

  const dataProduct: ProductBody = {
    name: "Laptop200",
    description: "High-performance laptop",
    price: 8900,
    category: "electronics",
    inStock: true,
  };

  const newDataProduct = {
    name: "Laptop",
    description: "High-performance laptop009",
    price: 1000,
    category: "electronics and car",
    inStock: true,
  };

  beforeEach(async () => {
    repository = new ProductRepository();
    app = await createApp(8888, repository);
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /api/products returns empty array initially", async (): Promise<void> => {
    const res = await app.inject({ method: METOD.GET, url: ROUTES.PRODUCTS });
    expect(res.statusCode).toBe(HTTP_STATUS.OK);
    expect(JSON.parse(res.payload)).toEqual([]);
  });

  it("GET /api/products/:id returns 400 for invalid UUID", async () => {
    const invalidId = "not-a-uuid";
    const res = await app.inject({
      method: METOD.GET,
      url: `${ROUTES.PRODUCTS}/${invalidId}`,
    });
    expect(res.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(JSON.parse(res.payload)).toEqual({ message: ERRORS.INVALID_ID });
  });

  it("POST /api/products creates a product and returns it", async (): Promise<void> => {
    const res = await app.inject({
      method: METOD.POST,
      url: ROUTES.PRODUCTS,
      payload: dataProduct,
    });

    const products: Product[] = repository.getAllProducts();
    expect(res.statusCode).toBe(HTTP_STATUS.CREATED);
    expect(JSON.parse(res.payload)).toMatchObject(dataProduct);
    expect(JSON.parse(res.payload).id).toBeDefined();
    expect(typeof JSON.parse(res.payload).id).toBe("string");
    expect(products).toHaveLength(1);
    expect(products[0]).toEqual(JSON.parse(res.payload));
  });

  it("GET /api/products/:id returns the created product", async (): Promise<void> => {
    const postRes = await app.inject({
      method: METOD.POST,
      url: ROUTES.PRODUCTS,
      payload: dataProduct,
    });
    const Product = JSON.parse(postRes.payload);
    const getRes = await app.inject({
      method: METOD.GET,
      url: `${ROUTES.PRODUCTS}/${Product.id}`,
    });

    expect(getRes.statusCode).toBe(HTTP_STATUS.OK);
    const products: Product[] = repository.getAllProducts();
    expect(JSON.parse(getRes.payload)).toMatchObject(dataProduct);
    expect(JSON.parse(getRes.payload).id).toBeDefined();
    expect(typeof JSON.parse(getRes.payload).id).toBe("string");
    expect(products).toHaveLength(1);
    expect(products[0]).toEqual(JSON.parse(getRes.payload));
  });

  it("PUT /api/products/:id updates the product", async (): Promise<void> => {
    const postRes = await app.inject({
      method: METOD.POST,
      url: ROUTES.PRODUCTS,
      payload: dataProduct,
    });
    const Product = JSON.parse(postRes.payload);

    const putRes = await app.inject({
      method: METOD.PUT,
      url: `${ROUTES.PRODUCTS}/${Product.id}`,
      payload: newDataProduct,
    });

    expect(putRes.statusCode).toBe(HTTP_STATUS.OK);
    const products: Product[] = repository.getAllProducts();
    expect(JSON.parse(putRes.payload)).toMatchObject(newDataProduct);
    expect(products).toHaveLength(1);
    expect(products[0]).toEqual(JSON.parse(putRes.payload));
  });

  it("DELETE /api/products/:id deletes the product", async (): Promise<void> => {
    const postRes = await app.inject({
      method: METOD.POST,
      url: ROUTES.PRODUCTS,
      payload: dataProduct,
    });
    const Product = JSON.parse(postRes.payload);
    const deleteRes = await app.inject({
      method: METOD.DELETE,
      url: `${ROUTES.PRODUCTS}/${Product.id}`,
    });
    expect(deleteRes.statusCode).toBe(HTTP_STATUS.NO_CONTENT);
    const deleteResTwo = await app.inject({
      method: METOD.DELETE,
      url: `${ROUTES.PRODUCTS}/${Product.id}`,
    });
    expect(deleteResTwo.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
  });
});
