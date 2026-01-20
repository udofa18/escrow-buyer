# Escrow Buyer - Product Store

A modern e-commerce product store built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🏪 Store front with product listings
- 📦 Product detail pages
- 🛒 Shopping cart functionality
- 💳 Checkout flow (contact info & review)
- 🎟️ Discount code system
- 💰 Payment transfer screen
- ⏳ Payment processing screen
- 🎨 Reusable components with consistent styling
- 🔄 Global error handling
- 📡 RESTful API routes

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install react-icons (if not already installed):
```bash
npm install react-icons
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
escrow-buyer/
├── app/
│   ├── api/              # API routes
│   │   ├── products/     # Product endpoints
│   │   ├── cart/         # Cart endpoints
│   │   ├── discount/     # Discount code validation
│   │   ├── orders/       # Order management
│   │   └── payment/      # Payment processing
│   ├── checkout/         # Checkout pages
│   │   ├── contact/      # Contact information
│   │   └── review/       # Order review
│   ├── product/          # Product detail pages
│   ├── cart/             # Shopping cart
│   ├── transfer/         # Payment transfer screen
│   ├── processing/       # Payment processing screen
│   └── page.tsx          # Store front (homepage)
├── components/           # Reusable components
│   └── Button.tsx        # Button component
├── lib/                  # Utilities
│   ├── api-client.ts     # API client with fetch
│   ├── api-store.ts      # Shared API state
│   └── error-handler.tsx # Global error handling
├── types/                # TypeScript types
│   └── index.ts          # Type definitions
└── data/                 # Dummy data
    └── products.ts       # Product data
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[productId]` - Update cart item quantity
- `DELETE /api/cart/[productId]` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Discount
- `GET /api/discount/[code]` - Validate discount code

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]/status` - Update order status

### Payment
- `GET /api/payment/account/[orderId]` - Get payment account details
- `POST /api/payment/confirm/[orderId]` - Confirm payment
- `POST /api/payment/cancel/[orderId]` - Cancel payment

## Discount Codes

Available discount codes (for testing):
- `SAVE10` - 10% off
- `WELCOME20` - 20% off
- `NOIR15` - 15% off

## Styling

- Primary color: `#5D0C97` (purple)
- Built with Tailwind CSS
- Responsive design
- Uses react-icons for icons

## Notes

- The API uses in-memory storage for development. In production, replace with a database.
- Product images should be placed in the `/public/products/` directory.
- The store uses sessionStorage to pass data between checkout steps.
