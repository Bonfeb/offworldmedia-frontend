import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { Container, Row, Card, Col, Image } from "react-bootstrap";
import "../assets/css/Team.css";
import { media_url } from "../utils/constants";

function Team() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [teamMember, setTeamMember] = useState([]);
  useEffect(() => {
    API.get("/team/")
      .then((response) => {
        setTeamMember(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load OffWorldMedia Team");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading Team Members...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container fluid className="py-5 team-boxed">
      <div className="text-center mb-4">
        <h2>Team</h2>
        <p>
          Nunc luctus in metus eget fringilla. Aliquam sed justo ligula.
          Vestibulum nibh erat, pellentesque ut laoreet vitae.
        </p>
      </div>
      <Row className="justify-content-center people">
        {teamMember.map((member) => (
          <Col md={6} lg={4} className="item" key={member.id}>
            <motion.div>
              <Card className="text-center shadow-lg">
                <Card.Img
                  variant="top"
                  src={member.profile_pic}
                  className="rounded-circle mx-auto mt-3"
                  style={{ width: "120px", height: "120px" }}
                />
                <Card.Body>
                  <Card.Title>{member.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {member.role}
                  </Card.Subtitle>
                  <Card.Text>{member.bio}</Card.Text>
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex justify-content-center gap-3">
                    <Link to="#">
                      <FontAwesomeIcon icon={faFacebook} size="2x" />
                    </Link>
                    <Link to="#">
                      <FontAwesomeIcon icon={faTwitter} size="2x" />
                    </Link>
                    <Link to="#">
                      <FontAwesomeIcon icon={faInstagram} size="2x" />
                    </Link>
                  </div>
                </Card.Footer>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Team;
