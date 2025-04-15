import { Container, Row, Col } from "react-bootstrap";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFacebook, 
  faTwitter, 
  faLinkedin, 
  faGithub, 
  faInstagram, 
  faTiktok, 
  faYoutube 
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const twitter = import.meta.env.VITE_TWITTER;
  const facebook = import.meta.env.VITE_FACEBOOK;
  const instagram = import.meta.env.VITE_INSTAGRAM;
  const tiktok = import.meta.env.VITE_TIKTOK;
  const youtube = import.meta.env.VITE_YOUTUBE;

  const socialLinks = [
    { icon: faFacebook, url: facebook },
    { icon: faTwitter, url: twitter },
    { icon: faInstagram, url: instagram },
    { icon: faTiktok, url: tiktok },
    { icon: faYoutube, url: youtube },
  ];

  return (
    <Paper 
      square 
      elevation={3} 
      sx={{ 
        width: "100%",
        background: "linear-gradient(180deg, rgb(63, 77, 60), rgb(25, 52, 32))",
        color: "#fff",
        borderRadius: 0,
        flexShrink: 0 // Prevents the footer from shrinking
      }}
    >
      <Box py={3}>
        <Container>
          <Row className="align-items-center text-center text-md-start">
            <Col md={6}>
              <Typography variant="body1" fontWeight="medium">
                &copy; {new Date().getFullYear()}{" "}
                <Box component="span" sx={{ textTransform: "uppercase", color: "orange" }}>
                  Off World Media Africa.
                </Box>{" "}
                All Rights Reserved.
              </Typography>
            </Col>
            
            <Col md={6} className="d-flex justify-content-center justify-content-md-end mt-3 mt-md-0">
              <Box sx={{ display: "flex", gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton 
                    key={index}
                    component={Link} 
                    to={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ 
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        color: "orange",
                        transform: "translateY(-3px)"
                      }
                    }}
                    size="medium"
                  >
                    <FontAwesomeIcon icon={social.icon} size="lg" />
                  </IconButton>
                ))}
              </Box>
            </Col>
          </Row>
        </Container>
      </Box>
    </Paper>
  );
};

export default Footer;