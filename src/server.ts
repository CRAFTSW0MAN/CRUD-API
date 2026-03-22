import { DEFAULT_PORT} from "./constants/constants.js";
import { createApp } from "./serverApp/serverApp.js";
import ProductRepository from "./state/ProductRepository.js";

const PORT: number = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

const productRepository = new ProductRepository(); 

createApp(PORT,productRepository ).catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});

