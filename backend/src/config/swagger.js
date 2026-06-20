import swaggerJSDoc from 'swagger-jsdoc';
import config from './index.js';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'OrchardLease API',
    version: '1.0.0',
    description:
      'REST API for OrchardLease — an intelligent orchard rental marketplace. ' +
      'Sellers list orchards, renters discover and lease them, admins operate the platform.',
    contact: { name: 'OrchardLease', email: 'support@orchardlease.com' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: `http://localhost:${config.port}${config.apiPrefix}`, description: 'Local' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'refreshToken' },
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication & session management' },
    { name: 'Users', description: 'User profile & account' },
    { name: 'Orchards', description: 'Orchard listings' },
    { name: 'Bookings', description: 'Lease bookings' },
    { name: 'Reviews', description: 'Orchard reviews' },
    { name: 'Wishlist', description: 'Saved orchards & comparisons' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'Seller', description: 'Seller dashboard & analytics' },
    { name: 'Admin', description: 'Admin portal, moderation & analytics' },
  ],
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/docs/*.js'],
});

export default swaggerSpec;
