# FoodOps API Documentation

Base URL: `http://localhost:5000`

---

## 1. Authentication APIs

### Register a User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Content-Type**: `application/json`
- **Body Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "roleName": "Customer" // Optional. Defaults to 'Customer'. Other options: 'Kitchen Staff', 'Cashier', 'Admin'
  }
  ```
- **Success Response (201 Created)**: Returns the user object and a `token` (JWT).

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Content-Type**: `application/json`
- **Body Payload**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response (200 OK)**: Returns the user object and a `token` (JWT).

### Get Current User Profile
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Access**: Private (Requires JWT)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**: Returns the currently authenticated user's details.

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Access**: Public
- **Success Response (200 OK)**: Acknowledges logout (client must destroy the token locally).

---

## 2. Public Menu APIs

### Get All Categories
- **URL**: `/api/categories`
- **Method**: `GET`
- **Access**: Public
- **Success Response (200 OK)**: Returns an array of category objects.

### Get All Menu Items (With Filtering/Searching)
- **URL**: `/api/menu-items`
- **Method**: `GET`
- **Access**: Public
- **Query Parameters (Optional)**:
  - `search` (String): Case-insensitive search on item name and description.
  - `category` (ObjectId): Filter items by a specific Category ID.
  - `minPrice` (Number): Filter items greater than or equal to this price.
  - `maxPrice` (Number): Filter items less than or equal to this price.
  - `inStock` (Boolean): If `true`, only returns items where stock > 0.
- **Example**: `/api/menu-items?search=burger&minPrice=10&inStock=true`
- **Success Response (200 OK)**: Returns an array of populated menu items.

### Get Single Menu Item
- **URL**: `/api/menu-items/:id`
- **Method**: `GET`
- **Access**: Public
- **Success Response (200 OK)**: Returns the requested menu item object.

---

## 4. Discount APIs (Public/Customer)

### Validate & Calculate Discount
- **URL**: `/api/discounts/validate`
- **Method**: `POST`
- **Access**: Private (Requires JWT, Role: Customer)
- **Content-Type**: `application/json`
- **Body Payload**:
  ```json
  {
    "code": "SUMMER20",
    "items": [
      { "menuItem": "64abcdef1234567890abcdef", "quantity": 2 }
    ]
  }
  ```
  *(Note: `items` is optional. If omitted, the API returns the percentage but won't calculate totals)*
- **Success Response (200 OK)**:
  ```json
  {
    "valid": true,
    "code": "SUMMER20",
    "discountPercentage": 20,
    "originalTotal": 25.98,
    "discountedTotal": 20.78
  }
  ```
- **Error Responses (400 Bad Request)**: Returns specific errors if the code is invalid, expired, reached max uses, or if the items provided are out of stock.

---

## 5. Admin Category APIs
*All routes below require `Authorization: Bearer <token>` header and the authenticated user must have the `Admin` role.*

### Create Category
- **URL**: `/api/categories`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body Payload**:
  ```json
  {
    "name": "Burgers",
    "description": "Delicious flame-grilled burgers"
  }
  ```

### Update Category
- **URL**: `/api/categories/:id`
- **Method**: `PATCH`
- **Content-Type**: `application/json`
- **Body Payload**: (Any fields to update)

### Delete Category
- **URL**: `/api/categories/:id`
- **Method**: `DELETE`
- **Note**: Will fail (400 Bad Request) if any menu items are still assigned to this category.

---

## 6. Admin Menu Item APIs
*All routes below require `Authorization: Bearer <token>` header and the authenticated user must have the `Admin` role.*

### Create Menu Item (Supports Image Upload)
- **URL**: `/api/menu-items`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data` (if uploading image file) or `application/json`
- **Body Payload**:
  - `name` (String, required)
  - `price` (Number, required)
  - `category` (ObjectId, required)
  - `stock` (Number, optional, defaults to 0)
  - `description` (String, optional)
  - `image` (File upload OR String URL)

### Update Menu Item
- **URL**: `/api/menu-items/:id`
- **Method**: `PATCH`
- **Content-Type**: `multipart/form-data` (if updating image file) or `application/json`
- **Body Payload**: (Any fields to update, including `image` file)

### Update Menu Item Stock (Quick Action)
- **URL**: `/api/menu-items/:id/availability`
- **Method**: `PATCH`
- **Content-Type**: `application/json`
- **Body Payload**:
  ```json
  {
    "stock": 25
  }
  ```

### Delete Menu Item
- **URL**: `/api/menu-items/:id`
- **Method**: `DELETE`
