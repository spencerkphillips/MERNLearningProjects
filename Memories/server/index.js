import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import postRoutes from './routes/posts.route.js';

const app = express();

app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use(cors());

app.use('/posts', postRoutes);

const connection = process.env.MONGO_URI;
const host = process.env.APP_HOST;
const port = process.env.APP_PORT || 5000;

mongoose.connect(connection, { useNewUrlParser:true, useUnifiedTopology: true })
    .then(() => app.listen(port, () => console.log(`Server running on port: https://${host}:${port}`)))
    .catch((error) => console.error(`${error} did not connect`));

mongoose.set('useFindAndModify', false);