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


app.get('/a', (req, res) => {
	res.send(process.env);

});


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
		// OPTIONS /globpop
		app.options('/globpop', (req, res) => {
			res.set({
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': ' GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Max-Age': 600
			})
			res.status(200).end();
		})

		// GET /globpop 
		app.get('/globpop', (req, res) => {
			res.set({
				'Access-Control-Allow-Origin': '*'
			});
			const videos1 = db.get('videos');
			let videos = JSON.parse(JSON.stringify(videos1.values()));
			if (req.query.id) {
				let tmpRes;
				let row = videos1.getById(req.query.id);
				if (row.value()) {
					let tmpA = videos.filter(x => x.id !== req.query.id).map(x => {
						return {
							"videoID": x.id,
							"timesWatched": x.timesWatched,
							"prevalentReason": x.reason.sort((a, b) => a.timesWatched - b.timesWatched).reverse()[0].reason,
							"lastSelected": x.lastWatched
						}
					})
					tmpRes = {
						"site": "site1854.tw.cs.unibo.it",
						"recommender": req.query.id.toString(),
						"lastWatched": row.value().lastWatched,
						"recomended": tmpA
					}
				}
				else {
					let tmpA = videos.map(x => {
						return {
							"videoID": x.id,
							"timesWatched": x.timesWatched,
							"prevalentReason": x.reason.sort((a, b) => a.timesWatched - b.timesWatched).reverse()[0].reason,
							"lastSelected": x.lastWatched
						}
					})
					tmpRes = {
						"site": "site1854.tw.cs.unibo.it",
						"recommender": req.query.id.toString(),
						"lastWatched": "Never Watched",
						"recomended": tmpA
					}
				}
				res.send(tmpRes)
			} else
				res.status(400).send('Bad Request');
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
			res.set({
				'Access-Control-Allow-Origin': '*'
			});
			const videos1 = db.get('videos').values();
			let videos = JSON.parse(JSON.stringify(videos1));
			console.log(req.query.prevId)
			if (req.query.prevId) {
				console.log(videos.length)
				let tmp = [];
				for (let i = 0; i < videos.length; i++) {
					console.log(videos[i]);
					for (let j = 0; j < videos[i].reason.length; j++) {
						console.log(videos[i].reason[j])
						if (videos[i].reason[j].prevId === req.query.prevId) {
							let tmp2 = {
								...videos[i].reason[j],
								'id': videos[i].id
							}
							tmp.push(tmp2);
						}
					}
				}
				res.send(tmp)
			} else {
				res.send(videos)
			}
		});

		// POST /videotrack
		app.post('/videotrack', (req, res) => {
			res.set({
				'Access-Control-Allow-Origin': '*'
			});
			let setReason = function (reason = 'Starter', oldArr = [], prevId) {
				let j = oldArr.findIndex(el => el.prevId === prevId && el.reason === reason)
				if (j >= 0) {
					++oldArr[j].timesWatched;
					return oldArr
				}
				else {
					let tmp = {
						prevId,
						reason,
						timesWatched: 1
					}
					oldArr.push(tmp)
					return oldArr
				}
			}

			const videos = db.get('videos');
			const row = videos.getById(req.body.id);
			if (row.value()) {
				row
					.update('timesWatched', (n) => ++n)
					.update('lastWatched', () => new Date().toISOString())
					.update('reason', (n) => setReason(req.body.reason, n, req.body.prevId))
					.write()
					.then(output => res.send(200, output))
			} else {
				let newRow = {
					"id": req.body.id.toString(),
					"timesWatched": 1,
					"lastWatched": new Date().toISOString(),
					"reason": setReason(req.body.reason, [], req.body.prevId)
				}
				videos.push(newRow).last().write().then(output => res.send(200, output))
			}
		});

		// Set db default values
		return db.defaults({ videos: [] }).write();
	})
	.then(() => {
		app.use(express.static(__dirname + '/build')); // serve static build site
		app.get('*', (req, res) => {
			res.sendFile(__dirname + '/build/index.html');
		});
		app.listen(8000, () => console.log('listen on 8000')); // bind to port 8000 as required from specs
	});
