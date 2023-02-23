import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Col, Media, Card } from 'react-bootstrap';

class popLocaleAss extends React.Component {

    state = {
        isLoaded: false,
        error: null,
        res: null
    }

    // static getDerivedStateFromProps(nextProps, prevState) {

    // }

    componentDidMount() {
        axios
            .get('http://site1854.tw.cs.unibo.it/videotrack')
            .then(res => {
                this.getThumbnailsNames(res.data.sort((a, b) => a.timesWatched - b.timesWatched).reverse());
            }
                , error => this.setState({ error }))
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

    getThumbnailsNames(reccomended) {
        let idToLookFor = reccomended.map(item => item.id);
        axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet',
                id: idToLookFor.toString(),
                key: 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig',
                fields: 'items(id,snippet/thumbnails/medium,snippet/title,snippet/description)'
            }
        })

            .then(
                res1 => {
                    res1.data.items.map(resCurrentValue =>
                        Object.defineProperties(
                            reccomended.find(videoItem => {
                                return videoItem.id === resCurrentValue.id;
                            }),
                            {
                                'thumbnail':
                                    { value: resCurrentValue.snippet.thumbnails.medium.url },
                                'name':
                                    { value: resCurrentValue.snippet.title },
                                'description':
                                    { value: resCurrentValue.snippet.description }
                            })
                    );
                    this.setState({
                        isLoaded: true,
                        items: reccomended
                    });
                })
    }


    render() {
        if (this.state.error) {
            return <React.Fragment>{this.state.error.message} --  {this.state.error.response.data.error.errors[0].reason}  </React.Fragment>;
        } else if (!this.state.isLoaded) {
            return <Col className="text-center">
                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </Col>;
        } else {
            if (window.innerWidth > 992){
            return (
                <ul className="list-unstyled">{
                    this.state.items.map(item => (
                        <Link
                            key={item.id.videoId}
                            as="li" className="media mx-5 my-1 suggItem"
                            to={{
                                pathname: '/video/' + item.id,
                                search: "?ref=popLocaleAss"
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
                                <p>{item.description.substring(0, 200)}</p>
                                <p>Visto: {item.timesWatched} volt{item.timesWatched === 1 ?"a":"e"} </p>
                                <p> Reccomender: popLocaleAss </p>
                            </Media.Body>
                        </Link>
                    ))
                }</ul>
            );
        }else {return (<React.Fragment>
            {this.state.items.map(function (item, index) {
                return (
                    <Col key={index} md='4'>
                        <Card>
                            <Link
                                to={{
                                    pathname: '/video/' + item.id,
                                    search: "?ref=popLocaleAss"
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
                                        <span> Reccomender: popLocaleAss </span>
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

export default popLocaleAss;