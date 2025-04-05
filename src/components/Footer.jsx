import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faLinkedin, faGithub, faInstagram, faTiktok, faYoutube } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const twitter = import.meta.env.VITE_TWITTER;
  const facebook = import.meta.env.VITE_FACEBOOK;
  const instagram = import.meta.env.VITE_INSTAGRAM;
  const tiktok = import.meta.env.VITE_TIKTOK;
  const youtube = import.meta.env.VITE_YOUTUBE

  return (
    <footer
      className="py-4 mt-5 text-white"
      style={{
        background: "linear-gradient(180deg, rgb(63, 77, 60), rgb(25, 52, 32))",
        color: "orange",
      }}
    >
      <Container>
        <Row className="align-items-center text-center text-md-start">
          <Col md={6}>
            <p className="mb-0">
              &copy; {new Date().getFullYear()} <span className="text-uppercase">Off World Media Africa.</span> All Rights Reserved.
            </p>
          </Col>
          <Col md={6} className="d-flex justify-content-center justify-content-md-end gap-3">
            <Link to={facebook} target="_blank" rel="noopener noreferrer" className="text-white">
              <FontAwesomeIcon icon={faFacebook} size="lg" />
            </Link>
            <Link to={twitter} target="_blank" rel="noopener noreferrer" className="text-white">
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </Link>
            <Link to={tiktok} target="_blank" rel="noopener noreferrer" className="text-white">
              <FontAwesomeIcon icon={faTiktok} size="lg" />
            </Link>
            <Link to={instagram} target="_blank" rel="noopener noreferrer" className="text-white">
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </Link>
            <Link to={youtube} target="_blank" rel="noopener noreferrer" className="text-white">
              <FontAwesomeIcon icon={faYoutube} size="lg" />
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
