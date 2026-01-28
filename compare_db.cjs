const mysql = require('mysql2/promise');

async function check() {
    const configs = [
        { host: 'localhost', user: 'root', password: '', database: 'project_aunqa', label: 'Localhost (Socket/TCP default)' },
        { host: '127.0.0.1', user: 'root', password: '', database: 'project_aunqa', label: '127.0.0.1 (TCP)' }
    ];

    for (const config of configs) {
        try {
            const connection = await mysql.createConnection(config);
            const [rows] = await connection.query('SELECT user_id, email FROM users');
            console.log(`${config.label} sees users:`, rows);
            await connection.end();
        } catch (err) {
            console.log(`${config.label} failed:`, err.message);
        }
    }
}

check();
