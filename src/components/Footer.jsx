import { Container } from "react-bootstrap";
import { Box, Typography, IconButton, Paper, Grid, Divider } from "@mui/material";
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

  const footerLinks = [
    { label: "Privacy Policy", url: "/privacy" },
    { label: "Terms of Service", url: "/terms" },
    { label: "Contact Us", url: "/contactus" },
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
        <Container>
          <Grid container spacing={3} alignItems="center">
            {/* Brand and Copyright */}
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  mb: 1,
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                }}
              >
                Off World Media Africa
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#4682B4",
                  fontSize: { xs: "0.85rem", md: "0.9rem" },
                }}
              >
                © {new Date().getFullYear()}{" "}
                <Box component="span" sx={{ color: "#F59E0B" }}>
                  Off World Media Africa
                </Box>
                . All Rights Reserved.
              </Typography>
            </Grid>

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
              <Box sx={{ display: "flex", gap: 1.5 }}>
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

            {/* Divider */}
            <Grid item xs={12} sx={{ my: 2 }}>
              <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
            </Grid>

            {/* Additional Links */}
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3, flexWrap: "wrap" }}>
                {footerLinks.map((link, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    component={Link}
                    to={link.url}
                    sx={{
                      color: "#4682B4",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#F59E0B",
                        textDecoration: "underline",
                      },
                      fontSize: { xs: "0.85rem", md: "0.9rem" },
                    }}
                  >
                    {link.label}
                  </Typography>
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