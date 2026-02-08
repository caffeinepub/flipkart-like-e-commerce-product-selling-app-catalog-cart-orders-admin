# Specification

## Summary
**Goal:** Build a Flipkart-like e-commerce app with browsing, cart, checkout-to-orders, and an admin/seller area, backed by stable canister storage and Internet Identity sign-in.

**Planned changes:**
- Add Internet Identity authentication with an account area showing the logged-in principal and sign-out.
- Implement backend stable data models for categories, products (with images, stock, seller, timestamps), carts, orders (items, totals, statuses, shipping address), and user roles with server-side checks.
- Expose product discovery APIs: paginated listing, category filtering, sorting (newest/price), keyword search, plus “popular” based on internal view/purchase counters.
- Build storefront UI: home with featured sections, product listing with search/filter/sort, and product detail with image gallery, stock status, and add-to-cart.
- Implement end-to-end cart: add/remove/update quantities, totals, persistence for signed-in users (optional ephemeral cart for signed-out users).
- Implement checkout and orders (no external payments): shipping address form + validation, stock validation, order creation, stock decrement, cart clearing, order confirmation and order history/detail views.
- Add role-protected admin/seller UI for product CRUD, inventory management, and viewing incoming orders; block/hide admin routes for unauthorized users.
- Seed initial demo categories and products on first deploy without overwriting existing data.
- Apply a coherent modern responsive theme with Tailwind across all pages, avoiding a blue/purple-dominant palette.
- Add navigation/routing for Home, Shop, Product Detail, Cart, Checkout, Orders, Account, and Admin; support deep links.
- Add input validation and consistent, user-friendly error messages for product creation, cart updates, checkout, and order creation.
- Generate and include static brand assets (logo, hero/banner, empty cart illustration) and reference them from the frontend.

**User-visible outcome:** Users can browse and search products, view details, manage a cart, place mock checkout orders with shipping details, and view order history; admins/sellers can manage products and inventory and review orders, with consistent theming and navigation.
