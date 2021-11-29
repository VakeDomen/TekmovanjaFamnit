console.log('Importing dependencies...')

require('dotenv').config();

import express = require('express');

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

console.log('Finished importing!')

if (!process.env.PORT) {
	console.log('Port not specified in .env!');
	process.exit(1);
}
if (!process.env.DB_HOST) {
	console.log('DB_HOST not specified in .env!');
	process.exit(1);
}
if (!process.env.MYSQL_USER) {
	console.log('MYSQL_USER not specified in .env!');
	process.exit(1);
}
if (!process.env.MYSQL_PASSWORD) {
	console.log('MYSQL_PASSWORD not specified in .env!');
	process.exit(1);
}
if (!process.env.MYSQL_DATABASE) {
	console.log('MYSQL_DATABASE not specified in .env!');
	process.exit(1);
}
if (!process.env.LDAP_SERVER) {
	console.log('LDAP_SERVER not specified in .env!');
	process.exit(1);
}
if (!process.env.JWT_SECRET) {
	console.log('JsonWebToken secret not specified in .env!');
	process.exit(1);
}
console.log('Initialising backend...');

const app: express.Application = express();

app.use(myCors);
app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

const absPath = path.resolve(__dirname, '.');
fs.readdir(absPath + '/routes/', async (err: Error, files: string[]) => {
	if (err) {
		console.log('Error processing routes!', err);
		process.exit(1);
	}
	files.forEach((routeFileName: string) => {
		console.log('Importing ' + routeFileName + '...');
		app.use(require(absPath + '/routes/' + routeFileName));
	});
	app.use((req: express.Request, res: express.Response, next: any) => {
		const error = new Error('Not found');
		next(error);
	});
	app.use((error: any, req: express.Request, res: express.Response, next: any) => {
		res.status(error.status || 500);
		res.json({message: error.message});
	});
	app.listen(process.env.PORT);
	console.log('Backend sucessfully initialised on port ' + process.env.PORT + '!');
});

function myCors(req, res, nxt) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,PUT,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Authorization, Content-Type, Accept, Accept-Language, Origin, User-Agent');
    if(req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        nxt();
    }
}