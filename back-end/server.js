const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6767;

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root123',
  database: 'bukalapang_db'
});

connection.connect((err) => {
  if (err) console.error('Error: ' + err.stack);
  console.log('Testing connection to MySQL');
});

app.use(cors());
app.use(express.json());
app.get('/api/test', (req, res) => {
  res.json({ message: "Test data retrieval" });
});

app.listen(PORT, () => {
  console.log(`Test Port listening`);
});