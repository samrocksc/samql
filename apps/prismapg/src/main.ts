import express from 'express';
import { samQL } from '@prismapg/samql';
import path from 'path';
const fs = require('fs');

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.listen(port, host, async () => {
  const users = await samQL()
    .document()
    .load(fs.readFileSync(path.resolve(__dirname, './users.csv'), 'utf-8'));

    users.query('PROJECT name, id FILTER createdAt > 2020-01-01 GROUP BY name');
});
