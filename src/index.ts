#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ============================================
// BIGCOMMERCE MCP SERVER
// API Docs: https://developer.bigcommerce.com/docs/api
// ============================================
const MCP_NAME = "bigcommerce";
const MCP_VERSION = "1.0.0";

// ============================================
// API CLIENT - OAuth2/API Token Authentication
// ============================================
class BigCommerceClient {
  private accessToken: string;
  private storeHash: string;
  private baseUrlV3: string;
  private baseUrlV2: string;

  constructor(accessToken: string, storeHash: string) {
    this.accessToken = accessToken;
    this.storeHash = storeHash;
    this.baseUrlV3 = `https://api.bigcommerce.com/stores/${storeHash}/v3`;
    this.baseUrlV2 = `https://api.bigcommerce.com/stores/${storeHash}/v2`;
  }

  async request(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Auth-Token": this.accessToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BigCommerce API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    return response.json();
  }

  async getV3(endpoint: string, params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`${this.baseUrlV3}${endpoint}${queryString}`, { method: "GET" });
  }

  async getV2(endpoint: string, params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`${this.baseUrlV2}${endpoint}${queryString}`, { method: "GET" });
  }

  async postV3(endpoint: string, data: any) {
    return this.request(`${this.baseUrlV3}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async putV3(endpoint: string, data: any) {
    return this.request(`${this.baseUrlV3}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async putV2(endpoint: string, data: any) {
    return this.request(`${this.baseUrlV2}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

// ============================================
// TOOL DEFINITIONS
// ============================================
const tools = [
  {
    name: "list_products",
    description: "List products from BigCommerce catalog with filtering and pagination",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max products to return (default 50, max 250)" },
        page: { type: "number", description: "Page number for pagination" },
        name: { type: "string", description: "Filter by product name (partial match)" },
        sku: { type: "string", description: "Filter by SKU" },
        brand_id: { type: "number", description: "Filter by brand ID" },
        categories: { type: "string", description: "Filter by category ID(s), comma-separated" },
        is_visible: { type: "boolean", description: "Filter by visibility status" },
        availability: { type: "string", description: "Filter by availability: available, disabled, preorder" },
        include: { type: "string", description: "Sub-resources to include: variants, images, custom_fields, bulk_pricing_rules, primary_image, modifiers, options, videos" },
      },
    },
  },
  {
    name: "get_product",
    description: "Get a specific product by ID with full details",
    inputSchema: {
      type: "object" as const,
      properties: {
        product_id: { type: "number", description: "Product ID" },
        include: { type: "string", description: "Sub-resources to include: variants, images, custom_fields, bulk_pricing_rules, primary_image, modifiers, options, videos" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "create_product",
    description: "Create a new product in BigCommerce catalog",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Product name (required)" },
        type: { type: "string", description: "Product type: physical, digital (required)" },
        weight: { type: "number", description: "Product weight (required for physical)" },
        price: { type: "number", description: "Product price (required)" },
        sku: { type: "string", description: "Stock Keeping Unit" },
        description: { type: "string", description: "Product description (HTML allowed)" },
        categories: { type: "array", description: "Array of category IDs", items: { type: "number" } },
        brand_id: { type: "number", description: "Brand ID" },
        inventory_level: { type: "number", description: "Current inventory level" },
        inventory_tracking: { type: "string", description: "Inventory tracking: none, product, variant" },
        is_visible: { type: "boolean", description: "Whether product is visible on storefront" },
        availability: { type: "string", description: "Availability: available, disabled, preorder" },
        cost_price: { type: "number", description: "Cost price for profit calculations" },
        sale_price: { type: "number", description: "Sale price" },
      },
      required: ["name", "type", "weight", "price"],
    },
  },
  {
    name: "update_product",
    description: "Update an existing product in BigCommerce",
    inputSchema: {
      type: "object" as const,
      properties: {
        product_id: { type: "number", description: "Product ID (required)" },
        name: { type: "string", description: "Product name" },
        price: { type: "number", description: "Product price" },
        sku: { type: "string", description: "Stock Keeping Unit" },
        description: { type: "string", description: "Product description" },
        categories: { type: "array", description: "Array of category IDs", items: { type: "number" } },
        inventory_level: { type: "number", description: "Current inventory level" },
        is_visible: { type: "boolean", description: "Whether product is visible" },
        availability: { type: "string", description: "Availability: available, disabled, preorder" },
        sale_price: { type: "number", description: "Sale price" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "list_orders",
    description: "List orders from BigCommerce (V2 API)",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max orders to return (default 50, max 250)" },
        page: { type: "number", description: "Page number for pagination" },
        min_date_created: { type: "string", description: "Filter by min creation date (RFC 2822 or ISO 8601)" },
        max_date_created: { type: "string", description: "Filter by max creation date" },
        status_id: { type: "number", description: "Filter by status ID" },
        customer_id: { type: "number", description: "Filter by customer ID" },
        min_total: { type: "number", description: "Filter by minimum total" },
        max_total: { type: "number", description: "Filter by maximum total" },
        is_deleted: { type: "boolean", description: "Include deleted orders" },
        sort: { type: "string", description: "Sort field: id, date_created, date_modified, status_id" },
      },
    },
  },
  {
    name: "get_order",
    description: "Get a specific order by ID with full details",
    inputSchema: {
      type: "object" as const,
      properties: {
        order_id: { type: "number", description: "Order ID" },
        include_products: { type: "boolean", description: "Include order products (separate call)" },
        include_shipping: { type: "boolean", description: "Include shipping addresses (separate call)" },
      },
      required: ["order_id"],
    },
  },
  {
    name: "list_customers",
    description: "List customers from BigCommerce",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max customers to return (default 50, max 250)" },
        page: { type: "number", description: "Page number for pagination" },
        email: { type: "string", description: "Filter by email address" },
        name: { type: "string", description: "Filter by name (first or last)" },
        company: { type: "string", description: "Filter by company name" },
        customer_group_id: { type: "number", description: "Filter by customer group ID" },
        date_created_min: { type: "string", description: "Filter by minimum creation date" },
        date_created_max: { type: "string", description: "Filter by maximum creation date" },
        include: { type: "string", description: "Sub-resources: addresses, storecredit, attributes, formfields" },
      },
    },
  },
  {
    name: "update_inventory",
    description: "Update inventory level for a product or variant",
    inputSchema: {
      type: "object" as const,
      properties: {
        product_id: { type: "number", description: "Product ID (required)" },
        variant_id: { type: "number", description: "Variant ID (if updating variant inventory)" },
        inventory_level: { type: "number", description: "New inventory level (required)" },
        inventory_warning_level: { type: "number", description: "Low stock warning threshold" },
      },
      required: ["product_id", "inventory_level"],
    },
  },
];

// ============================================
// TOOL HANDLERS
// ============================================
async function handleTool(client: BigCommerceClient, name: string, args: any) {
  switch (name) {
    case "list_products": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.page) params.page = String(args.page);
      if (args.name) params['name:like'] = args.name;
      if (args.sku) params.sku = args.sku;
      if (args.brand_id) params.brand_id = String(args.brand_id);
      if (args.categories) params['categories:in'] = args.categories;
      if (args.is_visible !== undefined) params.is_visible = String(args.is_visible);
      if (args.availability) params.availability = args.availability;
      if (args.include) params.include = args.include;
      return await client.getV3("/catalog/products", params);
    }

    case "get_product": {
      const params: Record<string, string> = {};
      if (args.include) params.include = args.include;
      return await client.getV3(`/catalog/products/${args.product_id}`, params);
    }

    case "create_product": {
      const productData: any = {
        name: args.name,
        type: args.type,
        weight: args.weight,
        price: args.price,
      };
      if (args.sku) productData.sku = args.sku;
      if (args.description) productData.description = args.description;
      if (args.categories) productData.categories = args.categories;
      if (args.brand_id) productData.brand_id = args.brand_id;
      if (args.inventory_level !== undefined) productData.inventory_level = args.inventory_level;
      if (args.inventory_tracking) productData.inventory_tracking = args.inventory_tracking;
      if (args.is_visible !== undefined) productData.is_visible = args.is_visible;
      if (args.availability) productData.availability = args.availability;
      if (args.cost_price !== undefined) productData.cost_price = args.cost_price;
      if (args.sale_price !== undefined) productData.sale_price = args.sale_price;
      return await client.postV3("/catalog/products", productData);
    }

    case "update_product": {
      const updateData: any = {};
      if (args.name) updateData.name = args.name;
      if (args.price !== undefined) updateData.price = args.price;
      if (args.sku) updateData.sku = args.sku;
      if (args.description) updateData.description = args.description;
      if (args.categories) updateData.categories = args.categories;
      if (args.inventory_level !== undefined) updateData.inventory_level = args.inventory_level;
      if (args.is_visible !== undefined) updateData.is_visible = args.is_visible;
      if (args.availability) updateData.availability = args.availability;
      if (args.sale_price !== undefined) updateData.sale_price = args.sale_price;
      return await client.putV3(`/catalog/products/${args.product_id}`, updateData);
    }

    case "list_orders": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.page) params.page = String(args.page);
      if (args.min_date_created) params.min_date_created = args.min_date_created;
      if (args.max_date_created) params.max_date_created = args.max_date_created;
      if (args.status_id) params.status_id = String(args.status_id);
      if (args.customer_id) params.customer_id = String(args.customer_id);
      if (args.min_total) params.min_total = String(args.min_total);
      if (args.max_total) params.max_total = String(args.max_total);
      if (args.is_deleted !== undefined) params.is_deleted = String(args.is_deleted);
      if (args.sort) params.sort = args.sort;
      return await client.getV2("/orders", params);
    }

    case "get_order": {
      const order = await client.getV2(`/orders/${args.order_id}`);
      const result: any = { order };

      if (args.include_products) {
        result.products = await client.getV2(`/orders/${args.order_id}/products`);
      }
      if (args.include_shipping) {
        result.shipping_addresses = await client.getV2(`/orders/${args.order_id}/shipping_addresses`);
      }

      return result;
    }

    case "list_customers": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.page) params.page = String(args.page);
      if (args.email) params['email:in'] = args.email;
      if (args.name) params['name:like'] = args.name;
      if (args.company) params['company:like'] = args.company;
      if (args.customer_group_id) params.customer_group_id = String(args.customer_group_id);
      if (args.date_created_min) params['date_created:min'] = args.date_created_min;
      if (args.date_created_max) params['date_created:max'] = args.date_created_max;
      if (args.include) params.include = args.include;
      return await client.getV3("/customers", params);
    }

    case "update_inventory": {
      if (args.variant_id) {
        // Update variant inventory
        const variantData: any = {
          inventory_level: args.inventory_level,
        };
        if (args.inventory_warning_level !== undefined) {
          variantData.inventory_warning_level = args.inventory_warning_level;
        }
        return await client.putV3(
          `/catalog/products/${args.product_id}/variants/${args.variant_id}`,
          variantData
        );
      } else {
        // Update product inventory
        const productData: any = {
          inventory_level: args.inventory_level,
        };
        if (args.inventory_warning_level !== undefined) {
          productData.inventory_warning_level = args.inventory_warning_level;
        }
        return await client.putV3(`/catalog/products/${args.product_id}`, productData);
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ============================================
// SERVER SETUP
// ============================================
async function main() {
  const accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN;
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  if (!accessToken) {
    console.error("Error: BIGCOMMERCE_ACCESS_TOKEN environment variable required");
    process.exit(1);
  }
  if (!storeHash) {
    console.error("Error: BIGCOMMERCE_STORE_HASH environment variable required");
    process.exit(1);
  }

  const client = new BigCommerceClient(accessToken, storeHash);

  const server = new Server(
    { name: `${MCP_NAME}-mcp`, version: MCP_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleTool(client, name, args || {});
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${MCP_NAME} MCP server running on stdio`);
}

main().catch(console.error);
