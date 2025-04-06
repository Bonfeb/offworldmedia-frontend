import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faClock } from "@fortawesome/free-solid-svg-icons";
import API from '../../api';

function AdminServices() {
    const [serviceData, setServicesData] = useState()

    useEffect(() => {
        API.get("/admin-dashboard/", {
            withCredentials: true
        })
          .then(response => setServicesData(response.data))
          .catch(error => console.error("Error fetching dashboard data:", error));
      }, []);
  return (
    <Container>
    {serviceData ? (
        <>
        <Row>
            <Card className="stat-card services mt-2">
              <Card.Body>
                <FontAwesomeIcon icon={faVideo} size="2x" />
                <hr/>
                <h4>{serviceData.stats.total_services}</h4>
                <hr/>
                <h5>Services</h5>
              </Card.Body>
            </Card>
          
        </Row>
        <Row>
             <Col md={4}>
                <Card className="stat-card pending mt-2">
                  <Card.Body>
                    <FontAwesomeIcon icon={faClock} size="2x" />
                    <hr/>
                    <h4>{serviceData.stats.video_recording}</h4>
                    <hr/>
                    <h5>Video Recording</h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card pending mt-2">
                  <Card.Body>
                    <FontAwesomeIcon icon={faClock} size="2x" />
                    <hr/>
                    <h4>{serviceData.stats.audio_recording}</h4>
                    <hr/>
                    <h5>Audio Recording</h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card pending mt-2">
                  <Card.Body>
                    <FontAwesomeIcon icon={faClock} size="2x" />
                    <hr/>
                    <h4>{serviceData.stats.photo_shooting}</h4>
                    <hr/>
                    <h5> Photo Shooting</h5>
                  </Card.Body>
                </Card>
              </Col>
        </Row>
        </>
      ) : 
        <p>Loading data...</p>
      } 
    </Container> 
  )
 
}

export default AdminServices;