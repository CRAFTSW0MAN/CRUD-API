# CRUD API – Product Catalog

A simple but fully-featured CRUD API for managing a product catalog. Built with Node.js, Fastify, TypeScript, and Zod. Includes horizontal scaling via Node.js Cluster API and comprehensive tests.

---

## 🚀 Installation

```bash
npm install
```

---

## ⚙️ Environment variables

Create `.env` file based on example:

```bash
cp .env.example .env
```

Edit .env if needed (default port is 4000):

```env
PORT=4000
```
---

You can change the port if needed.

---

## 🛠 Technologies

- **Node.js** (v24+)
- **Fastify** – high-performance web framework
- **TypeScript** – static typing
- **Zod** – runtime validation
- **Vitest** – testing
- **Node.js Cluster API** – horizontal scaling


### Development mode

```bash
npm run start:dev
```

Uses `tsx watch` for hot reload.

---

### Production mode

```bash
npm run build
npm run start:prod
```

---

### Cluster mode (horizontal scaling with load balancer):

```bash
npm run start:cluster
```

## 📦 Available scripts

```json
 "start:dev": "tsx watch src/server.ts",
 "start:prod": "npm run build && node dist/server.js",
 "start:cluster": "tsx watch src/clusters/cluster.ts",
 "build": "npm run clean && tsc",
 "test": "vitest run",
 "test:watch": "vitest",
 "clean": "node -e \"require('fs').rmSync('dist', { recursive: true, force: true })\""
```
## 📚 API Endpoints

|Method|Endpoint|Description|Status Codes|
|---|---|---|---|
|GET|`/api/products`|Get all products|200|
|GET|`/api/products/:id`|Get product by ID|200, 400, 404|
|POST|`/api/products`|Create product|201, 400|
|PUT|`/api/products/:id`|Update product|200, 400, 404|
|DELETE|`/api/products/:id`|Delete product|204, 400, 404|

---

### Create product

```
POST /api/products
```

Example body:

```json
{
  "name": "Laptop2000",
  "description": "High-performance laptop",
  "price": 78900,
  "category": "electronics",
  "inStock": true
}
```

---

### Update product

```
PUT /api/products/:productId
```
Example body:

```json
{
  "name": "Laptop2000",
  "description": "High-performance laptop",
  "price": 78900,
  "category": "electronics",
  "inStock": true
}
```
---

## ❗ Error handling

- `400` — "Invalid product id"
- `404` — "Product not found"/"Not Found Route"
- `500` — "Internal Server Error"

---

## 🧪 Testing the API

The test suite uses Vitest and covers all CRUD operations, including validation and edge cases.

```bash
npm run test
```

---

## 📚 Task description

Original assignment:
_[CRUD API](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/03-crud-api/assignment.md)_

---

## 👩‍💻 Author

**CRAFTSW0MAN**

- [LinkedIn](https://github.com/CRAFTSW0MAN/CRUD-API)

---

## 💡 Notes

- Data is stored in‑memory – all products are lost after server restart (intended for learning).
- UUIDs are generated on the server side using crypto.randomUUID().
- The application is fully typed with TypeScript and validated with Zod
