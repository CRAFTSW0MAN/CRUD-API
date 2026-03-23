import {
  Product,
  ProductBody,
} from "../schemas_and_types/schemas_and_types.js";
import { randomUUID } from "node:crypto";

export default class ProductRepository {
  products: Product[] = [];

  getAllProducts(): Product[] {
    return this.products;
  }

  findProduct(id: string): Product | undefined {
    const findProductData: Product | undefined = this.products.find(
      (product: Product): boolean => product.id === id,
    );
    return findProductData;
  }

  findIndexProduct(id: string): number {
    const indexProduct: number = this.products.findIndex(
      (product: Product): boolean => product.id === id,
    );
    return indexProduct;
  }

  async createNewProduct(dataProduct: ProductBody): Promise<Product> {
    const newProduct: Product = {
      id: randomUUID(),
      name: dataProduct.name,
      description: dataProduct.description,
      price: dataProduct.price,
      category: dataProduct.category,
      inStock: dataProduct.inStock,
    };
    this.products.push(newProduct);
    return newProduct;
  }
  async deleteById(id: string): Promise<boolean> {
    const index = this.findIndexProduct(id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  async updateById(
    id: string,
    dataProduct: ProductBody,
  ): Promise<Product | null> {
    const indexProduct = this.findIndexProduct(id);
    if (indexProduct === -1) return null;
    const updatedProduct: Product = {
      id: this.products[indexProduct].id,
      name: dataProduct.name,
      description: dataProduct.description,
      price: dataProduct.price,
      category: dataProduct.category,
      inStock: dataProduct.inStock,
    };

    this.products[indexProduct] = updatedProduct;
    return updatedProduct;
  }

  clear(): void {
    this.products = [];
  }
}
