import React from 'react'; // eslint-disable-line no-unused-vars
import YouTube from 'react-youtube'; // eslint-disable-line no-unused-vars
import axios from 'axios';
import { withRouter } from 'react-router-dom';
/* eslint no-console: ["error", { allow: ["info", "error", "warn"] }] */

class VideoPlayer extends React.Component {
	state = {
		opt: {
			// height: '390',
			// width: '640',
			playerVars: {
				// https://developers.google.com/youtube/player_parameters
				autoplay: 0,
				modestbranding: 1,
				fs: 0,
				iv_load_policy: 3,
				rel: 0,
				origin//: 'http://site1854.tw.cs.unibo.it'
			}
		},
		promise1: null,
		promise2: Promise,
		outsideReject1: null,
		outsideReject2: null
	};

	render() {
		return (
			<YouTube
				opts={this.state.opt}
				videoId={this.props.videoId}
				onReady={this._onReady}
				onPlay={this._onPlay}
				onError={this._onError}
				onStateChange={this._onStateChange}
				className="embed-responsive-item"
				containerClassName="embed-responsive embed-responsive-16by9"
			/>
		);
	}

	// access to player in all event handlers via event.target
	_onError(event) {
		console.error('Player error: ', event);
	}

	_onPlay(event) { }

	_onReady(event) { }

	_onStateChange(event) {
		let timerId1, timerId2;
		if (parseInt(event.data) === -1) {
			this.setState({
				promise2: new Promise((resolve, reject) => {
					timerId2 = window.setInterval(() => {
						switch (parseInt(event.target.getPlayerState())) {
							case 1:
								resolve(1);
								break;
							case 5:
								resolve(5);
								break;
							default:
								break;
						}
					}, 500);
					this.setState({ outsideReject2: reject });
				})
			});
			this.state.promise2.then(msg => {
				window.clearInterval(timerId2);
				switch (parseInt(msg)) {
					case 1:
						this.setState({
							promise1: new Promise((resolve, reject) => {
								timerId1 = window.setInterval(() => {
									if (event.target.getCurrentTime() > 15)
										resolve(event.target.getVideoData().video_id);
								}, 500);
								this.setState({ outsideReject1: reject });
							})
						});
						this.state.promise1
							.then(
								videoIdWatched => {
									// post request to local db
									let reason = new URLSearchParams(this.props.location.search).get("ref");
									axios
										.post('http://site1854.tw.cs.unibo.it/videotrack', {
											id: videoIdWatched.toString(),
											reason: reason || undefined,
											prevId: localStorage['prevId']
										})
										.then(
											response => console.info(response.data),
											error => this.setState({ error })//console.error(error, videoIdWatched.toString())
										);
									// local storage logic for recent reccomender
									let tmp = JSON.parse(localStorage.getItem('lastWatched'))
									let j = tmp.findIndex(el => el.id.toString() === videoIdWatched.toString())
									if (j < 0) {

										if (localStorage['prevId'] === '1') {
											//per primo video
											tmp.push({
												'id': videoIdWatched.toString(),
												'lastWatched': new Date(),
												'timesWatched': 1,
												'prevVideos': []
											})
										}
										else {
											//Prima volta video generico
											tmp.push({
												'id': videoIdWatched.toString(),
												'lastWatched': new Date(),
												'timesWatched': 1,
												'prevVideos': [{ id: [localStorage["prevId"]].toString() }]
											})
										}
									}
									else {
										//altre volte
										tmp[j].timesWatched++;
										tmp[j].lastWatched = new Date();
										let z = tmp[j].prevVideos.findIndex(el => el.id === localStorage["prevId"].toString())
										if (z < 0) {
											tmp[j].prevVideos.push({
												'id': localStorage["prevId"].toString()
											})
										}

									}

									tmp.sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime());



									localStorage.setItem('lastWatched', JSON.stringify(tmp));
									//.finally(()=>{})
									clearInterval(timerId1);
									return new Promise ((resolve,reject) => resolve(videoIdWatched))
								},
								error => console.error(error)
							)
							.finally((id) => this.setState({ promise1: null, outsideReject1: null }));
							break;
					case 5:
						if (this.state.promise1)
							this.state.outsideReject1('Video changed');

						break;
					default:
						break;
				}

			return new Promise ((resolve,reject) => resolve('ok'))
			})
				.finally((res) => { this.setState({ promise2: null, outsideReject2: null }) });
		}
	}
	_onStateChange = this._onStateChange.bind(this);
}

export default withRouter(VideoPlayer);
