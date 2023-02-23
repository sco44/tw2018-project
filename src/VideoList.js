import React from 'react';
import { Col, ListGroup, Card, CardDeck, Media } from 'react-bootstrap'; // eslint-disable-line no-unused-vars
import axios from 'axios'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars
/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

class VideoList extends React.Component {
	state = {
		error: null,
		isLoaded: false,
		items: [],
		headers: null
	};


	componentDidMount() {
		localStorage['fixedVideoList'] ?
			this.setState({
				items: this.shuffleArray(JSON.parse(localStorage.getItem('fixedVideoList'))),
				isLoaded: true
			}) :
			axios.get('http://site1825.tw.cs.unibo.it/video.json').then(
				response => {
					this.shuffleArray(response.data);
					this.getThumbnails(response.data)
						.then(videoList => localStorage.setItem('fixedVideoList', JSON.stringify(videoList)));
				},
				// Note: it's important to handle errors here
				// instead of a catch() block so that we don't swallow
				// exceptions from actual bugs in components.
				error => {
					console.error(error);
					this.setState({
						isLoaded: true,
						error
					});
				}
			)
	}

	// METODI
	getThumbnails(videoItems) {
		let idToLookFor = videoItems.map(item => item.videoID);
		let finalChunk = (videoItems.length % 50) + 100;
		return axios
			.all([
				// chain 3 parallel get
				axios.get('https://www.googleapis.com/youtube/v3/videos', {
					params: {
						part: 'snippet',
						id: idToLookFor.slice(0, 50).toString(),
						key: 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig', // 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig' in production
						fields: 'items(id,snippet/thumbnails/medium)'
					}
				}),
				axios.get('https://www.googleapis.com/youtube/v3/videos', {
					//chain multiple get into promises
					params: {
						part: 'snippet',
						id: idToLookFor.slice(50, 100).toString(),
						key: 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig', // 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig' in production
						fields: 'items(id,snippet/thumbnails/medium)'
					}
				}),
				axios.get('https://www.googleapis.com/youtube/v3/videos', {
					//chain multiple get into promises
					params: {
						part: 'snippet',
						id: idToLookFor.slice(100, finalChunk).toString(),
						key: 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig', // 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig' in production
						fields: 'items(id,snippet/thumbnails/medium)'
					}
				})
			])
			.then(
				axios.spread((res1, res2, res3) => {
					[...res1.data.items, ...res2.data.items, ...res3.data.items]
						.map(resCurrentValue =>
							Object.defineProperty(
								videoItems.find(videoItem => {
									return videoItem.videoID === resCurrentValue.id;
								}),
								'thumbnail',
								{
									value: resCurrentValue.snippet.thumbnails.medium.url,
									enumerable: true
								}
							)
						);
					this.setState({
						isLoaded: true,
						items: videoItems
					});
					return new Promise((resolve, reject) => resolve(videoItems))
				})
			)
	}

	shuffleArray(videoArray) {
		for (let i = videoArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[videoArray[i], videoArray[j]] = [videoArray[j], videoArray[i]]; // eslint-disable-line no-param-reassign
		}
		return videoArray
		// Durstenfeld shuffle.
		// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
	}

	render() {
		const { error, isLoaded, items } = this.state;
		if (error) {
			return (
				<React.Fragment>
					Error: {error.message} -- Cannot get {error.config.url}
				</React.Fragment>
			);
		} else if (!isLoaded) {
			return <Col className="text-center">
				<div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
			</Col>;
		} else {
			return (
				<React.Fragment>
					{items.map(item => (
						<Col key={item.videoID} lg={{ span: 3 }} md="6">
							<Card className="my-1 carta">
								<Link to={{
									pathname: '/video/' + item.videoID,
									state: {
										artist: item.artist,
										title: item.title
									}
								}}
								>
									{/* {item.artist} - {item.title}		{item.videoID}					{item.category} */}
									<Card.Img
										src={item.thumbnail}
										alt={'Thumbnail of ' + item.title}
									/>
									<Card.ImgOverlay>
										<Card.Title className="bg-dark d-inline text-white">
											{item.artist} - {item.title}
										</Card.Title>
										<p className="d-table d-lg-none card-text bg-dark text-white">
											{item.category}
										</p>
									</Card.ImgOverlay>
								</Link>
							</Card>
						</Col>
					))}
				</React.Fragment>


				// <ul className="list-unstyled">{
				// 	items.map(item => (
				// 	<Link
				// 		key={item.videoId}
				// 		as="li" className="media mx-5 my-1 suggItem"
				// 		to={{
				// 			pathname: '/video/' + item.videoID,
				// 			state: {
				// 				artist: item.artist,
				// 				title: item.title
				// 			}
				// 		}}>
				// 		<img
				// 			width={240}
				// 			height={120}
				// 			className="align-self-center mr-3"
				// 			src={item.thumbnail}
				// 			alt={'Thumbnail of ' + item.title}
				// 		/>
				// 		<Media.Body>
				// 			<h5>{item.artist} - {item.title}</h5>
				// 			<p>{item.category}</p>
				// 		</Media.Body>
				// 	</Link>											
				// ))}</ul>
			);
		}
	}
}

export default VideoList;
