"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const products = require("./items.json");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(':memory:');
class Product {
    id; //change number to string.
    name;
    price;
    description;
    quantity;
    constructor(name, price, description) {
        this.id = (0, uuid_1.v4)();
        this.name = name;
        this.price = price;
        this.description = description;
        this.quantity = 0;
    }
    getId() {
        return this.id;
    }
    setQuantity(quantity) {
        this.quantity = quantity;
    }
    getQuantity() {
        return this.quantity;
    }
}
;
class Customer {
    id;
    name;
    age;
    quantity;
    products;
    constructor(name, age) {
        this.id = (0, uuid_1.v4)();
        this.name = name;
        this.age = age;
        this.products = [];
    }
    addProducts(product) {
        this.products.push(product);
    }
    productsTotal() {
        return this.products.length;
    }
    getAllProducts() {
        return this.getAllProducts();
    }
    removeProduct(product) {
        this.products = this.products.filter((productItem) => productItem !== product);
    }
    printCart() {
        console.log("User's Cart:");
        if (this.products.length === 0) {
            console.log("The cart is empty.");
        }
        else {
            this.products.forEach((product) => {
                if (product) {
                    console.log(`Name: ${product.name}`);
                    console.log(`Price: $${product.price}`);
                    console.log(`Description: ${product.description}`);
                    console.log('-------------------');
                }
            });
        }
    }
    removeQuantityFromCart(product, quantity) {
        const existingProduct = this.products.find((prod) => prod.getId() === product.getId());
        if (existingProduct) {
            existingProduct.setQuantity(existingProduct.getQuantity() - quantity);
            if (existingProduct.getQuantity() <= 0) {
                this.removeProduct(product);
            }
        }
    }
}
;
class Shop {
    product;
    constructor() {
        this.product = [];
    }
    addShopProduct(name, price, description) {
        const newProduct = new Product(name, price, description);
        this.product.push(newProduct);
    }
    getProducts() {
        return this.product;
    }
}
function createCustomer(name, age) {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        db.run('INSERT INTO Customers (id, name, age) VALUES (?, ?, ?)', [id, name, age], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(new Customer(name, age));
            }
        });
    });
}
function createProduct(id, name, price, description) {
    return {
        id,
        name,
        price,
        description,
        quantity: 0,
        getId() {
            return this.id;
        },
        setQuantity(quantity) {
            this.quantity = quantity;
        },
        getQuantity() {
            return this.quantity;
        }
    };
}
function addToCart(product, customer) {
    customer.products.push(product);
}
function removeFromCart(product, customer) {
    customer.products = customer.products.filter((cartProduct) => cartProduct.id !== product.id);
}
function removeQuantityFromCart(product, customer, quantity) {
    const existingProduct = customer.products.find((cartProduct) => cartProduct.id === product.id);
    if (existingProduct) {
        existingProduct.quantity -= quantity;
        if (existingProduct.quantity <= 0) {
            removeFromCart(product, customer);
        }
    }
}
function calculateCartTotal(customer) {
    return customer.products.reduce((total, product) => total + product.price, 0);
}
function printCustomerCart(customer) {
    console.log("Customer's Cart:");
    customer.products.forEach((product) => {
        console.log('-------------------');
        console.log(`Name: ${product.name}`);
        console.log(`Price: $${product.price}`);
        console.log(`Description: ${product.description}`);
        console.log('-------------------');
    });
}
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS Customers (
      id TEXT PRIMARY KEY,
      name TEXT,
      age INTEGER
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      price REAL,
      description TEXT,
      quantity INTEGER DEFAULT 0
    )
  `);
    const stmt = db.prepare('INSERT INTO Products (id, name, price, description) VALUES (?, ?, ?, ?)');
    products.forEach((item) => {
        stmt.run(item.id, item.name, item.price, item.description);
    });
    stmt.finalize();
    createCustomer('John Doe', 25)
        .then((customer) => {
        products.forEach((item) => {
            const newProduct = createProduct(item.id, item.name, item.price, item.description);
            addToCart(newProduct, customer);
        });
        printCustomerCart(customer);
        console.log('Cart Total:', calculateCartTotal(customer));
        db.all('SELECT * FROM Customers', [], (err, rows) => {
            if (err) {
                console.error('Error selecting customers:', err);
            }
            else {
                console.log('Customers:');
                console.log(rows);
            }
        });
        db.all('SELECT * FROM Products', [], (err, rows) => {
            if (err) {
                console.error('Error while selecting the products:', err);
            }
            else {
                console.log(`Showing Products from the database:`);
                console.log(rows);
                // Perform operations on the retrieved data, if needed
                // Delete the customer
                db.run('DELETE FROM Customers WHERE id = ?', [customer.id], function (err) {
                    if (err) {
                        console.error('Error while deleting the customer:', err);
                    }
                    else {
                        console.log('The customer was deleted successfully.');
                    }
                });
                // Delete the products
                db.run('DELETE FROM Products', function (err) {
                    if (err) {
                        console.error('Error while deleting the products:', err);
                    }
                    else {
                        console.log('the products were deleted successfully.');
                    }
                });
            }
        });
        db.close();
    })
        .catch((err) => {
        console.error('Error creating customer:', err);
    });
});
const shop = new Shop();
const customer = new Customer('John Doe', 25);
customer.addProducts(shop.getProducts()[0]);
customer.addProducts(shop.getProducts()[1]);
customer.addProducts(shop.getProducts()[2]);
customer.printCart();
console.log('Cart Total:', customer.productsTotal());
customer.removeProduct(shop.getProducts()[1]);
customer.removeQuantityFromCart(shop.getProducts()[2], 1);
customer.printCart();
console.log('Cart Total:', customer.productsTotal());
