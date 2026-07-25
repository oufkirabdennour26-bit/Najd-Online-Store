export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API Documentation',
    version: '1.0.0',
    description: 'API Documentation for the react-express-prisma-applet store platform, supporting catalog navigation, shopping cart checkout, customer administration, and dashboard analytics.',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'API Base Server'
    }
  ],
  security: [
    {
      BearerAuth: []
    },
    {
      CookieAuth: []
    }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Create a new customer account with name, email, and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
                  password: { type: 'string', format: 'password', minimum: 6, example: 'securepassword123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registered successfully' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'u123' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'johndoe@example.com' },
                        role: { type: 'string', example: 'user' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Validation failed or email already in use' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login',
        description: 'Authenticate user with email and password, returning an access token and setting a secure cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
                  password: { type: 'string', format: 'password', example: 'securepassword123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Logged in successfully',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string', example: 'accessToken=jwt_token_here; Path=/; HttpOnly; Secure; SameSite=Strict' }
              }
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'u123' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'johndoe@example.com' },
                        role: { type: 'string', example: 'user' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out current user',
        description: 'Clear access token cookie.',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        description: 'Retrieve profile details of the authenticated user.',
        responses: {
          200: {
            description: 'Profile details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'u123' },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'johndoe@example.com' },
                    role: { type: 'string', example: 'user' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Get products',
        description: 'Retrieve a list of products with search, pagination, category filtering, and sorting options.',
        parameters: [
          { name: 'search', in: 'query', required: false, schema: { type: 'string' }, description: 'Search term for title/description' },
          { name: 'categoryId', in: 'query', required: false, schema: { type: 'string' }, description: 'Filter by category ID' },
          { name: 'minPrice', in: 'query', required: false, schema: { type: 'number' }, description: 'Minimum price filter' },
          { name: 'maxPrice', in: 'query', required: false, schema: { type: 'number' }, description: 'Maximum price filter' },
          { name: 'sortBy', in: 'query', required: false, schema: { type: 'string', enum: ['createdAt', 'price', 'title'] }, description: 'Sort field' },
          { name: 'sortOrder', in: 'query', required: false, schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sort order' },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 10 }, description: 'Number of items per page' }
        ],
        responses: {
          200: {
            description: 'List of products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    products: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 45 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        totalPages: { type: 'integer', example: 5 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product',
        description: 'Admin-only endpoint to create a new product.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'price', 'stock', 'categoryId'],
                properties: {
                  title: { type: 'string', example: 'Wireless Headphones' },
                  description: { type: 'string', example: 'High fidelity audio with noise cancellation.' },
                  price: { type: 'number', example: 129.99 },
                  originalPrice: { type: 'number', example: 149.99 },
                  stock: { type: 'integer', example: 50 },
                  categoryId: { type: 'string', example: 'cat_electronics' },
                  image: { type: 'string', example: '/uploads/headphones.jpg' },
                  isFeatured: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Product created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden (Admin role required)' }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        description: 'Retrieve detailed information of a single product.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        responses: {
          200: {
            description: 'Product details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          404: { description: 'Product not found' }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        description: 'Admin-only endpoint to update an existing product details.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Wireless Headphones V2' },
                  description: { type: 'string', example: 'Improved high fidelity audio and ergonomic shape.' },
                  price: { type: 'number', example: 139.99 },
                  stock: { type: 'integer', example: 45 },
                  image: { type: 'string', example: '/uploads/headphones_v2.jpg' },
                  isFeatured: { type: 'boolean', example: false }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Product updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          404: { description: 'Product not found' }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Permanently delete product',
        description: 'Admin-only endpoint to permanently remove a product from the database.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        responses: {
          200: {
            description: 'Product deleted permanently',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Product deleted permanently' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/products/upload': {
      post: {
        tags: ['Products'],
        summary: 'Upload product image',
        description: 'Admin-only multipart upload for images.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Product image file' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Image uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    url: { type: 'string', example: '/uploads/products/1691234567.png' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        description: 'Get all categories.',
        responses: {
          200: {
            description: 'Categories retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Category' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        description: 'Admin-only category creation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                  name: { type: 'string', example: 'Electronics' },
                  slug: { type: 'string', example: 'electronics' },
                  description: { type: 'string', example: 'Gadgets and electronic devices.' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Category created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Category' }
              }
            }
          }
        }
      }
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place order (Checkout)',
        description: 'Create an order from cart items. Authenticated or Guest checkout.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items', 'customerName', 'customerEmail', 'customerPhone', 'customerAddress'],
                properties: {
                  customerName: { type: 'string', example: 'Alice Smith' },
                  customerEmail: { type: 'string', format: 'email', example: 'alice@example.com' },
                  customerPhone: { type: 'string', example: '+1234567890' },
                  customerAddress: { type: 'string', example: '123 Main Street, Suite 4B' },
                  notes: { type: 'string', example: 'Deliver after 5 PM.' },
                  promoCode: { type: 'string', example: 'SAVE10' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity'],
                      properties: {
                        productId: { type: 'string', example: 'prod_9023' },
                        quantity: { type: 'integer', minimum: 1, example: 2 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Order created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' }
              }
            }
          }
        }
      },
      get: {
        tags: ['Orders'],
        summary: 'Get user orders',
        description: 'Retrieve order history for the logged-in customer.',
        responses: {
          200: {
            description: 'User order list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Order' }
                }
              }
            }
          }
        }
      }
    },
    '/promo/validate': {
      post: {
        tags: ['Promotions'],
        summary: 'Validate coupon code',
        description: 'Verify coupon eligibility and compute discount values.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'orderValue'],
                properties: {
                  code: { type: 'string', example: 'SAVE10' },
                  orderValue: { type: 'number', example: 100 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Coupon is valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    promo: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'promo123' },
                        code: { type: 'string', example: 'SAVE10' },
                        discountType: { type: 'string', example: 'percent' },
                        discountValue: { type: 'number', example: 10 }
                      }
                    },
                    discountAmount: { type: 'number', example: 10 }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid, inactive, or expired coupon' }
        }
      }
    },
    '/admin/stats': {
      get: {
        tags: ['Admin Panel'],
        summary: 'Get Dashboard Stats',
        description: 'Retrieve sales, order volumes, customers, and popular products metrics.',
        responses: {
          200: {
            description: 'Dashboard stats payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    revenue: { type: 'number', example: 2450.5 },
                    ordersCount: { type: 'integer', example: 34 },
                    productsCount: { type: 'integer', example: 112 },
                    customersCount: { type: 'integer', example: 19 }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Inject JWT as "Bearer {token}" inside Authorization Header.'
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'HTTP-Only authentication cookie containing JWT.'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod_9023' },
          title: { type: 'string', example: 'Wireless Headphones' },
          description: { type: 'string', example: 'High fidelity audio with noise cancellation.' },
          price: { type: 'number', example: 129.99 },
          originalPrice: { type: 'number', example: 149.99 },
          stock: { type: 'integer', example: 50 },
          categoryId: { type: 'string', example: 'cat_electronics' },
          image: { type: 'string', example: '/uploads/headphones.jpg' },
          isFeatured: { type: 'boolean', example: true },
          isDeleted: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cat_electronics' },
          name: { type: 'string', example: 'Electronics' },
          slug: { type: 'string', example: 'electronics' },
          description: { type: 'string', example: 'Gadgets and electronic devices.' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ord_7712' },
          orderNumber: { type: 'string', example: 'ORD-2026-0034' },
          totalAmount: { type: 'number', example: 129.99 },
          discountAmount: { type: 'number', example: 10 },
          payableAmount: { type: 'number', example: 119.99 },
          status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], example: 'pending' },
          customerName: { type: 'string', example: 'Alice Smith' },
          customerEmail: { type: 'string', example: 'alice@example.com' },
          customerPhone: { type: 'string', example: '+1234567890' },
          customerAddress: { type: 'string', example: '123 Main Street, Suite 4B' },
          notes: { type: 'string', example: 'Deliver after 5 PM.' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};
