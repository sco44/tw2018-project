import React, { Component } from 'react'
import { Container, Row, Col, Image } from 'react-bootstrap';
import './css/AboutUs.css';

export default class AboutUs extends Component {
  render() {
    return (
      <Container>
        <Row className="show-Container text-center">
          <Col xs={12} sm={4} className="person-wrapper">
            <Image src="assets/person-1.jpg" roundedCircle className="profile-pic" />
            <h3>Matteo Scorzafava</h3>
            Wikipedia <br/>
            Gestione 15 secondi <br/>
            Recommender Search <br/>
            Back-end per popolarità <br/>
            Recommender similarityArtist <br/>


            <p></p>
          </Col>
          <Col xs={12} sm={4} className="person-wrapper">
            <Image src="assets/person-2.jpg" roundedCircle className="profile-pic" />
            <h3>Simone Ferrari</h3>
            <p>Recommender Random<br/>
               Recommender Related<br/>
               Recommender Similarity Genere<br/>
               Box delle informazioni relative al video
            </p>
          </Col>
          <Col xs={12} sm={4} className="person-wrapper">
            <Image src="assets/person-3.jpg" roundedCircle className="profile-pic" />
            <h3>Gregorio Giacchetti</h3>
            <p>Recommender Recent<br/>
               Recommender fvitali<br/>
               Gestione della barra dei recommender<br/>
               AboutUs <br/>
               Recommender similarityArtist
            </p>
          </Col>
        </Row>
      </Container>
    )
  }
}
