import * as products from './items.json';
import * as sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import './style.css';
const db = new sqlite3.Database(':memory:');


class Product {
  id: string;
  name: string;
  price: number;
  description: string;

   constructor(name: string, price: number, description: string) {
    this.id = uuidv4();
    this.name = name;
    this.price = price;
    this.description = description;
   }
  
  getId() : string {
    return this.id;
  }
};

class Customer { //customer aka user
  id: string;
  name: string;
  age: number;
  quantity?: number;
  products: Product[];

  constructor(name: string, age: number) {
    this.id = idGen();
    this.name = name;
    this.age = age;
    this.products = [];
  }

  addProducts(product: Product) {
    this.products.push(product);
  }

  productsTotal() {
    return this.products.length;
  }
  getAllProducts() : Product[]{
    return this.getAllProducts();
  }

  removeProduct(product: Product): void {
    this.products = this.products.filter((productItem) => productItem !== product);
  }
  
  printCart(): void {
    console.log("Customers's Cart:");
    if (this.products.length === 0) {
      console.log("The cart is empty.");
    } else {
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

  removeQuantityFromCart(product: Product, quantity: number): void {
    const existingProduct = this.products.find((prod) => prod.getId() === product.getId());
    }
  };

class Shop {
  private product: Product[];

  constructor() {
    this.product = []
  }

  addShopProduct(name: string, price: number, description: string): void {
    const newProduct = new Product(name, price, description);
    this.product.push(newProduct);
  }

  getProducts(): Product[] {
    return this.product;
  }
}

function createCustomer(name: string, age: number): Promise<Customer> {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    db.run(
      'INSERT INTO Customers (id, name, age) VALUES (?, ?, ?)',
      [id, name, age],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(new Customer(name, age));
        }
      }
    );
  });
}

function createProduct(id: string, name: string, price: number, description: string): Product {
  return {
    id,
    name,
    price,
    description,
    getId() {
      return this.id;
    },
  };
}

function addToCart(product: Product, customer: Customer): void {
  customer.products.push(product);
}

function removeFromCart(product: Product, customer: Customer): void {
  customer.products = customer.products.filter((cartProduct) => cartProduct.id !== product.id);
}

function removeQuantityFromCart(product: Product, customer: Customer, quantity: number): void {
  const existingProduct = customer.products.find((cartProduct) => cartProduct.id === product.
  }

function calculateCartTotal(customer: Customer): number {
  return customer.products.reduce((total, product) => total + product.price, 0);
}

function printCustomerCart(customer: Customer): void {
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

  createCustomer('Leisa Trisler', 25)
    .then((customer) => {
      products.forEach((item: any) => {
        const newProduct = createProduct(
          item.id,
          item.name,
          item.price,
          item.description
        );
        addToCart(newProduct, customer);
      });

      printCustomerCart(customer);
      console.log('Customer Cart Total:', calculateCartTotal(customer));

      db.all('SELECT * FROM Customers', [], (err, rows) => {
        if (err) {
          console.error('Error selecting customers:', err);
        } else {
          console.log('Customers:');
          console.log(rows);
        }
      });

      db.all('SELECT * FROM Products', [], (err, rows) => {
        if (err) {
          console.error('Error while selecting the products:', err);
        } else {
          console.log(`Showing Products from the database:`);
          console.log(rows);

          db.run('DELETE FROM Customers WHERE id = ?', [customer.id], function (err) {
            if (err) {
              console.error('Error while deleting the customer:', err);
            } else {
              console.log('The customer was deleted successfully.');
            }
          });
          
          db.run('DELETE FROM Products', function (err) {
            if (err) {
              console.error('Error while deleting the products:', err);
            } else {
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