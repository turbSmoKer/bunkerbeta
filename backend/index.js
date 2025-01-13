const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let sharedData = []; // Данные, общие для всех пользователей

// Получение данных
app.get('/data', (req, res) => {
    res.json(sharedData);
});

// Сохранение данных
app.post('/data', (req, res) => {
    sharedData = req.body;
    res.status(200).send('Data updated');
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
