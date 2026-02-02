> **🚀 Don't want to self-host?** [Join the waitlist for our fully managed solution →](https://mcpengage.com/bigcommerce)
> 
> Zero setup. Zero maintenance. Just connect and automate.

---

# 🚀 BigCommerce MCP Server — 2026 Complete Version

## 💡 What This Unlocks

**This MCP server gives AI direct access to your BigCommerce e-commerce store.** Instead of manually managing products, orders, and inventory through the dashboard, you just *tell* the AI what you need — in plain English.

### 🎯 E-Commerce Power Moves

The AI can directly control your BigCommerce store with natural language:

1. **Inventory Intelligence** — "Check stock levels for all products under 10 units and flag which need reordering"
2. **Order Fulfillment** — "Show me all pending orders from the last 3 days and update their status to shipped"
3. **Product Management** — "Create 5 new product variants for our summer collection with pricing tiers"
4. **Customer Insights** — "List all customers who made purchases over $500 in the last month"
5. **Bulk Operations** — "Update inventory for all 'winter collection' items to clearance pricing"

### 🔗 The Real Power: Combining Tools

AI can chain multiple BigCommerce operations together in one conversation:

- Query low-stock items → Generate reorder report → Update inventory levels
- Search high-value orders → Export customer emails → Create marketing segment
- Analyze product performance → Adjust pricing → Notify sales team
- Pull order data → Match with inventory → Generate fulfillment list

## 📦 What's Inside

**8 powerful API tools** covering the BigCommerce e-commerce platform:
- `list_products` — Browse catalog with filtering and pagination
- `get_product` — Get full product details
- `create_product` — Add new products to catalog
- `update_product` — Modify existing products
- `list_orders` — Query orders with advanced filters
- `get_order` — Get complete order details
- `list_customers` — Browse customer database
- `update_inventory` — Adjust stock levels

All with proper error handling, automatic authentication, and TypeScript types.

## 🚀 Quick Start

### Option 1: Claude Desktop (Local)

1. **Clone and build:**
   ```bash
   git clone https://github.com/BusyBee3333/BigCommerce-MCP-2026-Complete.git
   cd bigcommerce-mcp-2026-complete
   npm install
   npm run build
   ```

2. **Get your BigCommerce API credentials:**
   - Log in to your BigCommerce control panel
   - Go to **Settings → API → API Accounts → Create API Account**
   - Set permissions: **Products** (modify), **Orders** (read), **Customers** (read)
   - Copy your **Access Token** and **Store Hash** (from store URL: `store-{HASH}.mybigcommerce.com`)

3. **Configure Claude Desktop:**
   
   On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "bigcommerce": {
         "command": "node",
         "args": ["/ABSOLUTE/PATH/TO/bigcommerce-mcp-2026-complete/dist/index.js"],
         "env": {
           "BIGCOMMERCE_ACCESS_TOKEN": "your-access-token-here",
           "BIGCOMMERCE_STORE_HASH": "your-store-hash"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

### Option 2: Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/bigcommerce-mcp)

1. Click the button above
2. Set your BigCommerce API credentials in Railway dashboard
3. Use the Railway URL as your MCP server endpoint

### Option 3: Docker

```bash
docker build -t bigcommerce-mcp .
docker run -p 3000:3000 \
  -e BIGCOMMERCE_ACCESS_TOKEN=your-token \
  -e BIGCOMMERCE_STORE_HASH=your-hash \
  bigcommerce-mcp
```

## 🔐 Authentication

**BigCommerce uses API Account authentication with Store Hash + Access Token.**

**Setup Steps:**
1. In BigCommerce admin: **Settings → API → API Accounts → Create API Account**
2. Choose **V3 API** scope (recommended for this server)
3. Set OAuth Scopes:
   - **Products**: Read-only or Modify (required for product tools)
   - **Orders**: Read-only (required for order tools)
   - **Customers**: Read-only (required for customer tools)
4. Save credentials securely

**API Documentation:** https://developer.bigcommerce.com/docs/rest-management/authentication

The MCP server handles all API requests automatically using your credentials.

## 🎯 Example Prompts

Once connected to Claude, you can use natural language for e-commerce operations:

**Inventory Management:**
- *"Show me all products with inventory below 5 units"*
- *"Update inventory for product ID 123 to 50 units"*
- *"List all out-of-stock items in the 'Electronics' category"*

**Order Fulfillment:**
- *"Get all orders placed in the last 48 hours"*
- *"Show me order details for order #45678 including products and shipping"*
- *"List orders over $200 from this week"*

**Product Management:**
- *"Create a new product called 'Premium Headphones' priced at $99.99"*
- *"Update the price of SKU 'SUMMER-2024' to $79.99"*
- *"Show me all products in the 'Winter Sale' category"*

**Customer Intelligence:**
- *"List customers who joined in the last 30 days"*
- *"Find all customers with email containing '@company.com'"*
- *"Show me customers in the VIP customer group"*

**Bulk Operations:**
- *"Generate a report of all products needing restock"*
- *"Export all order data from January 2024"*
- *"List all visible products with sale prices"*

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- BigCommerce store with API access

### Setup

```bash
git clone https://github.com/BusyBee3333/BigCommerce-MCP-2026-Complete.git
cd bigcommerce-mcp-2026-complete
npm install
cp .env.example .env
# Edit .env with your BigCommerce credentials
npm run build
npm start
```

### Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## 🐛 Troubleshooting

### "Authentication failed"
- Verify your **Access Token** and **Store Hash** are correct
- Check that your API account hasn't been deleted/revoked
- Ensure your API account has the necessary OAuth scopes enabled

### "Tools not appearing in Claude"
- Restart Claude Desktop after updating config
- Check that the path in `claude_desktop_config.json` is **absolute** (not relative)
- Verify the build completed successfully (`dist/index.js` exists)

### "API rate limit exceeded"
- BigCommerce has rate limits: 20,000 requests/hour (standard plans)
- The server respects rate limits automatically
- Consider spreading large operations over time

## 📖 Resources

- [BigCommerce API Documentation](https://developer.bigcommerce.com/docs/rest-management)
- [BigCommerce API Reference](https://developer.bigcommerce.com/api-reference)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop Documentation](https://claude.ai/desktop)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit your changes (`git commit -m 'Add amazing tool'`)
4. Push to the branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Credits

Built by [MCPEngage](https://mcpengage.com) — AI infrastructure for business software.

Want more MCP servers? Check out our [full catalog](https://mcpengage.com) covering 30+ business platforms.

---

**Questions?** Open an issue or join our [Discord community](https://discord.gg/mcpengine).
