export const ROUTES = {
  PRODUCTS: '/api/products',
  PRODUCT_ID: '/api/products/:id',
  PRODUCT_ID_PATTERN: '/api/products/:productId',
  NOT_FOUND_ROUTE: '*'
} as const;

export const ERRORS = {
  INVALID_ID: 'Invalid product id',
  NOT_FOUND: 'Product not found',
  INVALID_INPUT: 'Invalid input',
  NOT_FOUND_ROUTE:'Not Found Route',
  INTERNAL_SERVER_ERROR:'Internal Server Error',
} as const;


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

export const DEFAULT_PORT = 4000;