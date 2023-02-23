process.env['NODE_ENV'] = 'production';
const express = require('express');
const compression = require('compression')
const bodyParser = require('body-parser');
const low = require('lowdb');
const lodashId = require('lodash-id');
const FileAsync = require('lowdb/adapters/FileAsync');
const app = express(); // app is an instance of express

app.use(compression()); // enables gzip compression
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json


// Create database instance and start server
// const adapter = new FileAsync(__dirname + '/db.json');
low(new FileAsync(__dirname + '/db.json')) // production
	.then(db => {
		db._.mixin(lodashId);
		// DATABASE ROUTES 

		// ==============

		app.post('/test', (req, res) => {
			// "reason": {
			// 	"fitali": req.body.reason.toString() === "fvitali" ? 1:0,
			// 	"": req.body.reason.toString() === "" ? 1:0,
			// 	"": req.body.reason.toString() === "" ? 1:0,
			// }
			// try {
			// 	let test = table.updateById(req.body.id, { })
			// }
			// catch(e) {
			// }
			res.send(req.body);
		});

		// ==============

		// GET /globpop 
		app.get('/globpop', (req, res) => {
			req.query.id ? res.send(req.query.id) : res.status(400).send('Bad Request');
		});

		// OPTIONS /videotrack
		app.options('/videotrack', (req, res) => {
			res.set({
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Max-Age': 600
			})
			res.status(200).end();
		})

		// GET /videotrack 
		app.get('/videotrack', (req, res) => {
			const videos = db.get('videos');
			req.query.id ? res.send(videos.getById(req.query.id).value()) : res.send(videos.value())
		});

		// POST /videotrack
		app.post('/videotrack', (req, res) => {
			const videos = db.get('videos');
			const row = videos.getById(req.body.id);
			if (row.value()) {
				row
					.update('timesWatched', (n) => ++n)
					.update('lastWatched', () => new Date().toISOString())
					.write()
					.then(output => res.send(output))
			} else {
				let newRow = {
					"id": req.body.id.toString(),
					"timesWatched": 1,
					"lastWatched": new Date().toISOString(),
				}
				videos.push(newRow).last().write().then(output => res.send(output))
			}
		});

		// Set db default values
		return db.defaults({ videos: [] }).write();
	})
	.then(() => {
		app.listen(8000, () => console.log('listen on 8000')); // bind to port 8000 as required from specs
	});
