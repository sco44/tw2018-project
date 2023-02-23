import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Col, Media, Card } from 'react-bootstrap';

class similarityArtist extends React.Component {

    state = {
        isLoaded: false,
        error: null,
        res: null
    }

    // static getDerivedStateFromProps(nextProps, prevState) {

    // }

    componentDidMount() {
        let timerId1;
        let promise = new Promise((resolve, reject) => {
            timerId1 = window.setInterval(() => {
                if (localStorage['lastId'] === JSON.parse(localStorage['currentVideoInfo']).id)
                    resolve(true)
            }, 1000)
        })
        promise.then(() => {
            window.clearInterval(timerId1);
            this.setState({ artist: JSON.parse(localStorage['currentVideoInfo']).artist })
            axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    'part': 'snippet',
                    'q': JSON.parse(localStorage['currentVideoInfo']).artist,
                    'videoEmbeddable': 'true',
                    'type': 'video',
                    'maxResults': 15,
                    'topicId': '/m/04rlf, /m/02jjt',
                    'key': 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig'
                }
            }).then(
                res => {
                    let j = res.data.items.findIndex(el => el.id.videoId === localStorage['lastId'])
                    if (j >= 0)
                        res.data.items.splice(j, 1);
                    this.setState({
                        res: res.data,
                        isLoaded: true
                    })
                    console.log(res);
                }

                ,

                error => this.setState({
                    error
                })
            )
        })

    }

    // shouldComponentUpdate(nextProps, nextState) {

    // }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevProps.match.params !== this.props.match.params) {
    //         this.setState({ isLoaded: false })
    //     }
    // }

    // componentWillUnmount() {

    // }



    render() {
        if (this.state.error) {
            return <React.Fragment>{this.state.error.message} --  {this.state.error.response.data.error.errors[0].reason}  </React.Fragment>;
        } else if (!this.state.isLoaded) {
            return <Col className="text-center">
                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </Col>;
        } else {
            if (window.innerWidth > 992) {
            return (
                <>
                    <h4>Artist Similarity: {this.state.artist}</h4>
                    <ul className="list-unstyled">{
                        this.state.res.items.map(item => (
                            <Link
                                key={item.id.videoId}
                                as="li" className="media mx-5 my-1 suggItem"
                                to={{
                                    pathname: '/video/' + item.id.videoId,
                                    search: "?ref=similarityArtist"
                                }}>
                                <img
                                    width={240}
                                    height={120}
                                    className="align-self-center mr-3"
                                    src={item.snippet.thumbnails.medium.url}
                                    alt={'Thumbnail of ' + item.snippet.title}
                                />
                                <Media.Body>
                                    <h5>{item.snippet.title}</h5>
                                    <p>{item.snippet.description}</p>
                                    <p>Reccomender: similarityArtist</p>
                                </Media.Body>
                            </Link>
                        ))
                    }</ul>
                </>
            );
        }else{
            return (<React.Fragment>
                {this.state.res.items.map(function (item, index) {
                    return (
                        <Col key={index} md='4'>
                            <Card>
                                <Link
                                    to={{
                                        pathname: '/video/' + item.id.videoId,
                                        search: "?ref=similarityArtist"
                                    }}
                                >
                                    <Card.Img
                                        src={item.snippet.thumbnails.high.url}
                                        alt={'Thumbnail of ' + item.snippet.title}
                                    />
                                    <Card.ImgOverlay>
                                        <Card.Title className="bg-dark d-inline text-white">
                                            {item.snippet.title}<br />
                                            {item.snippet.channelTitle}<br />
                                            <span>Reccomender: similarityArtist</span>
                                        </Card.Title>
                                    </Card.ImgOverlay>
                                </Link>
                            </Card>
                        </Col>
                    )
                })}
            </React.Fragment>);
        }}
    }
}

export default similarityArtist;