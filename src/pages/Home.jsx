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

        <div className="text-center mt-5">
          <Button
            onClick={() => navigate("/services")}
            variant="primary"
            style={{
              borderRadius: "30px",
              padding: "0.5rem 2rem",
              fontWeight: "500",
            }}
            className="view-all-button"
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
            minHeight: { xs: "50vh", sm: "60vh", md: "70vh" }, // Responsive height
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url("/OWM Icon.ico")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            textAlign: "center",
            padding: 0, // Responsive padding
            marginBottom: 0,
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
                className="hero-title"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" }, // More responsive sizes
                  marginBottom: { xs: "1rem", md: "1.5rem" },
                }}
              >
                Bringing African Stories to the World
              </Typography>
              <Typography
                variant="h5"
                component="p"
                gutterBottom
                className="hero-subtitle"
                sx={{
                  mb: { xs: 2, md: 4 },
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                Professional media production services across the African
                continent
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
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      width: { xs: "100%", sm: "auto" },
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
                      padding: "10px 20px",
                      width: { xs: "100%", sm: "auto" },
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
                  {images.length > 0 ? (
                    images.map((image, index) => (
                      <Carousel.Item key={image.id || index}>
                        <img
                          className="d-block w-100 carousel-image"
                          src={image.image || image.url}
                          alt={`Slide ${index + 1}`}
                          style={{
                            height: "400px",
                            objectFit: "cover",
                          }}
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

            {/* Right Column - Video Carousel */}
            <Col lg={6}>
              <div className="videos-container">
                <div className="youtube-video-carousel position-relative shadow rounded overflow-hidden">
                  {videos.length > 0 ? (
                    <>
                      <div className="youtube-video-container">
                        <video
                          className="w-100"
                          height="350"
                          controls
                          style={{ objectFit: "cover" }}
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
                              border: "none",
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
                              border: "none",
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
                          {videos[activeVideoIndex]?.uploaded_at
                            ? new Date(
                                videos[activeVideoIndex]?.uploaded_at
                              ).toLocaleDateString()
                            : "Uploaded Date Not Available"}
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
        <div className="divider-container" style={{ marginTop: "3rem" }}>
          <hr
            className="studio-work-divider"
            style={{
              width: "80%",
              margin: "0 auto",
              height: "4px",
              background:
                "linear-gradient(to right, var(--primary-blue), var(--antique-blue-light))",
              border: "none",
              opacity: 0.8,
            }}
          />
        </div>
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

              {/* Payment Banner in Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ marginTop: "3rem" }}
              >
                <div className="d-flex justify-content-center">
                  <a
                    href="#payment-info"
                    className="red-banner-tag-hero"
                    style={{
                      position: "relative",
                      display: "inline-block",
                      background:
                        "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                      color: "white",
                      textDecoration: "none",
                      padding: "20px 50px",
                      fontWeight: "bold",
                      textAlign: "center",
                      minWidth: "280px",
                      lineHeight: "1.4",
                      boxShadow: "0 4px 15px rgba(231, 76, 60, 0.3)",
                      transition: "all 0.3s ease",
                      borderRadius: "0", // flat edges
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #c0392b 0%, #a93226 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 6px 20px rgba(231, 76, 60, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 15px rgba(231, 76, 60, 0.3)";
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "5px",
                      }}
                    >
                      Buy Goods & Services
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      Till Number: 1234567
                    </span>

                    {/* Left folded edge */}
                    <span
                      style={{
                        position: "absolute",
                        left: "-20px",
                        top: "0",
                        bottom: "0",
                        width: "20px",
                        background: "#b53224",
                        transform: "skewY(-20deg)",
                        borderRadius: "3px 0 0 3px",
                      }}
                    />

                    {/* Right folded edge */}
                    <span
                      style={{
                        position: "absolute",
                        right: "-20px",
                        top: "0",
                        bottom: "0",
                        width: "20px",
                        background: "#b53224",
                        transform: "skewY(20deg)",
                        borderRadius: "0 3px 3px 0",
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
