const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
let db;
try {
    db = new Database('./database.db');
    console.log('Connected to the SQLite database.');
    initializeDatabase();
} catch (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
}

// Initialize database tables
function initializeDatabase() {
    try {
        db.exec(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone_number TEXT NOT NULL UNIQUE
        )`);

        db.exec(`CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            address_details TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pin_code TEXT NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
        )`);
        
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error.message);
    }
}

// ------------------ Validation ------------------
function validateCustomer(customer) {
    const errors = [];
    if (!customer.first_name?.trim()) errors.push('First name is required');
    if (!customer.last_name?.trim()) errors.push('Last name is required');
    if (!customer.phone_number?.trim()) {
        errors.push('Phone number is required');
    } else {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
        if (!phoneRegex.test(customer.phone_number.trim())) {
            errors.push('Phone number format is invalid');
        }
    }
    return errors;
}

function validateAddress(address) {
    const errors = [];
    if (!address.address_details?.trim()) errors.push('Address details are required');
    if (!address.city?.trim()) errors.push('City is required');
    if (!address.state?.trim()) errors.push('State is required');
    if (!address.pin_code?.trim()) {
        errors.push('PIN code is required');
    } else {
        const pinRegex = /^\d{6}$/;
        if (!pinRegex.test(address.pin_code.trim())) {
            errors.push('PIN code must be 6 digits');
        }
    }
    return errors;
}

// Customer Routes

// POST /api/customers - Create new customer
app.post('/api/customers', async (req, res) => {
    try {
        const { first_name, last_name, phone_number } = req.body;
        const errors = validateCustomer(req.body);

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation error', errors });
        }

        const insertQuery = db.prepare(`INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`);
        const result = insertQuery.run(first_name, last_name, phone_number);

        res.status(201).json({
            message: 'Customer created successfully',
            data: { id: result.lastInsertRowid, first_name, last_name, phone_number }
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                message: 'Phone number already exists',
                errors: ['Phone number must be unique']
            });
        }
        res.status(500).json({ message: 'Database error', errors: [error.message] });
    }
});

// GET /api/customers - Get all customers (with search, filter, pagination, sorting)
app.get('/api/customers', async (req, res) => {
    try {
        const { search = '', city = '', state = '', page = 1, limit = 10, sort_by = 'first_name', sort_order = 'ASC' } = req.query;

        const allowedSortFields = ['id', 'first_name', 'last_name', 'phone_number'];
        const allowedSortOrders = ['ASC', 'DESC'];
        
        const sortBy = allowedSortFields.includes(sort_by) ? sort_by : 'first_name';
        const sortOrder = allowedSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'ASC';

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;

        let whereConditions = [];
        let params = [];

        if (search.trim()) {
            whereConditions.push(`(customers.first_name LIKE ? OR customers.last_name LIKE ? OR customers.phone_number LIKE ?)`);
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (city.trim() || state.trim()) {
            let addressFilter = `customers.id IN (SELECT DISTINCT customer_id FROM addresses WHERE 1=1`;
            if (city.trim()) {
                addressFilter += ` AND city LIKE ?`;
                params.push(`%${city.trim()}%`);
            }
            if (state.trim()) {
                addressFilter += ` AND state LIKE ?`;
                params.push(`%${state.trim()}%`);
            }
            addressFilter += `)`;
            whereConditions.push(addressFilter);
        }

        const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const countQuery = db.prepare(`SELECT COUNT(*) as total FROM customers ${whereClause}`);
        const countResult = countQuery.get(...params);
        const total = countResult.total;
        const totalPages = Math.ceil(total / limitNum);

        const selectQuery = db.prepare(`SELECT * FROM customers ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`);
        const customers = selectQuery.all(...params, limitNum, offset);

        res.status(200).json({
            message: 'Customers retrieved successfully',
            data: customers,
            pagination: {
                current_page: pageNum,
                total_pages: totalPages,
                total_records: total,
                records_per_page: limitNum,
                has_next: pageNum < totalPages,
                has_previous: pageNum > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to retrieve customers'] });
    }
});

// GET /api/customers/:id - Get single customer
app.get('/api/customers/:id', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const query = db.prepare('SELECT * FROM customers WHERE id = ?');
        const customer = query.get(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        res.status(200).json({ message: 'Customer retrieved successfully', data: customer });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to retrieve customer'] });
    }
});

// GET /api/customers/:id/full - Get customer with addresses
app.get('/api/customers/:id/full', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const customerQuery = db.prepare('SELECT * FROM customers WHERE id = ?');
        const customer = customerQuery.get(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        const addressQuery = db.prepare('SELECT * FROM addresses WHERE customer_id = ? ORDER BY id');
        const addresses = addressQuery.all(customerId);
        res.status(200).json({ message: 'Customer with addresses retrieved successfully', data: { ...customer, addresses } });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to retrieve customer details'] });
    }
});

// PUT /api/customers/:id - Update customer
app.put('/api/customers/:id', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const errors = validateCustomer(req.body);
        if (errors.length > 0) return res.status(400).json({ message: 'Validation error', errors });

        const { first_name, last_name, phone_number } = req.body;
        const query = db.prepare(`UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`);
        const result = query.run(first_name, last_name, phone_number, customerId);

        if (result.changes === 0) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        res.status(200).json({ message: 'Customer updated successfully', data: { id: customerId, first_name, last_name, phone_number } });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Phone number already exists', errors: ['Phone number must be unique'] });
        }
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to update customer'] });
    }
});

// DELETE /api/customers/:id - Delete customer
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const query = db.prepare('DELETE FROM customers WHERE id = ?');
        const result = query.run(customerId);
        if (result.changes === 0) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to delete customer'] });
    }
});

// Address Routes

// POST /api/customers/:id/addresses - Add address
app.post('/api/customers/:id/addresses', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const errors = validateAddress(req.body);
        if (errors.length > 0) return res.status(400).json({ message: 'Validation error', errors });

        const customerQuery = db.prepare('SELECT id FROM customers WHERE id = ?');
        const customer = customerQuery.get(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        const { address_details, city, state, pin_code } = req.body;
        const insertQuery = db.prepare(`INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`);
        const result = insertQuery.run(customerId, address_details, city, state, pin_code);

        res.status(201).json({ message: 'Address created successfully', data: 
            { id: result.lastInsertRowid, customer_id: customerId, address_details, city, state, pin_code } });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to create address'] });
    }
});

// GET /api/customers/:id/addresses - Get addresses of a customer
app.get('/api/customers/:id/addresses', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const customerQuery = db.prepare('SELECT id FROM customers WHERE id = ?');
        const customer = customerQuery.get(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        const addressQuery = db.prepare('SELECT * FROM addresses WHERE customer_id = ? ORDER BY id');
        const addresses = addressQuery.all(customerId);
        res.status(200).json({ message: 'Addresses retrieved successfully', data: addresses });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to retrieve addresses'] });
    }
});

// PUT /api/addresses/:addressId - Update address
app.put('/api/addresses/:addressId', async (req, res) => {
    try {
        const addressId = parseInt(req.params.addressId);
        if (isNaN(addressId)) return res.status(400).json({ message: 'Invalid address ID', errors: ['Address ID must be a number'] });

        const errors = validateAddress(req.body);
        if (errors.length > 0) return res.status(400).json({ message: 'Validation error', errors });

        const { address_details, city, state, pin_code } = req.body;
        const query = db.prepare(`UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?`);
        const result = query.run(address_details, city, state, pin_code, addressId);

        if (result.changes === 0) return res.status(404).json({ message: 'Address not found', errors: ['No such address'] });

        res.status(200).json({ message: 'Address updated successfully', data: { id: addressId, address_details, city, state, pin_code } });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to update address'] });
    }
});

// DELETE /api/addresses/:addressId - Delete address
app.delete('/api/addresses/:addressId', async (req, res) => {
    try {
        const addressId = parseInt(req.params.addressId);
        if (isNaN(addressId)) return res.status(400).json({ message: 'Invalid address ID', errors: ['Address ID must be a number'] });

        const query = db.prepare('DELETE FROM addresses WHERE id = ?');
        const result = query.run(addressId);
        if (result.changes === 0) return res.status(404).json({ message: 'Address not found', errors: ['No such address'] });

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to delete address'] });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));