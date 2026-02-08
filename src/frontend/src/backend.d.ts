import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    title: string;
    views: bigint;
    createdAt: bigint;
    description: string;
    stock: bigint;
    purchases: bigint;
    price: bigint;
}
export interface Category {
    id: CategoryId;
    name: string;
}
export type CategoryId = bigint;
export type ProductId = bigint;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface Order {
    id: OrderId;
    total: bigint;
    user: Principal;
    address: string;
    timestamp: bigint;
    items: Array<[ProductId, bigint]>;
}
export type OrderId = bigint;
export interface UserProfile {
    name: string;
    email?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string): Promise<CategoryId>;
    addProduct(title: string, description: string, price: bigint, stock: bigint, categoryId: CategoryId): Promise<ProductId>;
    addToCart(productId: ProductId, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(address: string): Promise<OrderId>;
    clearCart(): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    filterProductsByCategory(categoryId: CategoryId): Promise<Array<Product>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCartTotal(): Promise<bigint>;
    getOrder(orderId: OrderId): Promise<Order | null>;
    getOrderHistory(): Promise<Array<Order>>;
    getOrdersByUser(user: Principal): Promise<Array<Order>>;
    getPopularProducts(limit: bigint): Promise<Array<Product>>;
    getProduct(productId: ProductId): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(): Promise<Array<Category>>;
    listProducts(page: bigint | null, pageSize: bigint | null): Promise<Array<Product>>;
    removeFromCart(productId: ProductId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(keyword: string): Promise<Array<Product>>;
    updateCartQuantity(productId: ProductId, quantity: bigint): Promise<void>;
    updateProduct(productId: ProductId, title: string, description: string, price: bigint, stock: bigint, categoryId: CategoryId): Promise<void>;
}
