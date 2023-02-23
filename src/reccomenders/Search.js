import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Col, Media, Card } from 'react-bootstrap';

class Search extends React.Component {

    state = {
        query: '',
        isLoaded: false,
        error: null,
        res: null
    }

    // static getDerivedStateFromProps(nextProps, prevState) {

    // }

    componentDidMount() {
        if (new RegExp("[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]").test(this.props.match.params.query.toString()))
            axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    'part': 'id',
                    'id': this.props.match.params.query,
                    'key': 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig',
                    'field': 'pageInfo/resultsPerPage'
                }
            }).then(
                res => {
                    res.data.pageInfo.resultsPerPage ?
                        this.props.history.push('/video/' + this.props.match.params.query) :
                        this.youtubeSearch()
                },
                error => {
                    console.error(error)
                }
            )
        else
            this.youtubeSearch();
    }

    // shouldComponentUpdate(nextProps, nextState) {

    // }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.query !== this.props.match.params.query) {
            this.setState({ isLoaded: false })
            if (new RegExp("[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]").test(this.props.match.params.query.toString()))
                axios.get('https://www.googleapis.com/youtube/v3/videos', {
                    params: {
                        'part': 'id',
                        'id': this.props.match.params.query,
                        'key': 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig',
                        'field': 'pageInfo/resultsPerPage'
                    }
                }).then(
                    res => {
                        res.data.pageInfo.resultsPerPage ?
                            this.props.history.push('/video/' + this.props.match.params.query) :
                            this.youtubeSearch()
                    },
                    error => {
                        console.error(error)
                        this.setState({
                            error
                        })
                    }
                )
            else
                this.youtubeSearch();

        }
    }

    // componentWillUnmount() {

    // }

    youtubeSearch() {
        return axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                'part': 'snippet',
                'q': this.props.match.params.query,
                'videoEmbeddable': 'true',
                'type': 'video',
                'maxResults': 30,
                'topicId': '/m/04rlf, /m/02jjt',
                'key': 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig'
            }
        }).then(
            res =>
                this.setState({
                    res: res.data,
                    isLoaded: true
                })
            ,
            error => this.setState({
                error
            })
        )
    }

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
                <ul className="list-unstyled">{
                    this.state.res.items.map(item => (
                        <Link
                            key={item.id.videoId}
                            as="li" className="media mx-5 my-1 suggItem"
                            to={{
                                pathname: '/video/' + item.id.videoId,
                                search: "?ref=Search"
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
                                <p>Reccomender: Search</p>
                            </Media.Body>
                        </Link>
                    ))
                }</ul>
            );
        }else{
            return (
                <React.Fragment>
                    {this.state.res.items.map(item => (<Col md="4">
                        <Card key={item.id.videoId}>
                            <Link
                                to={{
                                    pathname: '/video/' + item.id.videoId,
                                    search: "?ref=Search"
                                }}
                            >
                                <Card.Img
                                    src={item.snippet.thumbnails.medium.url}
                                    alt={'Thumbnail of ' + item.snippet.title}
                                />
                                <Card.ImgOverlay>
                                    <Card.Title className="bg-dark d-inline text-white">
                                        <p>{item.snippet.title}</p>
                                        <p className='small'>{item.lastSelected}</p>
                                        <p className='small'>Reccomender: Search</p>
                                    </Card.Title>
                                </Card.ImgOverlay>
                            </Link>
                        </Card>
                    </Col>))}
                </React.Fragment>
            );
        }}
    }
}

export default Search;