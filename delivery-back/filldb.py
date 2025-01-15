import sqlite3

def populate_delivery_db():
    conn = sqlite3.connect('delivery.db')
    c = conn.cursor()

    # Добавляем данные в таблицу users
    c.executemany('''
        INSERT INTO users (login, password, role) VALUES (?, ?, ?)
    ''', [
        ('admin', 'admin123', 'admin'),
        ('customer1', 'password1', 'customer'),
        ('customer2', 'password2', 'customer')
    ])

    # Добавляем данные в таблицу user_personal_info
    c.executemany('''
        INSERT INTO user_personal_info (login, name, birth_date, address, phone_number, secret)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [
        ('customer1', 'Alice Johnson', '1990-01-01', '123 Main St, Cityville', '555-1234', 'secret1'),
        ('customer2', 'Bob Smith', '1992-05-15', '456 Elm St, Townsville', '555-5678', 'secret2')
    ])

    # Добавляем данные в таблицу product_categories
    c.executemany('''
        INSERT INTO product_categories (category_id, store_name, category, secret)
        VALUES (?, ?, ?, ?)
    ''', [
        (1, 'Grocery Store', 'Fruits', 'secret3'),
        (2, 'Grocery Store', 'Bakery', 'secret4'),
        (3, 'Grocery Store', 'Dairy', 'secret5')
    ])

    # Добавляем данные в таблицу products
    c.executemany('''
        INSERT INTO products (article, name, category_id, price, stock, released, secret)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [
        (1001, 'Organic Apples', 1, 3.50, 100, 1, 'secret6'),
        (1002, 'Whole Wheat Bread', 2, 2.00, 50, 1, 'secret7'),
        (1003, 'Fresh Milk', 3, 1.50, 200, 1, 'secret8')
    ])

    # Добавляем данные в таблицу orders
    c.executemany('''
        INSERT INTO orders (order_id, login, order_date, status, secret)
        VALUES (?, ?, ?, ?, ?)
    ''', [
        (1, 'customer1', '2025-01-01 10:00:00', 'completed', 'secret9'),
        (2, 'customer2', '2025-01-02 14:30:00', 'pending', 'secret10')
    ])

    # Добавляем данные в таблицу reviews
    c.executemany('''
        INSERT INTO reviews (review_id, login, article, rating, review_text, review_date, secret)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [
        (1, 'customer1', 1001, 5, 'Great apples!', '2025-01-01 12:00:00', 'secret11'),
        (2, 'customer2', 1002, 4, 'Good bread, but a bit dry.', '2025-01-02 15:00:00', 'secret12')
    ])

    # Добавляем данные в таблицу shipping_addresses
    c.executemany('''
        INSERT INTO shipping_addresses (address_id, login, country, city, street, secret)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [
        (1, 'customer1', 'USA', 'Cityville', '123 Main St', 'secret13'),
        (2, 'customer2', 'USA', 'Townsville', '456 Elm St', 'secret14')
    ])

    # Добавляем данные в таблицу payments
    c.executemany('''
        INSERT INTO payments (order_id, payment_method, amount, payment_status, secret)
        VALUES (?, ?, ?, ?, ?)
    ''', [
        (1, 'Credit Card', 3.50, 'Paid', 'secret15'),
        (2, 'PayPal', 2.00, 'Pending', 'secret16')
    ])

    # Добавляем данные в таблицу favorite_products
    c.executemany('''
        INSERT INTO favorite_products (login, article, added_date, secret)
        VALUES (?, ?, ?, ?)
    ''', [
        ('customer1', 1001, '2025-01-01 13:00:00', 'secret17'),
        ('customer2', 1002, '2025-01-02 16:00:00', 'secret18')
    ])

    # Добавляем данные в таблицу shopping_cart
    c.executemany('''
        INSERT INTO shopping_cart (login, article, quantity, secret)
        VALUES (?, ?, ?, ?)
    ''', [
        ('customer1', 1003, 2, 'secret19'),
        ('customer2', 1001, 5, 'secret20')
    ])

    conn.commit()
    conn.close()

if __name__ == '__main__':
    populate_delivery_db()
