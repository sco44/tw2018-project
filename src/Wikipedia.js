import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import wikijs from 'wikijs';
import wdk from 'wikidata-sdk';
import axios from 'axios';
import { Table, Col } from 'react-bootstrap';
import moment from 'moment';
import "./css/Wikipedia.css"
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

class Wikipedia extends Component {

	state = {
		wikidata: null,
		wikipedia: null,
		musicbrainz: null,
		props: {},
		error: null,
		isWikiLoaded: false,
		isWDataLoaded: false,
		isMBLoaded: false,
		isLoaded: false,
		wikidatakeys: null,
		wikipediakeys: null
	};

	ISO_8601toYYYY(a) {
		return moment(a, [moment.ISO_8601, 'YYYY']).format('YYYY');
	}

	getExternalLink(P, value) {
		switch (P) {
			case "P436": //MB release group id
				return (<a target="_blank" rel="noopener noreferrer" href={`https://musicbrainz.org/release-group/${value}`}>{`${value}`}</a>)
			case "P435": // MB work id
				return (<a target="_blank" rel="noopener noreferrer" href={`https://musicbrainz.org/work/${value}`}>{`${value}`}</a>)
			case "P1954": // discogs id
				return (<a target="_blank" rel="noopener noreferrer" href={`https://www.discogs.com/master/${value}`}>{`${value}`}</a>)
			case "P2624": // metrolyrics id
				return (<a target="_blank" rel="noopener noreferrer" href={`http://www.metrolyrics.com/${value}`}>{`${value}`}</a>)
			case "P1651": // youtubeid
				return (<Link to={{ pathname: `/video/${value}` }}>{`${value}`}</Link>)
			case "P2581":
				return (<a target="_blank" rel="noopener noreferrer" href={`https://babelnet.org/synset?word=bn:${value}`}>{value}</a>)
			case "P1827":
				return (<a target="_blank" rel="noopener noreferrer" href={`https://musicbrainz.org/iswc/${value}`}>{value}</a>)
			default:
				return (`${value}`);
		}
	}

	
	
	getMusicBrainzFromWData = (P175, P435=undefined) => { //  P175 = artist P435 = workid	
		const musicbrainzBaseUrl = "https://musicbrainz.org/ws/2"; // more readable
		let artist = this.props.artist || this.props.artist2;
		let title = this.props.title || this.props.title2;
		if (P175.toLowerCase() === artist.trim().toLowerCase()) {
			axios
				.get(`https://musicbrainz.org/ws/2/recording`, {
					params: {
						'query': `${title.trim()} AND artistname:${artist.trim()}`, //AND release:${P361}
						'limit': 1,
						'fmt': 'json'
					}
				})
				.then(resP175EqArtist => {
					axios
						.get(`${musicbrainzBaseUrl}/recording/${resP175EqArtist.data.recordings[0].id}`, {
							params: {
								'inc': 'work-rels+artists+releases',
								'fmt': 'json'
							}
						})
						.then(resRecordingQuery => {
							let musicbrainzWorkId = resRecordingQuery.data.relations.map(x => x['target-type'] === 'work' ? x.work.id.toString() : "") || P435.toString();
							axios.get(`${musicbrainzBaseUrl}/work/${musicbrainzWorkId}`, {
								params:{
									'inc': 'artist-rels url-rels',
											'limit': 1,
											'offset': 0,
											'fmt': 'json'
								}
							})
							.then(musicbrainzWorkRes => {
								this.setState({ musicbrainz: musicbrainzWorkRes.data, isMBLoaded: true })
							},
							error => console.error(error))
						}, err => { console.error(err) })
				}
					, err => console.error(err))
		}
		else if (P175.toLowerCase() === title.trim().toLowerCase()) { // video title was title - artist
			axios
				.get(`https://musicbrainz.org/ws/2/recording`, {
					params: {
						'query': `"${artist.trim()}" AND artistname:"${title.trim()}"`, //AND release:${P361}
						'limit': 1,
						'fmt': 'json'
					}
				})
				.then(resP175EqTitle => {
					axios
						.get(`${musicbrainzBaseUrl}/recording/${resP175EqTitle.data.recordings[0].id}`, {
							params: {
								'inc': 'work-rels+artists+releases',
								'fmt': 'json'
							}
						})
						.then(resRecordingQuery => {
							let musicbrainzWorkId = resRecordingQuery.data.relations.map(x => x['target-type'] === 'work' ? x.work.id.toString() : "") || P435.toString();
							axios.get(`${musicbrainzBaseUrl}/work/${musicbrainzWorkId}`, {
								params:{
									'inc': 'artist-rels url-rels',
											'limit': 1,
											'offset': 0,
											'fmt': 'json'
								}
							})
							.then(musicbrainzWorkRes => {
								this.setState({ musicbrainz: musicbrainzWorkRes.data, isMBLoaded: true })
							},
							error => console.error(error))
						}, err => { console.error(err) })
				}
					, err => console.error(err))
		}
	}

	getWikidataPage(wikidataPXXXXResID) {
		return axios.get(wdk.getEntities(wikidataPXXXXResID, 'en'))
			.then(wikidataPage => {
				let wikidatatmp = wikidataPage.data.entities[Object.keys(wikidataPage.data.entities)[0]];
				this.setState({
					wikidata: wikidatatmp
				});
				axios.all([
					axios.get(wdk.getManyEntities(Object.keys(wikidatatmp.claims), 'en'))
					, axios.get(wdk.getManyEntities(
						Object.keys(wikidatatmp.claims)
							.map(x => wikidatatmp.claims[x][0].mainsnak.datavalue.value.id)
							.filter(x => typeof x === 'string'), 'en'))
				])
					.then(
						axios.spread((resKey, resQ) => {
							this.setState({
								wikidatakeys: Object.entries(resKey.data.entities),
								wikidataQ: resQ.data.entities,
								isWDataLoaded: true
							})
							try{
								this.getMusicBrainzFromWData(
									resQ.data.entities[wikidatatmp.claims.P175[0].mainsnak.datavalue.value.id].labels.en.value,
									wikidatatmp.claims.P435[0].mainsnak.datavalue.value
								);
							}
							catch(e){
								console.error(e)
								this.getMusicBrainzFromWData(
									resQ.data.entities[wikidatatmp.claims.P175[0].mainsnak.datavalue.value.id].labels.en.value
								);
							}
						}))
				if (wikidatatmp.sitelinks.enwiki)
					wikijs()
						.page(wikidatatmp.sitelinks.enwiki.title)
						.then(page => Promise.all([page.fullInfo()]))
						.then(wikipediaRes => this.setState({
							wikipedia: {
								// "desc": wikipediaRes[1],
								"info": wikipediaRes[0].general
							},
							wikipediakeys: Object.keys(wikipediaRes[0].general),
							isWikiLoaded: true
						}))
				else {
					this.findWikiPage();
				}
			}, error => console.error(error))
	}

	findWikiPage = () => {
		let wikiquery = `${'undefined' === typeof this.props.title ? ('undefined' === typeof this.props.title2 ? this.props.artist2 : this.props.title2) : this.props.title.trim()} ${'undefined' === typeof this.props.title && 'undefined' === typeof this.props.title2 ? "" : `(${'undefined' === typeof this.props.artist ? this.props.artist2.trim() : this.props.artist.trim()} song)`}`;
		return wikijs()
			.find(wikiquery)
			.then(res => {
				return Promise.all([res.fullInfo()]);
			}) // find by props.title (props.artist song)
			.then(wikipediaRes => this.setState({
				wikipedia: {
					"info": wikipediaRes[0].general
				},
				wikipediakeys: Object.keys(wikipediaRes[0].general),
				isWikiLoaded: true
			}))
	}

	componentDidMount() {
		let timerId1;
		axios.get(wdk.getReverseClaims('P1651', this.props.videoId)) // P1651 is youtube_video_id property
			.then(wikidataP1651Res => {
				if (wikidataP1651Res.data.results.bindings.length)  // got a match
					this.getWikidataPage(wdk.simplify.sparqlResults(wikidataP1651Res.data))// set in state wikidata
				else { //oof -- no P1651 :(
					let title = this.props.title || this.props.title2;
					axios.get(wdk.searchEntities(`${title.trim()}`))
					.then(wikidataSearchRes => {
						try{
							this.getWikidataPage(wikidataSearchRes.data.search[0].title)
						}
						catch(e){
							console.error(e)
						}
					})
				}
				return new Promise((resolve, reject) => {
					timerId1 = window.setInterval(() => {
						if (this.state.wikidataQ == undefined || this.state.wikidata == undefined) { }
						else{
							try {
								resolve({
									artist: this.state.wikidataQ[this.state.wikidata.claims["P175"][0].mainsnak.datavalue.value.id].labels.en.value.toString(),
									genre: this.state.wikidataQ[this.state.wikidata.claims["P136"][0].mainsnak.datavalue.value.id].labels.en.value.toString()
								})
							}
							catch{
								resolve({ artist: null, genre: null })
							}
						}
					}, 1000)
				})
			}).then((res) => {
				let tmp = JSON.parse(localStorage['currentVideoInfo']);
				window.clearInterval(timerId1);
				tmp = {
					id: this.props.videoId.toString(),
					artist: res.artist,
					genre: res.genre
				}
				localStorage.setItem('currentVideoInfo', JSON.stringify(tmp));
			})
			.finally(() => this.setState({ isLoaded: true }));
	}


	// shouldComponentUpdate(nextProps, nextState) {

	// }

	// componentDidUpdate(prevProps, prevState) {

	// }

	// componentWillUnmount() {

	// }

	render() {
		const { wikidata, wikipedia, musicbrainz, error, isWikiLoaded, isWDataLoaded, isMBLoaded } = this.state;
		const ISO_8601toYYYY = this.ISO_8601toYYYY;
		if (error) {
			return <React.Fragment>Error: {error.message}</React.Fragment>;
		} else if (!this.state.isLoaded) {
			return <Col className="text-center">
				<div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
			</Col>;
		} else {
			return (
				<Table size="sm">
					<tbody>
						{isWikiLoaded &&
							this.state.wikipediakeys.map(key => (
								<tr key={key}>
									<td>{key}</td>
									<td>{wikipedia.info[key].toLocaleString()}</td>
								</tr>
							))
						}
						{isWDataLoaded &&
							this.state.wikidatakeys.map(key => (
								<tr key={key[0]}>
									<td>{`${key[0]} -
									${key[1].labels.en ? key[1].labels.en.value : ""} `}
									</td>
									<td>{
										typeof wikidata.claims[key[0]][0].mainsnak.datavalue.value === "string" ? // wikidata external
											this.getExternalLink(key[0], wikidata.claims[key[0]][0].mainsnak.datavalue.value) :
											typeof wikidata.claims[key[0]][0].mainsnak.datavalue.value.id === "string" ? // wikidata Q 
												<><a target="_blank" rel="noopener noreferrer" href={`https://www.wikidata.org/wiki/${wikidata.claims[key[0]][0].mainsnak.datavalue.value.id}`}>
													{`${this.state.wikidataQ[wikidata.claims[key[0]][0].mainsnak.datavalue.value.id].labels.en ?
														this.state.wikidataQ[wikidata.claims[key[0]][0].mainsnak.datavalue.value.id].labels.en.value :
														"??"}`}
												</a> {`(${wikidata.claims[key[0]][0].mainsnak.datavalue.value.id})`}</> :
												typeof wikidata.claims[key[0]][0].mainsnak.datavalue.value.time === "string" ?
													ISO_8601toYYYY(wikidata.claims[key[0]][0].mainsnak.datavalue.value.time.toString()) :
													""
									}</td>
								</tr>
							))
						}
						{isMBLoaded &&
							musicbrainz.relations.map((relation, i) => {
								if (relation["target-type"] === "artist")
									return (<tr key={i}>
										<td>{relation.type}</td>
										<td>{relation.artist.name}</td>
									</tr>);
								else if (relation["target-type"] === "url")
									return (<tr key={i}>
										<td>{relation.type}</td>
										<td><a target="_blank" rel="noopener noreferrer" href={relation.url.resource}>{relation.type}</a></td>
									</tr>)
								else
									return ("");
							})
						}
					</tbody>
				</Table>
			);
		}
	}
}

export default Wikipedia;
