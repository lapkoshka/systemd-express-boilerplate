import https from 'https';
import { readFileSync } from 'fs';
import express from 'express';
import defineControllers, { ROUTES } from './server/routes';

const app = express();
app.disable('x-powered-by');

app.use(express.urlencoded());
app.use(express.json());

defineControllers(app);

const pckgJson = JSON.parse(readFileSync('package.json').toString());
const PORT = process.env.PORT || 8080;
const privateKey = readFileSync('ssl/key.pem', 'utf8');
const certificate = readFileSync('ssl/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate }
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`${pckgJson.name} started on ${PORT}`);
});
