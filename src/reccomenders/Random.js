import React, { Component } from 'react';
import axios from "axios";
import createpageToken from 'youtube-page-token';
import { Card, Col, Media } from "react-bootstrap";
import { Link } from "react-router-dom";
import moment from "moment";

class RecommenderRandom extends Component {
    state = {
        items: [],
    }

    ISO_8601parse(a) {
        return moment(a, moment.ISO_8601).format('ddd, DD/MM/YYYY hh:mm:ss');
    }

    componentDidMount() {
        let pos = Math.floor(Math.random() * 500);
        let pageToken = createpageToken(pos); /* createPageToken(pos) restituisce il pageToken relativo al numero
                                                di pagina che gli viene passato(in questo caso pos) che verrai poi usato
                                                come parametro da axios per ottenere una determinata pagina di risultati */

        axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                'part': 'snippet',
                'topicId': '/m/04rlf', //Filtro per la musica.In questo caso il valore è quello della parent directory
                'type': 'video',       //che contiene tutti i generi di musica
                'maxResults': '21',
                'pageToken': pageToken,
                'key': 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig'
            }
        }).then(
            response => {
                this.setState({
                    items: response.data.items,
                })
            },
            error => {
                console.error(error);
            }
        )
    }

    render() {
        const ISO_8601parse = this.ISO_8601parse;
        if (window.innerWidth < 992) {
        return (<React.Fragment>
            {this.state.items.map(function (item, index) {
                return (
                    <Col key={index} md='4'>
                        <Card>
                            <Link
                                to={{
                                    pathname: '/video/' + item.id.videoId,
                                    search: "?ref=Random"
                                }}
                            >
                                <Card.Img
                                    src={item.snippet.thumbnails.high.url}
                                    alt={'Thumbnail of ' + item.snippet.title}
                                />
                                <Card.ImgOverlay>
                                    <Card.Title className="bg-dark d-inline text-white">
                                        {item.snippet.title}<br />
                                        {item.snippet.channelTitle} - {ISO_8601parse(item.snippet.publishedAt)}<br />
                                        <span>Reccomender: Random</span>
                                    </Card.Title>
                                </Card.ImgOverlay>
                            </Link>
                        </Card>
                    </Col>
                )
            })}
        </React.Fragment>);
    }else{
        return (
            <ul className="list-unstyled">{
                this.state.items.map(item => (
                    <Link
                        key={item.id.videoId}
                        as="li" className="media mx-5 my-1 suggItem"
                        to={{
                            pathname: `/video/${item.id.videoId}`,
                            search: '?ref=Random'
                        }}>
                        <img
                            width={240}
                            height={120}
                            className="align-self-center mr-3 img-fluid"
                            src={item.snippet.thumbnails.high.url}
                            alt={'Thumbnail of ' + item.snippet.title}
                        />
                        <Media.Body>
                            <h5>{item.snippet.title}</h5>
                            <p> {item.snippet.channelTitle} - {ISO_8601parse(item.snippet.publishedAt)}</p>
                            <p>Reccomender: Random</p>
                        </Media.Body>
                    </Link>
                ))
            }</ul>
        );
    }}
}
export default RecommenderRandom;