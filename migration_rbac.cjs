const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'project_aunqa'
    });

    console.log('Connected to database to sync RBAC...');

    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Roles
        await connection.query('TRUNCATE TABLE roles');
        const roles = [
            [1, 'System Admin'],
            [2, 'SAR Manager'],
            [3, 'Reporter'],
            [4, 'Evaluator'],
            [5, 'External Evaluator'],
            [6, 'Executive']
        ];
        await connection.query('INSERT INTO roles (role_id, role_name) VALUES ?', [roles]);
        console.log('Roles synchronized.');

        // 2. Users - TRUNCATE and RE-INSERT for a clean state
        await connection.query('TRUNCATE TABLE users');
        const users = [
            [1, 'System Admin', 'dev@test.com', 1, 'adminpass'],
            [2, 'SAR Manager', 'manager@test.com', 2, 'managerpass'],
            [3, 'Reporter', 'staff@test.com', 3, 'staffpass'],
            [4, 'Evaluator', 'evaluator@test.com', 4, 'evaluatorpass'],
            [5, 'External Evaluator', 'external@test.com', 5, 'externalpass'],
            [6, 'Executive', 'exec@test.com', 6, 'execpass'],
            [7, 'Alternate Admin', 'admin@example.com', 1, 'adminpass']
        ];

        await connection.query('INSERT INTO users (user_id, name, email, role_id, password) VALUES ?', [users]);
        console.log('Users synchronized with clean test accounts.');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
