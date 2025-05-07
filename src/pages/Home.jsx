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
  Image,
  Button,
  Card,
  Nav,
  Tab,
} from "react-bootstrap";
import { Paper, Typography, Box, Chip } from "@mui/material";
import API from "../api";
import axios from "axios";
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
  const [videos, setVideos] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Timer ref for video carousel
  const videoTimerRef = useRef(null);

  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const CHANNEL_ID = import.meta.env.VITE_YOUR_CHANNEL_ID;
  const MAX_RESULTS = 3;
  const VIDEO_DISPLAY_DURATION = 120000; // 2 minutes in milliseconds

  const imageContext = import.meta.glob("../assets/images/*.jpg", {
    eager: true,
  });
  const carouselImages = Object.values(imageContext).map((img) => img.default);

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

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/search`,
          {
            params: {
              key: YOUTUBE_API_KEY,
              channelId: CHANNEL_ID,
              part: "snippet",
              maxResults: MAX_RESULTS,
              order: "date",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.data || !response.data.items) {
          throw new Error("Invalid response format from YouTube API");
        }

        setVideos(response.data.items);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.error("YouTube API request timed out");
        } else if (error.response) {
          const status = error.response.status;
          console.error(
            `YouTube API error (${status}): ${
              error.response.data?.error?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          console.error("Network error when fetching YouTube videos");
        } else {
          console.error("Error fetching YouTube videos:", error.message);
        }
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
                  className="service-category-tabs flex-nowrap overflow-auto"
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
                {Object.keys(groupedServices).length > 0 ? (
                  Object.keys(groupedServices).map((category) => (
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

                            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                              {groupedServices[category][subcategory].map(
                                (service) => (
                                  <Col key={service.id}>
                                    <motion.div
                                      whileHover={{ y: -10 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <Card className="service-card h-100 shadow-sm border-0">
                                        <div className="price-badge">
                                          KSH {service.price}
                                        </div>

                                        <Card.Body className="d-flex flex-column">
                                          <Card.Title className="service-card-title">
                                            {service.name}
                                          </Card.Title>

                                          <Card.Text className="service-card-description flex-grow-1">
                                            {service.description}
                                          </Card.Text>

                                          <Button
                                            className="mt-auto book-now-btn"
                                            onClick={() =>
                                              handleFillEventDetails(service.id)
                                            }
                                            style={{
                                              backgroundColor: "#007bff",
                                              color: "white",
                                              border: "none"
                                            }}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = "#28a745";
                                              e.currentTarget.style.color = "white";
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = "#007bff";
                                              e.currentTarget.style.color = "white";
                                            }}
                                          >
                                            Book Now
                                          </Button>
                                        </Card.Body>
                                      </Card>
                                    </motion.div>
                                  </Col>
                                )
                              )}
                            </Row>
                          </div>
                        )
                      )}
                    </Tab.Pane>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <Alert variant="info">
                      No service categories available at the moment.
                    </Alert>
                    {error ? (
                      <Button
                        variant="outline-primary"
                        onClick={() => window.location.reload()}
                        className="mt-2"
                      >
                        Retry
                      </Button>
                    ) : null}
                  </div>
                )}
              </Tab.Content>
            </Tab.Container>
          ) : (
            <div className="no-services-container text-center py-5">
              <Alert variant="info">
                No service categories available at the moment.
              </Alert>
              {error ? (
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Retry
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <Button
            onClick={() => navigate("/services")}
            style={{ 
              borderRadius: "30px", 
              padding: "0.5rem 2rem", 
              backgroundColor: "#007bff", 
              color: "white",
              border: "none"
            }}
            className="view-all-button"
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#28a745";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#007bff";
              e.currentTarget.style.color = "white";
            }}
          >
            View All Services
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Box
          sx={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('/OWM Icon.ico')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            textAlign: "center",
          }}
          id="home"
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "4rem" } }}
              >
                Bringing African Stories to the World
              </Typography>
              <Typography
                variant="h5"
                component="p"
                gutterBottom
                sx={{ mb: 4, fontSize: { xs: "1.2rem", md: "1.5rem" } }}
              >
                Professional media production services across the African
                continent
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Button
                    onClick={() => navigate("/services")}
                    style={{ 
                      backgroundColor: "#007bff", 
                      color: "white",
                      border: "none",
                      padding: "10px 20px"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#28a745";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#007bff";
                      e.currentTarget.style.color = "white";
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
                    style={{ 
                      backgroundColor: "#007bff", 
                      color: "white",
                      border: "none",
                      padding: "10px 20px"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#28a745";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#007bff";
                      e.currentTarget.style.color = "white";
                    }}
                  >
                    Contact Us
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Container>
        </Box>
      </section>

      {/* About Section */}
      <section className="about-section py-5">
        <Container fluid>
          <Row className="justify-content-center">
            <Col lg={12} className="text-center">
              <Box
                component={Paper}
                elevation={0}
                className="about-content p-4 p-md-5"
              >
                <Typography
                  variant="h2"
                  component="h2"
                  className="section-title mb-4"
                >
                  Who We Are
                </Typography>

                <Typography variant="body1" className="mb-5">
                  Offworld Media Africa is a business company specializing in
                  photography, videography, music production, graphic designing
                  and digital broadcasting.
                </Typography>

                <Row className="vision-mission-container">
                  <Col md={6} className="mb-4 mb-md-0">
                    <Box
                      component={Paper}
                      elevation={3}
                      className="vision-box p-4 h-100"
                    >
                      <div className="mb-3">
                        <Typography
                          variant="h4"
                          component="h3"
                          className="box-title"
                        >
                          Vision
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body1">
                          To be a transformative force in global media,
                          revealing the essence of life and capturing the
                          heartbeat through photography, film, music and digital
                          broadcasting.
                        </Typography>
                      </div>
                    </Box>
                  </Col>

                  <Col md={6}>
                    <Box
                      component={Paper}
                      elevation={3}
                      className="mission-box p-4 h-100"
                    >
                      <div className="mb-3">
                        <Typography
                          variant="h4"
                          component="h3"
                          className="box-title"
                        >
                          Mission
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body1">
                          To create powerful visuals and authentic sounds that
                          inspire, resonate and move both hearts and minds.
                        </Typography>
                      </div>
                    </Box>
                  </Col>
                </Row>
              </Box>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Studio Work Showcase */}
      <section className="showcase-section py-5 bg-light">
        <Container fluid>
          <Row className="justify-content-center">
            <Col lg={12} className="text-center mb-5">
              <Typography
                variant="h2"
                component="h2"
                className="section-title mb-4"
                sx={{ fontWeight: 600 }}
              >
                Our Studio Work
              </Typography>
            </Col>
          </Row>
          <Row className="g-4 justify-content-center">
            {/* Left Column - Image Carousel */}
            <Col lg={6}>
              <div className="carousel-container shadow rounded overflow-hidden">
                <Carousel fade indicators={true} className="showcase-carousel">
                  {carouselImages.length > 0 ? (
                    carouselImages.map((image, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100 carousel-image"
                          src={image}
                          alt={`Slide ${index + 1}`}
                        />
                      </Carousel.Item>
                    ))
                  ) : (
                    <Carousel.Item>
                      <div
                        className="no-image-placeholder d-flex align-items-center justify-content-center bg-secondary text-white"
                        style={{ height: "400px" }}
                      >
                        <h3>No carousel images available.</h3>
                      </div>
                    </Carousel.Item>
                  )}
                </Carousel>
              </div>
            </Col>

            {/* Right Column - YouTube Video Carousel */}
            <Col lg={6}>
              <div className="videos-container">
                <div className="youtube-video-carousel position-relative shadow rounded overflow-hidden">
                  {videos.length > 0 ? (
                    <>
                      <div className="youtube-video-container">
                        <iframe
                          className="youtube-iframe"
                          width="100%"
                          height="350"
                          src={`https://www.youtube.com/embed/${videos[activeVideoIndex]?.id.videoId}?autoplay=1&mute=0`}
                          title={videos[activeVideoIndex]?.snippet.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>

                      {/* Video Navigation Controls */}
                      <div className="video-carousel-controls d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex align-items-center">
                          <Button
                            className="carousel-control-btn me-2"
                            onClick={goToPrevVideo}
                            style={{ 
                              backgroundColor: "#007bff", 
                              color: "white",
                              border: "none" 
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#28a745";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "#007bff";
                              e.currentTarget.style.color = "white";
                            }}
                          >
                            &lt; Prev
                          </Button>

                          <div className="video-indicators d-flex">
                            {videos.map((_, index) => (
                              <div
                                key={index}
                                className={`video-indicator mx-1 ${
                                  index === activeVideoIndex ? "active" : ""
                                }`}
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor:
                                    index === activeVideoIndex
                                      ? "#007bff"
                                      : "#ccc",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  if (videoTimerRef.current) {
                                    clearTimeout(videoTimerRef.current);
                                  }
                                  setActiveVideoIndex(index);
                                }}
                              />
                            ))}
                          </div>

                          <Button
                            className="carousel-control-btn ms-2"
                            onClick={goToNextVideo}
                            style={{ 
                              backgroundColor: "#007bff", 
                              color: "white",
                              border: "none" 
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#28a745";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "#007bff";
                              e.currentTarget.style.color = "white";
                            }}
                          >
                            Next &gt;
                          </Button>
                        </div>

                        <Typography variant="caption" className="video-title">
                          {videos[activeVideoIndex]?.snippet.title ||
                            "Video Title"}
                        </Typography>
                      </div>
                    </>
                  ) : (
                    <div className="no-videos-placeholder text-center p-5 bg-light rounded">
                      <h5>No videos available at the moment.</h5>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

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
            </Col>
          </Row>

          {renderServicesSection()}
        </Container>
      </section>
    </div>
  );
}

export default Home;