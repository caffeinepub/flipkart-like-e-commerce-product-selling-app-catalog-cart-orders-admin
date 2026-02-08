import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include authorization mixin with role-based access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // === User Profile Type ===
  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // === User Profile Functions (Required by Frontend) ===
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // === Types and Models ===
  type ProductId = Nat;
  type CategoryId = Nat;
  type OrderId = Nat;
  type CartId = Nat;

  public type Product = {
    id : ProductId;
    title : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    categoryId : CategoryId;
    createdAt : Int;
    views : Nat;
    purchases : Nat;
  };

  public type Category = {
    id : CategoryId;
    name : Text;
  };

  public type Order = {
    id : OrderId;
    user : Principal;
    items : [(ProductId, Nat)];
    total : Nat;
    address : Text;
    timestamp : Int;
  };

  public type Cart = {
    user : Principal;
    items : Map.Map<ProductId, Nat>;
  };

  public type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  module Product {
    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.price, product2.price);
    };

    public func compareByTitle(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.title, product2.title);
    };

    public func compareByNewest(product1 : Product, product2 : Product) : Order.Order {
      Int.compare(product2.createdAt, product1.createdAt);
    };

    public func compareByPopularity(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product2.purchases, product1.purchases);
    };
  };

  // === Stable Storage ===
  let productsMap = Map.empty<ProductId, Product>();
  let categoriesMap = Map.empty<CategoryId, Category>();
  let ordersMap = Map.empty<OrderId, Order>();
  let cartsMap = Map.empty<Principal, Cart>();
  var nextProductId = 1;
  var nextCategoryId = 1;
  var nextOrderId = 1;

  // === Initialization and Demo Data ===
  public shared ({ caller }) func initialize() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can initialize");
    };

    // Add demo categories
    let electronics : Category = {
      id = nextCategoryId;
      name = "Electronics";
    };
    categoriesMap.add(electronics.id, electronics);
    nextCategoryId += 1;

    let clothing : Category = {
      id = nextCategoryId;
      name = "Clothing";
    };
    categoriesMap.add(clothing.id, clothing);
    nextCategoryId += 1;

    // Add demo products
    let phone : Product = {
      id = nextProductId;
      title = "Smartphone";
      description = "Latest model smartphone with advanced features";
      price = 2000_00; // $2000.00
      stock = 10;
      categoryId = electronics.id;
      createdAt = Time.now();
      views = 0;
      purchases = 0;
    };
    productsMap.add(phone.id, phone);
    nextProductId += 1;

    let laptop : Product = {
      id = nextProductId;
      title = "Laptop";
      description = "High-performance laptop for professionals";
      price = 3500_00; // $3500.00
      stock = 5;
      categoryId = electronics.id;
      createdAt = Time.now();
      views = 0;
      purchases = 0;
    };
    productsMap.add(laptop.id, laptop);
    nextProductId += 1;

    let tshirt : Product = {
      id = nextProductId;
      title = "T-Shirt";
      description = "Comfortable cotton t-shirt";
      price = 50_00; // $50.00
      stock = 50;
      categoryId = clothing.id;
      createdAt = Time.now();
      views = 0;
      purchases = 0;
    };
    productsMap.add(tshirt.id, tshirt);
    nextProductId += 1;
  };

  // === Products and Categories (Public - No Auth Required) ===
  public query func listProducts(page : ?Nat, pageSize : ?Nat) : async [Product] {
    // Public access - anyone can browse products
    let allProducts = productsMap.values().toArray();
    let sorted = allProducts.sort(Product.compareByNewest);

    let actualPage = switch (page) { case (?p) { p }; case null { 0 } };
    let actualPageSize = switch (pageSize) { case (?ps) { ps }; case null { 20 } };
    let start = actualPage * actualPageSize;
    let end = start + actualPageSize;

    if (start >= sorted.size()) {
      return [];
    };

    let endIndex = if (end > sorted.size()) { sorted.size() } else { end };

    if (endIndex <= start) {
      return [];
    };

    var result : [Product] = [];
    for (index in Nat.range(0, endIndex - start)) {
      let actualIndex = start + index;
      if (actualIndex < sorted.size()) {
        result := result.concat([sorted[actualIndex]]);
      };
    };
    result;
  };

  public query func filterProductsByCategory(categoryId : CategoryId) : async [Product] {
    // Public access - anyone can filter products
    let filtered = productsMap.values().filter(func(p : Product) : Bool {
      p.categoryId == categoryId;
    });
    filtered.toArray().sort(Product.compareByNewest);
  };

  public query func searchProducts(keyword : Text) : async [Product] {
    // Public access - anyone can search products
    let filtered = productsMap.values().filter(func(p : Product) : Bool {
      p.title.contains(#text keyword) or p.description.contains(#text keyword);
    });
    filtered.toArray().sort(Product.compareByNewest);
  };

  public shared func getProduct(productId : ProductId) : async ?Product {
    // Public access - increment view counter
    switch (productsMap.get(productId)) {
      case (null) { null };
      case (?product) {
        let updated = {
          product with views = product.views + 1;
        };
        productsMap.add(productId, updated);
        ?updated;
      };
    };
  };

  public query func listCategories() : async [Category] {
    // Public access - anyone can view categories
    categoriesMap.values().toArray();
  };

  // === Admin Product Management ===
  public shared ({ caller }) func addProduct(title : Text, description : Text, price : Nat, stock : Nat, categoryId : CategoryId) : async ProductId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add products");
    };

    if (title.size() == 0) {
      Runtime.trap("Product title cannot be empty");
    };

    if (price == 0) {
      Runtime.trap("Product price must be greater than zero");
    };

    switch (categoriesMap.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {};
    };

    let newProduct : Product = {
      id = nextProductId;
      title;
      description;
      price;
      stock;
      categoryId;
      createdAt = Time.now();
      views = 0;
      purchases = 0;
    };
    productsMap.add(nextProductId, newProduct);
    nextProductId += 1;
    newProduct.id;
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, title : Text, description : Text, price : Nat, stock : Nat, categoryId : CategoryId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update products");
    };

    let existing = switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (title.size() == 0) {
      Runtime.trap("Product title cannot be empty");
    };

    if (price == 0) {
      Runtime.trap("Product price must be greater than zero");
    };

    switch (categoriesMap.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {};
    };

    let updated : Product = {
      existing with
      title;
      description;
      price;
      stock;
      categoryId;
    };
    productsMap.add(productId, updated);
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete products");
    };

    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        productsMap.remove(productId);
      };
    };
  };

  public shared ({ caller }) func addCategory(name : Text) : async CategoryId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add categories");
    };

    if (name.size() == 0) {
      Runtime.trap("Category name cannot be empty");
    };

    let newCategory : Category = {
      id = nextCategoryId;
      name;
    };
    categoriesMap.add(nextCategoryId, newCategory);
    nextCategoryId += 1;
    newCategory.id;
  };

  // === Cart Functionality (User Auth Required) ===
  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than zero");
    };

    let product = switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (quantity > product.stock) {
      Runtime.trap("Not enough stock available");
    };

    let existingCart = cartsMap.get(caller);
    let items = switch (existingCart) {
      case (null) { Map.empty<ProductId, Nat>() };
      case (?cart) { cart.items };
    };

    let currentQty = switch (items.get(productId)) {
      case (null) { 0 };
      case (?q) { q };
    };

    items.add(productId, currentQty + quantity);
    let cart = {
      user = caller;
      items;
    };
    cartsMap.add(caller, cart);
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify cart");
    };

    let cart = switch (cartsMap.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?c) { c };
    };

    cart.items.remove(productId);
    cartsMap.add(caller, cart);
  };

  public shared ({ caller }) func updateCartQuantity(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than zero. Use removeFromCart to remove items.");
    };

    let product = switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (quantity > product.stock) {
      Runtime.trap("Not enough stock available");
    };

    let cart = switch (cartsMap.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?c) { c };
    };

    cart.items.add(productId, quantity);
    cartsMap.add(caller, cart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    let cart = switch (cartsMap.get(caller)) {
      case (null) { return [] };
      case (?c) { c };
    };

    cart.items.entries().map(func((productId, quantity)) : CartItem {
      { productId; quantity };
    }).toArray();
  };

  public query ({ caller }) func getCartTotal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    let cart = switch (cartsMap.get(caller)) {
      case (null) { return 0 };
      case (?c) { c };
    };

    var total = 0;
    cart.items.entries().forEach(func((productId, quantity)) {
      switch (productsMap.get(productId)) {
        case (null) {};
        case (?product) {
          total += product.price * quantity;
        };
      };
    });
    total;
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    cartsMap.remove(caller);
  };

  // === Checkout and Orders (User Auth Required) ===
  public shared ({ caller }) func checkout(address : Text) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };

    if (address.size() == 0) {
      Runtime.trap("Shipping address cannot be empty");
    };

    let cart = switch (cartsMap.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) { c };
    };

    if (cart.items.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    let validatedItems = List.empty<(ProductId, Nat)>();
    var total = 0;

    cart.items.entries().forEach(func((productId, quantity)) {
      let product = switch (productsMap.get(productId)) {
        case (null) { Runtime.trap("Product not found: " # productId.toText()) };
        case (?p) { p };
      };

      if (quantity > product.stock) {
        Runtime.trap("Not enough stock for " # product.title);
      };

      validatedItems.add((productId, quantity));
      total += product.price * quantity;
    });

    let order : Order = {
      id = nextOrderId;
      user = caller;
      items = validatedItems.toArray();
      total;
      address;
      timestamp = Time.now();
    };

    ordersMap.add(nextOrderId, order);

    updateInventory(cart);
    cartsMap.remove(caller);
    nextOrderId += 1;

    order.id;
  };

  func updateInventory(cart : Cart) {
    cart.items.entries().forEach(func((productId, quantity)) {
      switch (productsMap.get(productId)) {
        case (null) {};
        case (?product) {
          productsMap.add(productId, {
            product with
            stock = product.stock - quantity;
            purchases = product.purchases + quantity;
          });
        };
      };
    });
  };

  public query ({ caller }) func getOrderHistory() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order history");
    };

    let userOrders = ordersMap.values().filter(func(order : Order) : Bool {
      order.user == caller;
    });
    userOrders.toArray();
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (ordersMap.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  // === Admin Order Management ===
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all orders");
    };

    ordersMap.values().toArray();
  };

  public query ({ caller }) func getOrdersByUser(user : Principal) : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view user orders");
    };

    let userOrders = ordersMap.values().filter(func(order : Order) : Bool {
      order.user == user;
    });
    userOrders.toArray();
  };

  // === Analytics ===
  public query func getPopularProducts(limit : Nat) : async [Product] {
    // Public access - anyone can view popular products
    let sorted = productsMap.values().toArray().sort(Product.compareByPopularity);
    let actualLimit = if (limit > sorted.size()) { sorted.size() } else { limit };
    if (actualLimit == 0) { return [] };
    var result : [Product] = [];
    for (i in Nat.range(0, actualLimit)) {
      result := result.concat([sorted[i]]);
    };
    result;
  };
};
