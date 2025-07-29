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

// Styled Card with enhanced visual effects and dark theme
const ServiceCard = styled(Card)(({ theme }) => ({
  position: "relative",
  height: "100%",
  display: "flex",
  flexDirection: "row", // Horizontal layout for large screens
  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
  backgroundColor: "#1a1a1a",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 40px rgba(25, 118, 210, 0.3)",
    border: "1px solid rgba(25, 118, 210, 0.3)",
    "& .service-image": {
      transform: "scale(1.05)",
    },
    "& .price-chip": {
      transform: "scale(1.1)",
      backgroundColor: "#1565C0",
    },
    "& .service-button": {
      backgroundColor: "#1565C0",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(21, 101, 192, 0.4)",
    },
  },
  // Responsive layout changes
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column", // Vertical layout for medium and smaller screens
  },
  [theme.breakpoints.down("md")]: {
    margin: theme.spacing(1, 0),
  },
}));

// Enhanced Price Chip for dark theme
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
  boxShadow: "0 2px 8px rgba(25, 118, 210, 0.4)",
  "&:hover": {
    backgroundColor: "#1565C0",
  },
}));

// Styled Image Container with responsive sizing
const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  width: "300px", // Fixed width for large screens
  minWidth: "300px",
  height: "100%",
  minHeight: "250px",
  "& .service-image": {
    transition: "transform 0.4s ease",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  // Responsive adjustments
  [theme.breakpoints.down("lg")]: {
    width: "100%",
    height: "220px",
    minWidth: "unset",
    minHeight: "220px",
  },
}));

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
        sx={{ backgroundColor: "#0f0f0f" }}
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
            fontSize: { xs: "1.1rem", md: "1.25rem" },
            color: "#ef4444"
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
    <Box sx={{ backgroundColor: "#0f0f0f", minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Typography
            variant="h3"
            sx={{
              background: "linear-gradient(135deg, #60A5FA 0%, #1976D2 100%)",
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
              color: "#B0BEC5",
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

        {/* Services Grid - Fluid Layout */}
        <Box sx={{ width: "100%" }}>
          {services.map((service) => (
            <Box
              key={service.id}
              sx={{ 
                width: "100%",
                mb: { xs: 2, md: 3 },
                px: 0
              }}
            >
              <ServiceCard>
                <ImageContainer>
                  <CardMedia
                    component="img"
                    className="service-image"
                    image={service.image || "/api/placeholder/400/250"}
                    alt={capitalizeWords(service.category)}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
                    p: { xs: 3, md: 4 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative"
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "700",
                        color: "#ffffff",
                        mb: 2,
                        fontSize: { xs: "1.5rem", md: "2rem", lg: "2.2rem" },
                        letterSpacing: "-0.01em",
                        lineHeight: 1.2,
                      }}
                    >
                      {capitalizeWords(service.category)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#B0BEC5",
                        mb: 4,
                        fontSize: { xs: "1rem", md: "1.1rem", lg: "1.2rem" },
                        lineHeight: 1.6,
                        fontWeight: "400",
                        maxWidth: { lg: "70%" }
                      }}
                    >
                      {service.description || "Professional service tailored to your needs with exceptional quality and attention to detail."}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
                    <StyledButton
                      className="service-button"
                      onClick={() => handleFillEventDetails(service.id)}
                      sx={{
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        px: { xs: 3, md: 4 },
                        py: { xs: 1.5, md: 2 }
                      }}
                    >
                      Fill Event Details
                    </StyledButton>
                  </Box>
                </CardContent>
              </ServiceCard>
            </Box>
          ))}
        </Box>

        {/* Empty State */}
        {services.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography
              variant="h5"
              sx={{
                color: "#B0BEC5",
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