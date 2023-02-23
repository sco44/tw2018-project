import React, { Component } from 'react';
import {
	Navbar,
	Nav,
	NavDropdown,
	FormControl,
	Button
} from 'react-bootstrap'; //eslint-disable-next-line
import { Link, withRouter } from 'react-router-dom';
import './css/TopBar.css';



class TopBar extends Component {
	state = {
		query: ''
	};
	handleChange = event => {
		this.setState({
			query: event.target.value
		});
	}
	handleSubmit = event => {
		event.preventDefault();
		//	event.target.reset();
		this.props.history.push('/search/' + this.state.query);
	}
	render() {
		return (
			<React.Fragment>
				<Navbar bg="primary" varian="dark" className="py-0 px-1 w-100" expand="md">
					<Navbar.Brand>
						<Link className="text-light" to="/">HazeTV</Link>
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							<Link to="/" className="text-light nav-link">Home</Link>
							<Link to={{ pathname: `/video/${localStorage['lastId']}/vitali` }} className="text-light nav-link">Vitali</Link>
							<Link to={{ pathname: `/video/${localStorage['lastId']}/recent` }} className="text-light nav-link">Recent</Link>
							<Link to={{ pathname: `/video/${localStorage['lastId']}/random` }} className="text-light nav-link">Random</Link>
							<Link to={{ pathname: `/video/${localStorage['lastId']}/related` }} className="text-light nav-link">Related</Link>
							{<NavDropdown title="Similarity" id="basic-nav-dropdown" >

								<Link to={{ pathname: `/video/${localStorage['lastId']}/similarityArtist` }} className="text-light nav-link">
									Artist
									</Link>


								<Link to={{ pathname: `/video/${localStorage['lastId']}/genreSimilarity` }} className="text-light nav-link">
									Genre
									</Link>

							</NavDropdown>}
							{<NavDropdown title="Popolarità locale" id="basic-nav-dropdown" >

								<Link to={{ pathname: `/video/${localStorage['lastId']}/popLocaleAss` }} className="text-light nav-link">
									Assoluta
									</Link>


								<Link to={{ pathname: `/video/${localStorage['lastId']}/popRelLoc` }} className="text-light nav-link">
									Relativa
									</Link>

							</NavDropdown>}

							<Link to={{ pathname: `/video/${localStorage['lastId']}/popGlobalAssoluta` }} className="text-light nav-link">popGlobalAssoluta</Link>

						</Nav>
						<form className="form-inline" onSubmit={this.handleSubmit}>
							<FormControl
								type="text"
								placeholder="Search"
								className="mr-sm-2"
								onChange={this.handleChange}
							/>
							<Button type="submit" variant="secondary">Search</Button>
						</form>
					</Navbar.Collapse>
				</Navbar>
			</React.Fragment>
		);
	}
}

export default withRouter(TopBar);
