const express = require('express');
const Database = require('better-sqlite3');
const database = new Database('./database.db');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const database = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

// Custom Promise wrapper (fixes lastID / changes issue)
const db = {
    run: (sql, params = []) => new Promise((resolve, reject) => {
        database.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    }),
    get: (sql, params = []) => new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    }),
    all: (sql, params = []) => new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    })
};

// Initialize database tables
async function initializeDatabase() {
    try {
        await db.run(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone_number TEXT NOT NULL UNIQUE
        )`);

        await db.run(`CREATE TABLE IF NOT EXISTS addresses (
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

// ------------------ Customer Routes ------------------

// POST /api/customers - Create new customer
app.post('/api/customers', async (req, res) => {
    try {
        const { first_name, last_name, phone_number } = req.body;
        const errors = validateCustomer(req.body);

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation error', errors });
        }

        const insertQuery = `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`;
        const result = await db.run(insertQuery, [first_name, last_name, phone_number]);

        res.status(201).json({
            message: 'Customer created successfully',
            data: { id: result.lastID, first_name, last_name, phone_number }
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

        const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
        const countResult = await db.get(countQuery, params);
        const total = countResult.total;
        const totalPages = Math.ceil(total / limitNum);

        const selectQuery = `SELECT * FROM customers ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        const customers = await db.all(selectQuery, [...params, limitNum, offset]);

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

        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
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

        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
        if (!customer) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        const addresses = await db.all('SELECT * FROM addresses WHERE customer_id = ? ORDER BY id', [customerId]);
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
        const result = await db.run(`UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`, [first_name, last_name, phone_number, customerId]);

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

        const result = await db.run('DELETE FROM customers WHERE id = ?', [customerId]);
        if (result.changes === 0) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to delete customer'] });
    }
});


// Address

// POST /api/customers/:id/addresses - Add address
app.post('/api/customers/:id/addresses', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const errors = validateAddress(req.body);
        if (errors.length > 0) return res.status(400).json({ message: 'Validation error', errors });

        const customer = await db.get('SELECT id FROM customers WHERE id = ?', [customerId]);
        if (!customer) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        const { address_details, city, state, pin_code } = req.body;
        const result = await db.run(`INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`,
             [customerId, address_details, city, state, pin_code]);

        res.status(201).json({ message: 'Address created successfully', data: 
            { id: result.lastID, customer_id: customerId, address_details, city, state, pin_code } });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to create address'] });
    }
});

// GET /api/customers/:id/addresses - Get addresses of a customer
app.get('/api/customers/:id/addresses', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID', errors: ['Customer ID must be a number'] });

        const customer = await db.get('SELECT id FROM customers WHERE id = ?', [customerId]);
        if (!customer) return res.status(404).json({ message: 'Customer not found', errors: ['No such customer'] });

        const addresses = await db.all('SELECT * FROM addresses WHERE customer_id = ? ORDER BY id', [customerId]);
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
        const result = await db.run(`UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?`, [address_details, city, state, pin_code, addressId]);

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

        const result = await db.run('DELETE FROM addresses WHERE id = ?', [addressId]);
        if (result.changes === 0) return res.status(404).json({ message: 'Address not found', errors: ['No such address'] });

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors: ['Failed to delete address'] });
    }
});



const PORT =  5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
