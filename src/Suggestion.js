import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import Random from './reccomenders/Random';
import Related from './reccomenders/Related';
import Search from './reccomenders/Search';
import fvitali from './reccomenders/fvitali';
import popGlobaleAssoluta from './reccomenders/popGlobaleAssoluta';
import Recent from './reccomenders/Recent';
import similarityArtist from './reccomenders/similarityArtist';
import popLocaleAss from './reccomenders/popLocaleAss';
import PopRelLoc from './reccomenders/popRelLoc';
import genreSimilarity from './reccomenders/genreSimilarity';

// and so on..

class Suggestion extends Component {

  // static getDerivedStateFromProps(nextProps, prevState) {

  // }

  // componentDidMount() {

  // }

  // shouldComponentUpdate(nextProps, nextState) {

  // }

  // componentDidUpdate(prevProps, prevState) {

  // }

  // componentWillUnmount() {

  // }

  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route path='/video/:id/genreSimilarity' component={genreSimilarity} />
          <Route path='/video/:id/vitali' component={fvitali} />
          <Route path='/search/:query' component={Search} />
          <Route path='/video/:id/random' component={Random} />
          <Route path='/video/:id/popGlobalAssoluta' component={popGlobaleAssoluta} />
          <Route path='/video/:id/popLocaleAss' component={popLocaleAss} />
          <Route path='/video/:id/recent' component={Recent} />
          <Route path='/video/:id/similarityArtist' component={similarityArtist} />
          <Route path='/video/:id/popRelLoc' component={PopRelLoc} />
          {/* lasciare questo per ultimo */}
          <Route component={Related} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default Suggestion;