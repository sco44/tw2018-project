import React from 'react';
import { Col, Media, Card } from 'react-bootstrap'; // eslint-disable-line no-unused-vars
import axios from 'axios'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars
import moment from "moment";
var _ = require('lodash');

class popGlobaleAssoluta extends React.Component {
    state = {
        error: null,
        isLoaded: false,
        items: [],
        headers: null
    };

    componentDidMount() {
       // let listSiti = ['1828', '1829', '1838', '1839', '1846', '1822', '1847', '1831', '1827', '1848', '1824', '1830', '1836', '1850', '1849', '1851', '1861', '1823', '1863', '1834', '1904', '1906', '1901', '1862', '1859', '1841', '1905', '1864', '1840', '1860', '1858', '1835', '1911', '1913', '1826', '1855', '1907', '1912', '1903', '1915', '1854', '1910'];
       let listSiti = ['1828', '1838','1839', '1846', '1831', '1827', '1823', '1863', '1834', '1901'];//, '1859', '1841', '1905', '1864',  '1860', '1858',  '1913', '1855', '1912', '1915', '1854', '1910'];
        Promise.all(
            listSiti.map(
                el => fetch(`http://site${el}.tw.cs.unibo.it/globpop?id=${this.props.match.params.id}`)
                    .then(res =>
                        res.json()
                    )
            )
        ).then(res => {
            /* do something with res here... */
            console.log(res)
            let tmp = res.map(x => x.recommended);
            //let tmp2 =tmp.filter(el=>el.length > 0).map(el => el.map(el1 => el1.videoID || el1.videoId) )
            console.log(...tmp)
            this.getThumbnailsNames(tmp);
            });
        
        
    }

    // METODI
    getThumbnailsNames(reccomended) {
        console.log(reccomended)
        let tmp2 =reccomended.filter(el=>el.length > 0).map(el => el.map(el1 => el1.videoID || el1.videoId) )
        let idToLookFor =[].concat(...tmp2);
        idToLookFor.filter(el=>el.videoID !== undefined || el.videoId !== undefined)
        axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet',
                id: _.uniq(idToLookFor).slice(0,50).toString(),
                key: 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig',
                fields: 'items(id,snippet/thumbnails/high,snippet/title)'
            }
        })
            .then(
                res1 => {
                    this.setState({
                        items: res1.data.items,
                        isLoaded: true,                       
                    });
                    console.log(res1)
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
        } else { if (window.innerWidth < 992){
            return (
                <React.Fragment>
                    {items.map(item => (<Col md="4">
                        <Card>
                            <Link
                                to={{
                                    pathname: '/video/' + item.videoID,
                                    search: "?ref=popGlobaleAssoluta"
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
                                        <span>Reccomender: popGlobaleAssoluta</span>
                                    </Card.Title>
                                </Card.ImgOverlay>
                            </Link>
                        </Card>
                    </Col>))}

                </React.Fragment>
            );
        }else {
            return (
                <ul className="list-unstyled">{
                    this.state.items.map(item => (
                        <Link
                            key={item.videoID}
                            as="li" className="media mx-5 my-1 suggItem"
                            to={{
                                pathname: `/video/${item.videoID}`,
                                search: '?ref=popGlobaleAssoluta'
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
                            <p> {item.snippet.channelTitle}</p>
                                <p>Reccomender: popGlobaleAssoluta</p>
                            </Media.Body>
                        </Link>
                    ))
                }</ul>
            );
        }}
    }
}



export default popGlobaleAssoluta;