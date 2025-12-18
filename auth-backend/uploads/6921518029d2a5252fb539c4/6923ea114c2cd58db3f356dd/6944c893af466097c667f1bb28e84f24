-- This sample SQL file is provided by Sample-Files.com
-- Visit https://Sample-Files.com for more sample files and resources.

-- Create tables for demonstrating JOIN operations
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(50) NOT NULL
);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    amount DECIMAL(10, 2),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL
);

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Insert sample data into the tables
INSERT INTO customers (customer_name) VALUES ('Alice');
INSERT INTO customers (customer_name) VALUES ('Bob');

INSERT INTO orders (customer_id, order_date, amount) VALUES (1, '2023-01-15', 150.00);
INSERT INTO orders (customer_id, order_date, amount) VALUES (2, '2023-01-16', 200.00);

INSERT INTO products (product_name) VALUES ('Laptop');
INSERT INTO products (product_name) VALUES ('Smartphone');

INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 1, 1);
INSERT INTO order_items (order_id, product_id, quantity) VALUES (2, 2, 2);

-- Inner Join to get customer orders
SELECT customers.customer_name, orders.order_date, orders.amount
FROM customers
INNER JOIN orders ON customers.customer_id = orders.customer_id;

-- Left Join to get all customers and their orders
SELECT customers.customer_name, orders.order_date, orders.amount
FROM customers
LEFT JOIN orders ON customers.customer_id = orders.customer_id;

-- Right Join to get all orders and their customers
SELECT customers.customer_name, orders.order_date, orders.amount
FROM customers
RIGHT JOIN orders ON customers.customer_id = orders.customer_id;

-- Full Outer Join to get all customers and orders (simulated in MySQL using UNION)
SELECT customers.customer_name, orders.order_date, orders.amount
FROM customers
LEFT JOIN orders ON customers.customer_id = orders.customer_id
UNION
SELECT customers.customer_name, orders.order_date, orders.amount
FROM customers
RIGHT JOIN orders ON customers.customer_id = orders.customer_id;

-- Join multiple tables to get detailed order information
SELECT customers.customer_name, orders.order_date, products.product_name, order_items.quantity
FROM customers
JOIN orders ON customers.customer_id = orders.customer_id
JOIN order_items ON orders.order_id = order_items.order_id
JOIN products ON order_items.product_id = products.product_id;
