import React from 'react';
import Wikipedia from './Wikipedia';
import { Card, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Linkify from "react-linkify";
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format'; //eslint-disable-line no-unused-vars
import './css/VideoInfo.scss';
const ytclear = require('@c0b41/ytclear');

class VideoInfo extends React.Component {

    state = {
        error: null,
        isLoaded: false,
        VideoDetails: {},
        videoId: '',
        comments: [],
        others: {}
    };

    momentDuration(duration) {
        return moment.duration(duration).format('hh:mm:ss')
    }

    ISO_8601parse(a) {
        return moment(a, moment.ISO_8601).format('ddd, DD/MM/YYYY hh:mm:ss');
    }

    componentDidMount() {
        return axios.all([
            axios.get('https://www.googleapis.com/youtube/v3/videos', { //Richiesta per tutte le info sul video
                params: {
                    'part': 'snippet,contentDetails,statistics,topicDetails',
                    'id': this.props.videoId,
                    'key': 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig' // 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig' in production
                }
            }), axios.get('https://www.googleapis.com/youtube/v3/commentThreads', { //Richiesta per ottenere i commenti del video
                params: {
                    'part': 'snippet',
                    'videoId': this.props.videoId,
                    'order': 'relevance',
                    'key': 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig' // 'AIzaSyA21Odw9UdfiOJnxvA_eDfOW0OxuUfHKig' in production
                }
            })])
            .then(axios.spread((videosResponse, commentThreadResponse) => {
                this.setState({
                    VideoDetails: videosResponse.data.items[0],
                    comments: commentThreadResponse.data.items,
                    isLoaded: true
                });
                let index = videosResponse.data.items[0].topicDetails.relevantTopicIds.indexOf('/m/04rlf');
                videosResponse.data.items[0].topicDetails.relevantTopicIds.splice(index, 1);
                localStorage.setItem('lastTopic', videosResponse.data.items[0].topicDetails.relevantTopicIds);
            }), error => {
                console.error(error);
                this.setState({
                    error,
                    isLoaded: true
                });
            });
    }

    render() {
        const { error, isLoaded, VideoDetails, comments } = this.state;
        const momentDuration = this.momentDuration;
        const ISO_8601parse = this.ISO_8601parse;
        if (error) {
            let htmlRegEx = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/gm;
            return (
                <span className="text-white">
                    <span>{}</span>
                    Error: {error.message} -- {error.response.data && error.response.data.error.message.replace(htmlRegEx, '')}
                </span>
            );
        } else if (!isLoaded) {
            return <div className="text-center">
                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </div>;
        } else {
            return (
                <React.Fragment>
                    <span className="h5 text-white">{VideoDetails.snippet.title}</span>
                    <Tabs defaultActiveKey="video" id="tabs">
                        <Tab className="text-white" eventKey="video" title="Video">
                            <p>
                                <b>ID Video: </b>{VideoDetails.id}<br />
                                <b>Published: </b>{ISO_8601parse(VideoDetails.snippet.publishedAt)}<br />
                                <b>Channel name: </b>{VideoDetails.snippet.channelTitle}<br />
                                <b>Description: </b><Linkify>{VideoDetails.snippet.description}</Linkify><br />
                                <b>Tags: </b>{VideoDetails.snippet.tags ?
                                    VideoDetails.snippet.tags.map((tag, i) =>
                                        (<span key={i}><Link to={{ pathname: '/search/' + tag }}>{tag}</Link>{" "}</span>))
                                    : ""}
                            </p>
                        </Tab>
                        <Tab className="text-white" eventKey="techinfo" title="Tecnical Informations">
                            <p>
                                <b>Duration: </b>{momentDuration(VideoDetails.contentDetails.duration)}<br />
                                <b>Definition: </b> {VideoDetails.contentDetails.definition}<br />
                                <b>Dimension: </b> {VideoDetails.contentDetails.dimension}<br />
                                <b>Views: </b> {VideoDetails.statistics.viewCount}<br />
                                <b>Likes: </b> {VideoDetails.statistics.likeCount}{String.fromCodePoint(0x1F44D)}<br />
                                <b>Dislikes: </b> {VideoDetails.statistics.dislikeCount}{String.fromCodePoint(0x1F44E)}
                            </p>
                        </Tab>
                        <Tab eventKey="comments" title="Comment">
                            {comments.map(function (comment, index) {
                                return (
                                    <Card key={index} className="my-1">
                                        <Card.Body>
                                            <Card.Title>
                                                <Card.Img src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} style={{ width: '3rem', height: '3rem' }} />
                                                {comment.snippet.topLevelComment.snippet.authorDisplayName}
                                            </Card.Title>
                                            <Card.Text>
                                                <Linkify>
                                                    {comment.snippet.topLevelComment.snippet.textOriginal}
                                                </Linkify>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                )
                            })}
                        </Tab>
                        <Tab className="text-white" eventKey="wikipedia" title="Wikipedia">
                            <Wikipedia
                                title={'undefined' !== typeof this.props.location.state ? this.props.location.state.title : undefined}
                                title2={ytclear(this.state.VideoDetails.snippet.title).split('-')[1]}
                                artist={'undefined' !== typeof this.props.location.state ? this.props.location.state.artist : undefined}
                                artist2={ytclear(this.state.VideoDetails.snippet.title).split('-')[0]}
                                key={this.props.videoId}
                                videoId={this.props.videoId}
                            />
                        </Tab>
                    </Tabs>
                </React.Fragment>
            );
        }
    }
}

export default VideoInfo;
