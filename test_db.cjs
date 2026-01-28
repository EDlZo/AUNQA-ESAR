const mysql = require('mysql2/promise');

async function test() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'project_aunqa'
    });

    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['dev@test.com']);
        console.log('Test User Search (dev@test.com):', rows);

        if (rows.length > 0) {
            const user = rows[0];
            console.log('Match Attempt (dev@test.com, adminpass, 1):',
                user.email === 'dev@test.com' && user.password === 'adminpass' && user.role_id === 1);
        }
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await connection.end();
    }
}

test();
