import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Carousel,
  Row,
  Col,
  Container,
  Spinner,
  Alert,
  Button,
  Card,
  Nav,
  Tab,
} from "react-bootstrap";
import { Paper, Typography, Box, Grid } from "@mui/material";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [groupedServices, setGroupedServices] = useState({});
  const [activeCategory, setActiveCategory] = useState("");
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [authAlert, setAuthAlert] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Timer ref for video carousel
  const videoTimerRef = useRef(null);
  const VIDEO_DISPLAY_DURATION = 120000; // 2 minutes in milliseconds

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await API.get("/services/", {
          withCredentials: true,
        });

        // Check if response data exists
        if (!response.data) {
          throw new Error("No data received from server");
        }

        // Set services and groupedServices safely
        if (Array.isArray(response.data.services)) {
          setServices(response.data.services);
        } else {
          console.warn("Expected services array not found in response");
          setServices([]);
        }

        // Handle grouped_services safely
        if (
          response.data.grouped_services &&
          typeof response.data.grouped_services === "object"
        ) {
          setGroupedServices(response.data.grouped_services);

          // Set the first category as active if available
          const categories = Object.keys(response.data.grouped_services);
          if (categories.length > 0) {
            setActiveCategory(categories[0]);
          }
        } else {
          console.warn(
            "Expected grouped_services object not found in response"
          );
          setGroupedServices({});
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setError(
          `Failed to load services. ${error.message || "Unknown error"}`
        );

        // Set empty data to prevent UI errors
        setServices([]);
        setGroupedServices({});
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Set the active category when groupedServices changes
  useEffect(() => {
    const categories = Object.keys(groupedServices);
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [groupedServices, activeCategory]);

  // Fetch Videos from Backend
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await API.get("/videos/", {
          withCredentials: true,
        });

        if (!response.data) {
          throw new Error("No data received from server");
        }

        // Videos are already ordered by newest first from backend
        if (Array.isArray(response.data)) {
          setVideos(response.data);
        } else if (
          response.data.videos &&
          Array.isArray(response.data.videos)
        ) {
          setVideos(response.data.videos);
        } else {
          console.warn("Expected videos array not found in response");
          setVideos([]);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        // Set empty videos array to prevent UI errors
        setVideos([]);
      }
    };

    fetchVideos();
  }, []);

  // Video carousel timer effect
  useEffect(() => {
    if (videos.length > 0) {
      // Clear any existing timer
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }

      // Set a new timer
      videoTimerRef.current = setTimeout(() => {
        setActiveVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
      }, VIDEO_DISPLAY_DURATION);
    }
    // Cleanup timer on unmount or when activeVideoIndex changes
    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
    };
  }, [activeVideoIndex, videos.length]);

  //Fetch Images from Backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await API.get("/images/", {
          withCredentials: true,
        });

        if (!response.data) {
          throw new Error("No data received from server");
        }

        // Images are already ordered by newest first from backend
        if (Array.isArray(response.data)) {
          setImages(response.data);
        } else if (
          response.data.images &&
          Array.isArray(response.data.images)
        ) {
          setImages(response.data.images);
        } else {
          console.warn("Expected images array not found in response");
          setImages([]);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        // Set empty images array to prevent UI errors
        setImages([]);
      }
    };

    fetchImages();
  }, []);

  const handleFillEventDetails = (serviceId) => {
    if (!isAuthenticated) {
      setAuthAlert(true);
      setTimeout(() => setAuthAlert(false), 5000);
      navigate("/login");
      return;
    }
    navigate(`/event-details/${serviceId}`);
  };

  // Function to format category name for display
  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Function to format subcategory name for display
  const formatSubcategoryName = (subcategory) => {
    if (!subcategory) return "";
    return subcategory
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="text-center py-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading services...</span>
      </Spinner>
      <p className="mt-3">Loading services...</p>
    </div>
  );

  // Manual video navigation
  const goToPrevVideo = () => {
    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
    }
    setActiveVideoIndex(
      (prevIndex) => (prevIndex - 1 + videos.length) % videos.length
    );
  };

  const goToNextVideo = () => {
    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
    }
    setActiveVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  // Services section rendering function
  // Update the renderServicesSection function with this improved card layout
  const renderServicesSection = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    return (
      <>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {showAlert && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setShowAlert(false)}
          >
            Service added to cart. Go to your dashboard to view and/or book it!
          </Alert>
        )}

        {authAlert && (
          <Alert
            variant="warning"
            dismissible
            onClose={() => setAuthAlert(false)}
          >
            You must be logged in to add services to the cart.
          </Alert>
        )}

        {/* Category Tabs */}
        <div className="service-tabs-container">
          {Object.keys(groupedServices).length > 0 ? (
            <Tab.Container
              activeKey={activeCategory}
              onSelect={(k) => setActiveCategory(k)}
            >
              <div className="mb-4">
                <Nav
                  variant="pills"
                  className="service-category-tabs flex-nowrap overflow-auto w-100"
                  fill={true}
                >
                  {Object.keys(groupedServices).map((category) => (
                    <Nav.Item key={category}>
                      <Nav.Link eventKey={category} className="category-tab">
                        {formatCategoryName(category)}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>

              <Tab.Content>
                {Object.keys(groupedServices).map((category) => (
                  <Tab.Pane eventKey={category} key={category}>
                    {/* Subcategory sections */}
                    {Object.keys(groupedServices[category]).map(
                      (subcategory) => (
                        <div
                          key={subcategory}
                          className="subcategory-section mb-5"
                        >
                          <div className="subcategory-header mb-4">
                            <h3 className="subcategory-title">
                              {formatSubcategoryName(subcategory)}
                            </h3>
                          </div>

                          {/* Updated Grid Layout - Fluid full width cards */}
                          <div className="w-100">
                            {groupedServices[category][subcategory].map(
                              (service) => (
                                <div key={service.id} className="w-100 mb-4">
                                  <motion.div
                                    whileHover={{ y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-100"
                                  >
                                    <Card
                                      className="service-card shadow-sm border-0 w-100"
                                      style={{ minHeight: "200px" }}
                                    >
                                      <Row className="g-0 h-100 w-100 mx-0">
                                        {/* Card Image - Takes up part of the card on larger screens */}
                                        {service.image && (
                                          <Col
                                            xs={12}
                                            md={4}
                                            lg={3}
                                            xl={3}
                                            className="d-flex p-0"
                                          >
                                            <Card.Img
                                              src={service.image}
                                              alt={service.category}
                                              style={{
                                                height: "200px",
                                                width: "100%",
                                                objectFit: "cover",
                                                borderTopLeftRadius:
                                                  "calc(0.25rem - 1px)",
                                                borderBottomLeftRadius:
                                                  "calc(0.25rem - 1px)",
                                                borderTopRightRadius: "0",
                                                borderBottomRightRadius: "0",
                                              }}
                                              className="h-100 w-100"
                                            />
                                          </Col>
                                        )}

                                        {/* Card Content */}
                                        <Col
                                          xs={12}
                                          md={service.image ? 8 : 12}
                                          lg={service.image ? 9 : 12}
                                          xl={service.image ? 9 : 12}
                                          className="d-flex p-0"
                                        >
                                          <Card.Body className="d-flex flex-column w-100 p-4 position-relative">
                                            {/* Price Chip */}
                                            <div
                                              className="price-badge mb-3 position-absolute"
                                              style={{
                                                top: "15px",
                                                right: "15px",
                                                backgroundColor: "#007bff",
                                                color: "white",
                                                padding: "8px 16px",
                                                borderRadius: "20px",
                                                fontSize: "0.9rem",
                                                fontWeight: "600",
                                                zIndex: 10,
                                              }}
                                            >
                                              KSH {service.price}
                                            </div>

                                            <Card.Title
                                              className="service-card-title mb-3"
                                              style={{
                                                fontSize: "1.5rem",
                                                fontWeight: "600",
                                                color: "#1a1a1a",
                                                marginTop: "40px", // Space for price badge
                                                paddingRight: "120px", // Space for price badge
                                              }}
                                            >
                                              {service.name}
                                            </Card.Title>

                                            <Card.Text
                                              className="service-card-description mb-4 flex-grow-1"
                                              style={{
                                                color: "#666",
                                                fontSize: "1rem",
                                                lineHeight: "1.6",
                                              }}
                                            >
                                              {service.description}
                                            </Card.Text>

                                            <div className="d-flex justify-content-end align-items-end">
                                              <Button
                                                variant="primary"
                                                className="book-now-btn"
                                                onClick={() =>
                                                  handleFillEventDetails(
                                                    service.id
                                                  )
                                                }
                                                style={{
                                                  backgroundColor: "#007bff",
                                                  borderColor: "#007bff",
                                                  borderRadius: "30px",
                                                  padding: "12px 30px",
                                                  fontWeight: "500",
                                                  fontSize: "1rem",
                                                  transition: "all 0.3s ease",
                                                }}
                                                onMouseOver={(e) => {
                                                  e.currentTarget.style.backgroundColor =
                                                    "#0056b3";
                                                  e.currentTarget.style.borderColor =
                                                    "#0056b3";
                                                  e.currentTarget.style.transform =
                                                    "translateY(-2px)";
                                                }}
                                                onMouseOut={(e) => {
                                                  e.currentTarget.style.backgroundColor =
                                                    "#007bff";
                                                  e.currentTarget.style.borderColor =
                                                    "#007bff";
                                                  e.currentTarget.style.transform =
                                                    "translateY(0)";
                                                }}
                                              >
                                                Book Now
                                              </Button>
                                            </div>
                                          </Card.Body>
                                        </Col>
                                      </Row>
                                    </Card>
                                  </motion.div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Tab.Container>
          ) : (
            <div className="no-services-container text-center py-5">
              <Alert variant="info">
                No service categories available at the moment.
              </Alert>
              {error && (
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="home-page">
      {/* Main Container for Side-by-Side Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "column",
            md: "column",
            lg: "row",
          },
          minHeight: "100vh",
          height: "100vh",
        }}
      >
        {/* Hero Section */}
        <Box
          className="hero-section"
          sx={{
            flex: 1,
            height: { xs: "50vh", lg: "100%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url("/OWM Icon.ico")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            textAlign: "center",
            padding: { xs: "2rem 1rem", md: "3rem 2rem" },
            position: "relative",
            overflow: "hidden",
          }}
          id="home"
        >
          <Container
            maxWidth={false}
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                className="hero-title"
                sx={{
                  fontWeight: 700,
                  fontSize: {
                    xs: "2rem",
                    sm: "2.5rem",
                    md: "3.5rem",
                    lg: "2.8rem",
                  },
                  marginBottom: { xs: "1rem", md: "1.5rem" },
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                Offworld Media
              </Typography>
              <Typography
                variant="h5"
                component="p"
                gutterBottom
                className="hero-subtitle"
                sx={{
                  mb: { xs: 2, md: 4 },
                  fontSize: {
                    xs: "1rem",
                    sm: "1.2rem",
                    md: "1.5rem",
                    lg: "1.25rem",
                  },
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: 1.5,
                  opacity: 0.9,
                }}
              >
                Professional media production services tailored to your needs.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1, md: 2 },
                  justifyContent: "center",
                  flexDirection: { xs: "column", sm: "row" },
                  marginTop: { xs: "1rem", md: "2rem" },
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Button
                    onClick={() => navigate("/services")}
                    sx={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "30px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      width: { xs: "100%", sm: "auto" },
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#28a745",
                        transform: "translateY(-3px)",
                        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    Our Services
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Button
                    onClick={() => navigate("/contactus")}
                    sx={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "30px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      width: { xs: "100%", sm: "auto" },
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#28a745",
                        transform: "translateY(-3px)",
                        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    Contact Us
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* About Section */}
        <Box
          className="about-section"
          sx={{
            flex: 1,
            height: { xs: "50vh", lg: "100%" },
            background:
              "linear-gradient(135deg, var(--antique-blue-dark) 0%, var(--antique-blue) 100%)",
            display: "flex",
            alignItems: "center",
            color: "var(--text-on-dark)",
            position: "relative",
            padding: { xs: "2rem 1rem", md: "3rem 2rem" },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              background:
                "linear-gradient(to right, var(--primary-blue), var(--secondary-blue))",
              display: { lg: "none" },
            },
          }}
        >
          <Container
            maxWidth={false}
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component={Paper}
              elevation={0}
              sx={{
                background: "rgba(26, 49, 75, 0.7)",
                borderRadius: "15px",
                padding: { xs: "2rem", md: "2.5rem" },
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--text-on-dark)",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                overflow: "auto",
              }}
            >
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.8rem", sm: "2rem", md: "2.25rem" },
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  color: "var(--text-on-dark)",
                  textAlign: "center",
                }}
              >
                Who We Are
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  marginBottom: "2rem",
                  textAlign: "center",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.6,
                }}
              >
                Offworld Media Africa is a business company specializing in
                photography, videography, music production, graphic designing
                and digital broadcasting.
              </Typography>

              <Grid
                container
                spacing={3}
                sx={{ marginTop: "1rem", flexGrow: 1 }}
              >
                <Grid item xs={12} md={6}>
                  <Box
                    component={Paper}
                    elevation={3}
                    sx={{
                      background: "rgba(13, 71, 161, 0.5)",
                      borderRadius: "10px",
                      padding: "1.5rem",
                      height: "100%",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
                        background: "rgba(13, 71, 161, 0.7)",
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{
                        fontSize: { xs: "1.4rem", md: "1.8rem" },
                        fontWeight: 600,
                        color: "var(--text-on-dark)",
                        marginBottom: "1rem",
                        borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      Vision
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ lineHeight: 1.6, flexGrow: 1 }}
                    >
                      To be a transformative force in global media, revealing
                      the essence of life and capturing the heartbeat through
                      photography, film, music and digital broadcasting.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    component={Paper}
                    elevation={3}
                    sx={{
                      background: "rgba(13, 71, 161, 0.5)",
                      borderRadius: "10px",
                      padding: "1.5rem",
                      height: "100%",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
                        background: "rgba(13, 71, 161, 0.7)",
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{
                        fontSize: { xs: "1.4rem", md: "1.8rem" },
                        fontWeight: 600,
                        color: "var(--text-on-dark)",
                        marginBottom: "1rem",
                        borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      Mission
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ lineHeight: 1.6, flexGrow: 1 }}
                    >
                      To create powerful visuals and authentic sounds that
                      inspire, resonate and move both hearts and minds.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Studio Work Showcase */}
      <Box
        className="showcase-section"
        sx={{
          background:
            "linear-gradient(135deg, var(--dark-blue) 0%, var(--antique-blue) 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: 0,
          width: "100%",
        }}
      >
        {/* Section Title */}
        <Box
          sx={{
            padding: { xs: "2rem 1rem", md: "3rem 2rem" },
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.8rem", sm: "2rem", md: "2.5rem" },
              color: "var(--text-on-dark)",
              marginBottom: 0,
            }}
          >
            Offworld Media Gallery
          </Typography>
        </Box>

        {/* Main Content Container */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            width: "100%",
            minHeight: "calc(100vh - 150px)",
          }}
        >
          {/* Left Column - Image Carousel */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: { xs: "1rem", md: "2rem" },
              minHeight: { xs: "50vh", lg: "100%" },
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: { xs: "400px", md: "500px", lg: "600px" },
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Carousel
                fade
                indicators={true}
                className="showcase-carousel h-100"
              >
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <Carousel.Item key={image.id || index} className="h-100">
                      <img
                        className="d-block w-100 h-100"
                        src={image.image || image.url}
                        alt={`Slide ${index + 1}`}
                        style={{
                          objectFit: "cover",
                          filter: "brightness(1.1) contrast(1.1)",
                        }}
                      />
                    </Carousel.Item>
                  ))
                ) : (
                  <Carousel.Item className="h-100">
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "var(--text-on-dark)",
                      }}
                    >
                      <Typography variant="h4" sx={{ textAlign: "center" }}>
                        No carousel images available.
                      </Typography>
                    </Box>
                  </Carousel.Item>
                )}
              </Carousel>
            </Box>
          </Box>

          {/* Right Column - Video Carousel */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: { xs: "1rem", md: "2rem" },
              minHeight: { xs: "50vh", lg: "100%" },
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: { xs: "400px", md: "500px", lg: "600px" },
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {videos.length > 0 ? (
                <>
                  <Box sx={{ flex: 1, position: "relative" }}>
                    <video
                      className="w-100 h-100"
                      controls
                      style={{
                        objectFit: "cover",
                        filter: "brightness(1.1) contrast(1.1)",
                      }}
                      key={videos[activeVideoIndex]?.id}
                    >
                      <source
                        src={
                          videos[activeVideoIndex]?.video ||
                          videos[activeVideoIndex]?.url
                        }
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </Box>

                  {/* Video Navigation Controls */}
                  <Box
                    sx={{
                      padding: "1rem",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Button
                        onClick={goToPrevVideo}
                        sx={{
                          backgroundColor: "#007bff",
                          color: "white",
                          minWidth: "auto",
                          padding: "8px 16px",
                          fontSize: "0.8rem",
                          "&:hover": {
                            backgroundColor: "#28a745",
                          },
                        }}
                      >
                        ← Prev
                      </Button>

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {videos.map((_, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor:
                                index === activeVideoIndex ? "#007bff" : "#ccc",
                              cursor: "pointer",
                              transition: "background-color 0.3s ease",
                              "&:hover": {
                                backgroundColor:
                                  index === activeVideoIndex
                                    ? "#0056b3"
                                    : "#999",
                              },
                            }}
                            onClick={() => {
                              if (videoTimerRef.current) {
                                clearTimeout(videoTimerRef.current);
                              }
                              setActiveVideoIndex(index);
                            }}
                          />
                        ))}
                      </Box>

                      <Button
                        onClick={goToNextVideo}
                        sx={{
                          backgroundColor: "#007bff",
                          color: "white",
                          minWidth: "auto",
                          padding: "8px 16px",
                          fontSize: "0.8rem",
                          "&:hover": {
                            backgroundColor: "#28a745",
                          },
                        }}
                      >
                        Next →
                      </Button>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {videos[activeVideoIndex]?.uploaded_at
                        ? new Date(
                            videos[activeVideoIndex]?.uploaded_at
                          ).toLocaleDateString()
                        : "Date Not Available"}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "var(--text-on-dark)",
                  }}
                >
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    No videos available at the moment.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ padding: "2rem", textAlign: "center" }}>
          <Box
            sx={{
              width: "80%",
              margin: "0 auto",
              height: "4px",
              background:
                "linear-gradient(to right, var(--primary-blue), var(--antique-blue-light))",
              borderRadius: "2px",
              opacity: 0.8,
            }}
          />
        </Box>
      </Box>

      {/* Services Section - Updated with Categories and Subcategories */}
      <section className="services-section py-5">
        <Container fluid>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <Typography
                variant="h2"
                component="h2"
                className="section-title mb-3"
              >
                We Offer Awesome Services
              </Typography>

              <Typography variant="subtitle1" className="section-subtitle">
                Our premium services are designed to meet all your creative
                needs, from photography to video production, ensuring
                high-quality results for your projects.
              </Typography>

              {/* Payment Banner in Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ marginTop: "3rem", width: "100%" }}
              >
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "100%" }}
                >
                  <a
                    href="#payment-info"
                    style={{
                      position: "relative",
                      display: "block",
                      background: "#1B5E20", // Dark green background
                      color: "white",
                      textDecoration: "none",
                      padding: "20px",
                      fontWeight: "bold",
                      textAlign: "center",
                      width: "100%",
                      lineHeight: "1.4",
                      boxShadow: "0 4px 15px rgba(27, 94, 32, 0.3)",
                      transition: "all 0.3s ease",
                      borderRadius: "0",
                      boxSizing: "border-box",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#2E7D32"; // Lighter green on hover
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(46, 125, 50, 0.4)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      // Update folded edges
                      const edges =
                        e.currentTarget.querySelectorAll(".folded-edge");
                      edges.forEach((edge) => {
                        edge.style.background = "#1B5E20"; // Dark green edges on hover
                      });
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#1B5E20";
                      e.currentTarget.style.boxShadow =
                        "0 4px 15px rgba(27, 94, 32, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      // Revert folded edges
                      const edges =
                        e.currentTarget.querySelectorAll(".folded-edge");
                      edges.forEach((edge) => {
                        edge.style.background = "#2E7D32"; // Lighter green edges normally
                      });
                    }}
                  >
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: "clamp(14px, 3vw, 16px)",
                          fontWeight: "600",
                          marginBottom: "5px",
                        }}
                      >
                        Buy Goods & Services
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "clamp(16px, 3.5vw, 18px)",
                          fontWeight: "700",
                        }}
                      >
                        Till Number: 4323716
                      </span>
                    </div>

                    {/* Left folded edge */}
                    <span
                      className="folded-edge"
                      style={{
                        position: "absolute",
                        left: "-10px",
                        top: "0",
                        bottom: "0",
                        width: "20px",
                        background: "#2E7D32", // Lighter green edge
                        transform: "skewY(-20deg)",
                        borderRadius: "3px 0 0 3px",
                        transition: "background 0.3s ease",
                      }}
                    />

                    {/* Right folded edge */}
                    <span
                      className="folded-edge"
                      style={{
                        position: "absolute",
                        right: "-10px",
                        top: "0",
                        bottom: "0",
                        width: "20px",
                        background: "#2E7D32", // Lighter green edge
                        transform: "skewY(20deg)",
                        borderRadius: "0 3px 3px 0",
                        transition: "background 0.3s ease",
                      }}
                    />
                  </a>
                </div>
              </motion.div>
            </Col>
          </Row>

          {renderServicesSection()}
        </Container>
      </section>
    </div>
  );
}

export default Home;
