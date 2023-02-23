import React from 'react';
import { Col, Card, Media } from 'react-bootstrap'; // eslint-disable-line no-unused-vars
import axios from 'axios'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars
/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

class fvitali extends React.Component {
	state = {
		error: null,
		isLoaded: false,
		items: [],
	};


	componentDidMount() {
		axios.get('http://site1825.tw.cs.unibo.it/TW/globpop', {
			'params': {
				'id': this.props.match.params.id //se 'id'=>'Id', allora tutti video random, sennò anche per genere simile
			}
		}).then(
			response => {
				this.getThumbnailsNames(response.data.recommended);
			},
			error => {
				console.error(error);
				this.setState({
					isLoaded: true,
					error
				});
			}
		);
	}



	// METODI
	getThumbnailsNames(reccomended) {
		let idToLookFor = reccomended.map(item => item.videoID);
		axios.get('https://www.googleapis.com/youtube/v3/videos', {
			params: {
				part: 'snippet',
				id: idToLookFor.toString(),
				key: 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig',
				fields: 'items(id,snippet/thumbnails/medium,snippet/title)'
			}
		})

			.then(
				res1 => {
					res1.data.items.map(resCurrentValue =>
						Object.defineProperties(
							reccomended.find(videoItem => {
								return videoItem.videoID === resCurrentValue.id;
							}),
							{
								'thumbnail':
									{ value: resCurrentValue.snippet.thumbnails.medium.url },
								'name':
									{ value: resCurrentValue.snippet.title }
							})
					);
					this.setState({
						isLoaded: true,
						items: reccomended
					});
				})
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
			return (
				<Col className="text-center">
					<div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
				</Col>
			);
		} else {
			if (window.innerWidth < 992) {
				return (
					<React.Fragment>
						{items.map(item => (<Col md="4">
							<Card key={item.videoID}>
								<Link
									to={{
										pathname: '/video/' + item.videoID,
										search: "?ref=fvitali"
									}}
								>
									<Card.Img
										src={item.thumbnail}
										alt={'Thumbnail of ' + item.name}
									/>
									<Card.ImgOverlay>
										<Card.Title className="bg-dark d-inline text-white">
											<span>{item.name}</span> <br/>
											
											<span>Reccomender: fvitali</span>
										</Card.Title>
									</Card.ImgOverlay>
								</Link>
							</Card>
						</Col>))}
					</React.Fragment>
				);
			} else {
				return (
					<ul className="list-unstyled">{
						items.map(item => (
							<Link
								key={item.videoID}
								as="li" className="media mx-5 my-1 suggItem"
								to={{
									pathname: `/video/${item.videoID}`,
									search: '?ref=fvitali'
								}}>
								<img
									width={240}
									height={120}
									className="align-self-center mr-3 img-fluid"
									src={item.thumbnail}
									alt={'Thumbnail of ' + item.name}
								/>
								<Media.Body>
									<h5>{item.name}</h5>
									
									<p>Reccomender: fvitali</p>
								</Media.Body>
							</Link>
						))
					}</ul>
				);
			}
		}
	}
}



export default fvitali;