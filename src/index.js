// import 'bootstrap/dist/css/bootstrap.css';
// import './css/bootswatch/darkly/bootstrap.min.css'
import './css/bootswatch/superhero/bootstrap.min.css'
import 'react-app-polyfill/ie9';
//import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { HashRouter, BrowserRouter } from 'react-router-dom'; // eslint-disable-line

localStorage['lastWatched'] ? function () { }() : localStorage.setItem('lastWatched', JSON.stringify([]))
localStorage['first'] ? function () { }() : localStorage.setItem('first', JSON.stringify([]))
localStorage['prevId'] ? function () { }() : localStorage.setItem('prevId', '1')
localStorage['lastId'] ? function () { }() : localStorage.setItem('lastId', '0J2QdDbelmY')
localStorage['currentVideoInfo'] ? function () { }() : localStorage.setItem('currentVideoInfo', JSON.stringify({
    'id': '0J2QdDbelmY',
    'artist': 'Seven Nation Army',
    'genre': 'Rock'
}));
localStorage['lastTopic'] ? function () { }() : localStorage.setItem('lastTopic', '/m/04rlf');

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
