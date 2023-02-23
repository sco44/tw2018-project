import React from 'react';
import { Col, Card, Media } from 'react-bootstrap'; // eslint-disable-line no-unused-vars
import axios from 'axios'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars
/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
import moment from "moment";

class PopRelLoc extends React.Component {
	state = {
		error: null,
		isLoaded: false,
		items: [],
		headers: null
	};

	ISO_8601parse(a) {
		return moment(a, moment.ISO_8601).format('ddd, DD/MM/YYYY hh:mm:ss');
	}

	componentDidMount() {
		axios.get("http://site1854.tw.cs.unibo.it/videotrack",{
			params: {
				"prevId" : localStorage['lastId']
			}
		}).then(res=>{
				this.getThumbnailsNames(res.data)
				this.setState({
					items : res.data
				})
		},
		error=>console.error(error))

	}

	// METODI
	getThumbnailsNames(listVideo) {
		let idToLookFor = listVideo.map(item => item.id);
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
							listVideo.find(videoItem => {
								return videoItem.id === resCurrentValue.id;
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
						items: listVideo
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
				<React.Fragment>
					<Col>
						<p className="text-center">Loading...</p>
					</Col>
				</React.Fragment>
			);
		} else {
			if (window.innerWidth < 992) {
			return (
				<React.Fragment>
					{items.map(item => (
						<Col md="4">
							<Card key={item.id}>
								<Link
									to={{
										pathname: '/video/' + item.id,
										search: "?ref=popRelLoc"
									}}
								>
									<Card.Img
										src={item.thumbnail}
										alt={'Thumbnail of ' + item.name}
									/>
									<Card.ImgOverlay>
										<Card.Title className="bg-dark d-inline text-white">
											{item.name}<br />
											<span>Visto: {item.timesWatched} volt{item.timesWatched === 1 ?"a":"e"} </span><br />
											<span> Reccomender: popRelLoc </span>
										</Card.Title>
									</Card.ImgOverlay>
								</Link>
							</Card>

						</Col>))}
				</React.Fragment>
			);
		}else{
			return (
                <ul className="list-unstyled">{
                    this.state.items.map(item => (
                        <Link
                            key={item.id.videoId}
                            as="li" className="media mx-5 my-1 suggItem"
                            to={{
                                pathname: '/video/' + item.id,
                                search: "?ref=popRelLoc"
                            }}>
                            <img
                                width={240}
                                height={120}
                                className="align-self-center mr-3"
                                src={item.thumbnail}
                                alt={'Thumbnail of ' + item.name}
                            />
                            <Media.Body>
                                <h5>{item.name}</h5>
                                <p>Visto: {item.timesWatched} volt{item.timesWatched === 1 ?"a":"e"} </p>
                                <p> Reccomender: popRelLoc </p>
                            </Media.Body>
                        </Link>
                    ))
                }</ul>
            );
		}}
	}
}



export default PopRelLoc;