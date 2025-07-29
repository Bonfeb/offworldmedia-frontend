import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Alert, Button } from "react-bootstrap";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { media_url } from "../utils/constants";

// Styled Card with enhanced visual effects
const ServiceCard = styled(Card)(({ theme }) => ({
  position: "relative",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(30, 58, 138, 0.25)",
    "& .service-image": {
      transform: "scale(1.1)",
    },
    "& .price-chip": {
      transform: "scale(1.1)",
      backgroundColor: "#1565C0",
    },
    "& .service-button": {
      backgroundColor: "#1565C0",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(21, 101, 192, 0.3)",
    },
  },
  [theme.breakpoints.down("md")]: {
    margin: theme.spacing(1, 0),
  },
}));

// Enhanced Price Chip
const PriceChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: "#1976D2",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "0.9rem",
  padding: "8px 4px",
  borderRadius: "20px",
  zIndex: 10,
  transition: "all 0.3s ease",
  boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)",
  "&:hover": {
    backgroundColor: "#1565C0",
  },
}));

// Styled Image Container
const ImageContainer = styled(Box)({
  position: "relative",
  overflow: "hidden",
  height: "220px",
  "& .service-image": {
    transition: "transform 0.4s ease",
  },
});

// Enhanced Button
const StyledButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
  border: "none",
  borderRadius: "25px",
  padding: "12px 24px",
  fontWeight: "600",
  fontSize: "0.95rem",
  textTransform: "none",
  letterSpacing: "0.5px",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
  "&:hover": {
    background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(21, 101, 192, 0.3)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

function Service() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [authAlert, setAuthAlert] = useState(false);

  // Function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await API.get("/services/");
        console.log("Fetched services:", response.data);
        setServices(
          Array.isArray(response.data.services) ? response.data.services : []
        );
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Error Loading Services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleFillEventDetails = (serviceId) => {
    if (!isAuthenticated) {
      setAuthAlert(true);
      navigate("/login");
      return;
    }
    navigate(`/event-details/${serviceId}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        sx={{ backgroundColor: "#f8f9fa" }}
      >
        <CircularProgress 
          sx={{ 
            color: "#1976D2",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round"
            }
          }} 
          size={60}
          thickness={4}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Typography 
          variant="h6" 
          color="error"
          sx={{ 
            fontWeight: "500",
            fontSize: { xs: "1.1rem", md: "1.25rem" }
          }}
        >
          {error}
        </Typography>
        <StyledButton 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </StyledButton>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Typography
            variant="h3"
            sx={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #1976D2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "800",
              mb: 2,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Discover Our{" "}
            <Typography
              component="span"
              variant="h3"
              sx={{ 
                background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "800"
              }}
            >
              Exceptional Services
            </Typography>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#546E7A",
              maxWidth: "700px",
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.2rem" },
              lineHeight: 1.6,
              fontWeight: "400",
            }}
          >
            Explore our comprehensive range of premium services designed to exceed your expectations with unmatched excellence and precision.
          </Typography>
        </Box>

        {/* Alert Messages */}
        {showAlert && (
          <Alert 
            variant="success" 
            className="text-center mb-4"
            sx={{ 
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            Service added to cart. Go to your dashboard to view and/or book it!
          </Alert>
        )}

        {authAlert && (
          <Alert 
            variant="danger" 
            className="text-center mb-4"
            sx={{ 
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            You must be logged in to add services to the cart.
          </Alert>
        )}

        {/* Services Grid */}
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
          justifyContent="center"
          sx={{ px: { xs: 1, sm: 0 } }}
        >
          {services.map((service) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={6} 
              lg={4} 
              xl={3} 
              key={service.id}
              sx={{ display: "flex" }}
            >
              <ServiceCard>
                <ImageContainer>
                  <CardMedia
                    component="img"
                    className="service-image"
                    height="220"
                    image={service.image || "/api/placeholder/400/220"}
                    alt={capitalizeWords(service.category)}
                    sx={{
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                  <PriceChip 
                    className="price-chip"
                    label={`KSH ${service.price?.toLocaleString() || "0"}`} 
                  />
                </ImageContainer>

                <CardContent 
                  sx={{ 
                    flexGrow: 1, 
                    textAlign: "center",
                    p: { xs: 2, md: 3 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "700",
                        background: "linear-gradient(135deg, #1E3A8A 0%, #1976D2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 2,
                        fontSize: { xs: "1.3rem", md: "1.5rem" },
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                      }}
                    >
                      {capitalizeWords(service.category)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#546E7A",
                        mb: 3,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        lineHeight: 1.6,
                        fontWeight: "400",
                      }}
                    >
                      {service.description || "Professional service tailored to your needs."}
                    </Typography>
                  </Box>
                  
                  <StyledButton
                    className="service-button"
                    fullWidth
                    onClick={() => handleFillEventDetails(service.id)}
                    sx={{
                      mt: "auto",
                      fontSize: { xs: "0.9rem", md: "0.95rem" }
                    }}
                  >
                    Fill Event Details
                  </StyledButton>
                </CardContent>
              </ServiceCard>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {services.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography
              variant="h5"
              sx={{
                color: "#546E7A",
                mb: 2,
                fontWeight: "500"
              }}
            >
              No services available at the moment
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#78909C",
                mb: 4
              }}
            >
              Please check back later for new services
            </Typography>
            <StyledButton onClick={() => window.location.reload()}>
              Refresh Page
            </StyledButton>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Service;