const WebSocket = require('ws');

// Buat koneksi WebSocket ke server Anda
const ws = new WebSocket('ws://localhost:5000/data'); // Sesuaikan dengan URL server Anda

// Event listener saat koneksi berhasil dibuat
ws.on('open', () => {
    console.log('Connected to WebSocket server');

    // Event listener saat menerima data dari server
    ws.on('message', (data) => {
        const jsonData = JSON.parse(data);
        console.log('Received data from server:', jsonData);
        // Lakukan sesuatu dengan data yang diterima
    });
});

// Event listener saat koneksi ditutup
ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});

// Event listener saat terjadi kesalahan
ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
