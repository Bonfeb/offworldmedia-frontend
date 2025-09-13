import { Container } from "react-bootstrap";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faTiktok,
  faYoutube,
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
      elevation={4}
      sx={{
        width: "100%",
        background: "linear-gradient(180deg, #1E3A8A, #172554)",
        color: "#fff",
        borderRadius: 0,
        flexShrink: 0,
      }}
    >
      <Box py={{ xs: 4, md: 6 }}>
        <Container className="justify-content-center text-center">
          <Grid container spacing={3} alignItems="center">
            {/* Social Links */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, sm: 2 },
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component={Link}
                    to={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#FFFFFF",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      "&:hover": {
                        color: "#F59E0B",
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.3s ease",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <FontAwesomeIcon icon={social.icon} size="lg" />
                  </IconButton>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Paper>
  );
};

export default Footer;
