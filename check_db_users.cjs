const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    try {
        const [dbs] = await connection.query('SHOW DATABASES');
        console.log('Available Databases:', dbs.map(d => d.Database));

        await connection.query('USE project_aunqa');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables in project_aunqa:', tables);

        const [users] = await connection.query('SELECT user_id, email, password FROM users');
        console.log('All Users in DB:', users);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await connection.end();
    }
}

check();
