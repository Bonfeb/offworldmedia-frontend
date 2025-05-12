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

// Styled Card for hover effect
const ServiceCard = styled(Card)(({ theme }) => ({
  position: "relative",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  backgroundColor: "#F5F8FA",
  borderRadius: "12px",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 8px 24px rgba(30, 58, 138, 0.2)",
  },
  [theme.breakpoints.down("sm")]: {
    margin: theme.spacing(1),
  },
}));

// Styled Chip for price
const PriceChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: "#4682B4",
  color: "#fff",
  fontWeight: "bold",
}));

function Service() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [authAlert, setAuthAlert] = useState(false);

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
      >
        <CircularProgress sx={{ color: "#1976D2" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container fluid sx={{ py: { xs: 4, md: 6 } }}>
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          sx={{
            color: "#1E3A8A",
            fontWeight: "bold",
            mb: 2,
            fontSize: { xs: "1.8rem", md: "2.5rem" },
          }}
        >
          Discover Our{" "}
          <Typography
            component="span"
            variant="h4"
            sx={{ color: "#1976D2", fontWeight: "bold" }}
          >
            Exceptional Services
          </Typography>
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#4682B4",
            maxWidth: "600px",
            mx: "auto",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
          }}
        >
          Explore our wide range of services designed to meet your needs with
          excellence and precision.
        </Typography>
      </Box>

      {showAlert && (
        <Alert variant="success" className="text-center mb-4">
          Service added to cart. Go to your dashboard to view and/or book it!
        </Alert>
      )}

      {authAlert && (
        <Alert variant="danger" className="text-center mb-4">
          You must be logged in to add services to the cart.
        </Alert>
      )}

      {/* Updated Grid with responsive columns */}
      <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
        {services.map((service) => (
          <Grid item xs={12} sm={12} md={12} lg={4} xl={4} key={service.id}>
            <ServiceCard
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={service.image}
                alt={service.name}
                sx={{
                  objectFit: "cover",
                  borderRadius: "12px 12px 0 0",
                }}
              />
              <PriceChip label={`KSH ${service.price}`} />
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#1E3A8A",
                    mb: 1,
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                  }}
                >
                  {service.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4682B4",
                    mb: 2,
                    fontSize: { xs: "0.85rem", md: "0.95rem" },
                  }}
                >
                  {service.description}
                </Typography>
                <Button
                  variant="primary"
                  className="w-100"
                  style={{
                    backgroundColor: "#1976D2",
                    borderColor: "#1976D2",
                    "&:hover": {
                      backgroundColor: "#1E3A8A",
                    },
                  }}
                  onClick={() => handleFillEventDetails(service.id)}
                >
                  Fill Event Details
                </Button>
              </CardContent>
            </ServiceCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Service;
