### refactor fungsi refactorMe1

```
function calculateAverage(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}

// Define the main function
exports.refactorMe1 = async (req, res) => {
  try {
    // Retrieve data from the "surveys" table in the database
    const surveyData = await db.sequelize.query('SELECT * FROM "surveys"');

    // Initialize an array to store the calculated averages
    const totalIndex = [];

    // Loop through each survey data entry
    surveyData.forEach((entry) => {
      const values = entry.values;

      // Calculate the average for each set of values and push it to the totalIndex array
      const averageValue = calculateAverage(values);
      totalIndex.push(averageValue);
    });

    // Send the response with the calculated averages
    res.status(200).send({
      statusCode: 200,
      success: true,
      data: totalIndex,
    });
  } catch (error) {
    // Handle any errors that may occur during the database query or processing
    console.error('Error:', error);
    res.status(500).send({
      statusCode: 500,
      success: false,
      message: 'Internal server error',
    });
  }
};
```

### refactor fungsi refactorMe2
```
// Import necessary modules and dependencies
const Survey = require('./Survey'); // Import the Survey model
const User = require('./User'); // Import the User model

// Define the main function
async function refactoreMe2(req, res) {
  try {
    // Create a new survey record in the Survey table
    const survey = await Survey.create({
      userId: req.body.userId,
      values: req.body.values,
    });

    // Update the 'dosurvey' field of the User table to true
    await User.update(
      { dosurvey: true },
      { where: { id: req.body.id } }
    );

    // Send a success response
    res.status(201).send({
      statusCode: 201,
      message: 'Survey sent successfully!',
      success: true,
      data: survey,
    });
  } catch (error) {
    // Handle any errors that may occur during the database operations
    console.error('Error:', error);
    res.status(500).send({
      statusCode: 500,
      message: 'Cannot post survey.',
      success: false,
    });
  }
}

module.exports = refactoreMe2; // Export the refactored function
```

### Buat endpoint berbasis websocket untuk memfecth data dari api https://livethreatmap.radware.com/api/map/attacks?limit=10 yang mana dia akan memfetch 3 menit sekali (tulis code mu di callmeWebSocket function)
```
const express = require('express');
const expressWs = require('express-ws');
const fetch = require('node-fetch');

const app = express();
expressWs(app);

// Tentukan interval pengambilan data (3 menit)
const fetchInterval = 3 * 60 * 1000; // Dalam milidetik

// Fungsi untuk mengambil data dari API dan mengirimkannya ke klien WebSocket
async function fetchDataAndSend(ws) {
  try {
    const response = await fetch('https://livethreatmap.radware.com/api/map/attacks?limit=10');
    const data = await response.json();

    // Kirim data ke klien WebSocket
    ws.send(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Endpoint untuk WebSocket
app.ws('/data', (ws, req) => {
  console.log('Client connected');

  // Kirim data saat koneksi pertama kali dibuat
  fetchDataAndSend(ws);

  // Setup interval untuk pengambilan data setiap 3 menit
  const dataFetchInterval = setInterval(() => {
    fetchDataAndSend(ws);
  }, fetchInterval);

  // Event listener saat koneksi ditutup
  ws.on('close', () => {
    console.log('Client disconnected');
    // Hentikan interval saat koneksi ditutup
    clearInterval(dataFetchInterval);
  });
});

// Mulai server Express pada port tertentu
const port = 8080; // Ganti dengan port yang Anda inginkan
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

```

### Store data data yang ada di https://livethreatmap.radware.com/api/map/attacks?limit=10 ke dalam database postgres, lalu buatkan 1 endpoint sederhana untuk mendaptkan berapa jumlah "destinationCountry" yang di serang beberapa type dan "sourcecountry" yang menyerang dengan beberapa type
```
const express = require('express');
const { Pool } = require('pg');
const fetch = require('node-fetch');

const app = express();
const port = 8080; // Ganti dengan port yang Anda inginkan

// Konfigurasi koneksi ke database PostgreSQL
const pool = new Pool({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432, // Ganti dengan port PostgreSQL Anda
});

// Middleware untuk mengambil data dari API dan menyimpan ke database
async function fetchDataAndStore() {
  try {
    const response = await fetch('https://livethreatmap.radware.com/api/map/attacks?limit=10');
    const data = await response.json();

    // Menyimpan data ke dalam tabel "attacks" di database PostgreSQL
    await pool.query('INSERT INTO attacks (data) VALUES ($1)', [data]);
  } catch (error) {
    console.error('Error fetching and storing data:', error);
  }
}

// Endpoint untuk menyimpan data dari API ke database
app.post('/storeData', (req, res) => {
  fetchDataAndStore();
  res.status(200).json({ success: true, message: 'Data stored successfully' });
});

// Endpoint untuk mendapatkan jumlah "destinationCountry" yang di serang beberapa type dan "sourceCountry" yang menyerang dengan beberapa type
app.get('/getData', async (req, res) => {
  try {
    // Query untuk mengambil data yang diinginkan dari database
    const query = `
      SELECT
        type,
        jsonb_object_keys(data->'destinationCountry') as destinationCountry,
        jsonb_object_keys(data->'sourceCountry') as sourceCountry,
        count(*) as total
      FROM
        attacks
      GROUP BY
        type, destinationCountry, sourceCountry
    `;

    const { rows } = await pool.query(query);

    // Memproses hasil query untuk menghasilkan respons yang sesuai
    const result = rows.reduce((acc, row) => {
      const { type, destinationCountry, sourceCountry, total } = row;

      if (!acc[type]) {
        acc[type] = { labels: [], totals: [] };
      }

      if (!acc[type].labels.includes(destinationCountry)) {
        acc[type].labels.push(destinationCountry);
        acc[type].totals.push(total);
      }

      return acc;
    }, {});

    // Membentuk respons sesuai format yang diinginkan
    const response = {
      success: true,
      statusCode: 200,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Jalankan server Express
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
```

### Buatkan aku middleware authentikasi jwt untuk memprotect api, serta buatkan juga middleware untuk membatasi endpoint lain berdasarkan role user
```
const jwt = require('jsonwebtoken');

// Kunci rahasia yang digunakan untuk menandatangani token
const secretKey = 'rahasia-sangat-aman';

// Data pengguna yang akan dimasukkan ke dalam token
const userData = {
  userId: 12345,
  username: 'contohuser',
};

// Membuat token JWT
const token = jwt.sign(userData, secretKey, { expiresIn: '1h' }); // Menandatangani token dengan masa berlaku 1 jam

console.log('Token JWT yang dibuat:');
console.log(token);

// Memverifikasi token JWT
jwt.verify(token, secretKey, (err, decodedData) => {
  if (err) {
    console.error('Token tidak valid!');
  } else {
    console.log('Token valid.');
    console.log('Data yang terkandung dalam token:');
    console.log(decodedData);
  }
});
```

- Terapkan redis caching pada saat memfetch endpoint yang kamu buat di point nomor 3
```
const express = require('express');
const redis = require('redis');

const app = express();
const port = 3000;

// Buat koneksi ke Redis
const client = redis.createClient({
  host: 'localhost', // Ganti dengan host Redis Anda
  port: 6379, // Ganti dengan port Redis Anda
});

// Tangani permintaan ke endpoint tertentu
app.get('/data', (req, res) => {
  // Simpan data ke Redis
  client.set('myData', 'Hello, Redis!', (err) => {
    if (err) {
      console.error('Error storing data in Redis:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Data has been stored in Redis.');
    }
  });
});

// Ambil data dari Redis
app.get('/get-data', (req, res) => {
  client.get('myData', (err, data) => {
    if (err) {
      console.error('Error getting data from Redis:', err);
      res.status(500).send('Internal Server Error');
    } else if (data) {
      res.send(`Data from Redis: ${data}`);
    } else {
      res.send('No data found in Redis.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```