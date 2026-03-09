const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
        host: '127.0.0.1', 
        port: 3306,
        user: 'root',
        password: 'root123',
        database: 'bukalapang_db' 
    });

    console.log("Connected to MySQL Docker");

    await connection.end();
  } catch (err) {
    console.error("Could not connect to DB.");
    console.error(err.message);
  }
}

testConnection();