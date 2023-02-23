import React from 'react';
import { Route, Switch, withRouter, matchPath } from 'react-router-dom';
import { Row, Col, Button, Collapse } from 'react-bootstrap';
import TopBar from './TopBar';
import VideoPlayer from './VideoPlayer';
import VideoInfo from './VideoInfo';
import VideoList from './VideoList';
import Suggestion from './Suggestion';
import AboutUs from './AboutUs';
import { ReactHeight } from 'react-height';
import './css/App.css';


class App extends React.Component {
	state = {
		playerHeight: null,
		navHeight: null,
		blackbgHeight: null,
		isInfoToggled: false,
		videoId: localStorage['lastId']
	};

	// componentDidMount() {

	// }

	// componentDidUpdate(prevProps, prevState) {

	// }

	static getDerivedStateFromProps(nextProps, prevState) {
		let idMatch = matchPath(nextProps.location.pathname, {
			path: "/video/:id/:rec?",
			exact: true,
			strict: false
		});
			if (idMatch && idMatch.params.id !== prevState.videoId) {
				localStorage.setItem('prevId', prevState.videoId)
				localStorage.setItem('lastId', idMatch.params.id)
				return { videoId: idMatch.params.id };
			}
			else {
				return null;
			
		}
	}



	render() {
		return (
			<React.Fragment>
				<Row id="top">
					<TopBar />
				</Row>
				<Row className="upperSection">
					<Col
						xs="12"
						lg={this.state.isInfoToggled ? { span: 8, offset: 0, order: 2 } : { span: 9, offset: 0, order: 2 }}
						className="blackBg align-content-center">
						<Col xs="12" lg={this.state.isInfoToggled ? { span: 10, offset: 1 } : { span: 10, offset: 1 }}>
							<ReactHeight onHeightReady={height => { this.setState({ playerHeight: height }) }}>
								<VideoPlayer videoId={this.state.videoId} />
							</ReactHeight>
						</Col>
					</Col>
					<Col
						xs="12"
						lg={this.state.isInfoToggled ? { span: 4, order: 1 } : { span: 3, order: 1 }}
						className={this.state.isInfoToggled ? "" : "blackBg"}
						style={window.innerWidth < 992 ?
							{ 'overflow': "auto", 'display': 'fixed', 'maxHeight': this.state.playerHeight * 1.4 + 'px' } :
							{ 'overflow': "auto", 'maxHeight': `${this.state.playerHeight}px` }}>
						{/* true = style for xs ;; false = style for lg */}
						<div className="d-flex justify-content-center">
							<Button
								variant="outline-light"
								onClick={() => this.setState({ isInfoToggled: !this.state.isInfoToggled, dirtyBg: true })}
								className="pt-1 "
								aria-controls="infovideo-collapse"
								aria-expanded={this.state.isInfoToggled}>
								{this.state.isInfoToggled ? "Nascondi informazioni" : "Mostra informazioni"}
							</Button>
						</div>
						<Collapse in={this.state.isInfoToggled}>
							<div className="pt-1" id="infovideo-collapse">
								<Route render={(props) => <VideoInfo {...props} key={this.state.videoId} videoId={this.state.videoId} />} />
							</div>
						</Collapse>
					</Col>
				</Row>
				<Row style={{ "maxHeight": `calc(98vh - ${this.state.playerHeight}px - 40px)` }} className='mt-2 downSection'>
					<Switch>
						<Route exact path='/' component={VideoList} />
						<Route path={"/video/:id"} component={Suggestion} />
						<Route path={"/search/:query"} component={Suggestion} />
						<Route render={() => <div>URL not found</div>} />
					</Switch>
				</Row>
				<Row id="AboutUs">
					<Route exact path="/" component={AboutUs} />
				</Row>
			</React.Fragment>
		);
	}
}

export default withRouter(App);
