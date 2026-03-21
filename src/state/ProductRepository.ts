import {
  Product,
  ProductBody,
} from "../schemas_and_types/schemas_and_types.js";
import { randomUUID } from "node:crypto";

class ProductRepository {
  private products: Product[] = [];

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

  createNewProduct(dataProduct: ProductBody): Product {
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

  deleteProduct(indexProduct: number): void {
    this.products.splice(indexProduct, 1);
  }
  updateProductByIndex(
    dataProduct: ProductBody,
    indexProduct: number,
  ): Product {
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

export const productRepository: ProductRepository = new ProductRepository();
