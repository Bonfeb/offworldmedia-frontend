import React, { useState, useEffect, useContext } from "react";
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
import { Paper, Typography, Box, Chip, Divider } from "@mui/material";
import API from "../api";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [groupedServices, setGroupedServices] = useState({});
  const [activeCategory, setActiveCategory] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [authAlert, setAuthAlert] = useState(false);
  const [videos, setvideos] = useState([]);

  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const CHANNEL_ID = import.meta.env.VITE_YOUR_CHANNEL_ID;
  const MAX_RESULTS = 3;

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
        
        // Check if services data exists in the response
        if (!response.data || (!response.data.services && !Array.isArray(response.data))) {
          throw new Error("Invalid response format");
        }
        
        // Extract services array depending on response format
        const servicesData = response.data.services || response.data;
        
        // Process grouped services if present
        if (typeof servicesData === 'object' && servicesData.grouped_services) {
          // Admin/staff response format
          setGroupedServices(servicesData.grouped_services);
          
          // Flatten services for components that need the full list
          const allServices = [];
          Object.keys(servicesData.grouped_services).forEach(category => {
            Object.keys(servicesData.grouped_services[category]).forEach(subcategory => {
              allServices.push(...servicesData.grouped_services[category][subcategory]);
            });
          });
          setServices(allServices);
        } else if (Array.isArray(servicesData)) {
          // Regular user format - array of services
          setServices(servicesData);
          
          // Group services by category and subcategory
          const grouped = {};
          servicesData.forEach(service => {
            if (!grouped[service.category]) {
              grouped[service.category] = {};
            }
            if (!grouped[service.category][service.subcategory]) {
              grouped[service.category][service.subcategory] = [];
            }
            grouped[service.category][service.subcategory].push(service);
          });
          
          setGroupedServices(grouped);
        } else {
          throw new Error("Invalid services data format");
        }
        
        // Set the first category as active if available
        const categories = Object.keys(groupedServices);
        if (categories.length > 0) {
          setActiveCategory(categories[0]);
        }
        
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Failed to load services.");
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
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.data || !response.data.items) {
          throw new Error('Invalid response format from YouTube API');
        }
        
        setvideos(response.data.items);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.error("YouTube API request timed out");
        } else if (error.response) {
          const status = error.response.status;
          console.error(`YouTube API error (${status}): ${error.response.data?.error?.message || 'Unknown error'}`);
        } else if (error.request) {
          console.error("Network error when fetching YouTube videos");
        } else {
          console.error("Error fetching YouTube videos:", error.message);
        }
      }
    };
    
    fetchVideos();
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
    return subcategory
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", background: "#f5f9ff" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3" style={{ color: "#1a73e8", fontWeight: 500 }}>
            Loading amazing services for you...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="text-center my-5">
          <i className="fa fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  if (services.length === 0) {
    return (
      <Container>
        <div className="text-center my-5 py-5">
          <img
            src="/no-data.svg"
            alt="No services"
            style={{ width: "150px", marginBottom: "20px" }}
          />
          <p style={{ color: "#344955", fontSize: "1.2rem" }}>
            No services available at the moment.
          </p>
          <Button
            variant="outline-primary"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0 m-0 home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Welcome to OffWorld Media Africa</h1>
            <p className="hero-subtitle">
              We offer top-notch services in video production, photography, and
              audio production.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                variant="light"
                size="lg"
                className="mt-4 me-2"
                style={{ borderRadius: "30px", padding: "0.5rem 2rem" }}
                onClick={() => navigate("/services")}
              >
                Explore Services
              </Button>
              <Button
                variant="outline-light"
                size="lg"
                className="mt-4"
                style={{ borderRadius: "30px", padding: "0.5rem 2rem" }}
                onClick={() => navigate("/contactus")}
              >
                Contact Us
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* About Section */}
      <section className="about-section">
        <Container>
          <Row className="justify-content-center">
            <Col xl={8} lg={10} className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2>About Us</h2>
                <div className="section-divider"></div>
                <p className="about-text">
                  Offworld Media Africa is a business company specializing in
                  photography, videography, music production, graphic designing
                  and digital broadcasting.
                </p>
                <Row className="g-4">
                  <Col xl={6} md={12} sm={12} lg={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Card
                        className="border-0 h-100"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <Card.Header
                          className="text-center border-bottom-0 pt-4"
                          style={{ backgroundColor: "transparent" }}
                        >
                          <Typography
                            variant="h4"
                            component="h2"
                            fontWeight="medium"
                            color="primary"
                          >
                            Vision
                          </Typography>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center">
                          <Typography
                            variant="body1"
                            component="p"
                            className="text-center px-4 pb-3"
                          >
                            To be a transformative force in global media,
                            revealing the essence of life and capturing the
                            heartbeat through photography, film, music and
                            digital broadcasting.
                          </Typography>
                        </Card.Body>
                      </Card>
                    </Paper>
                  </Col>

                  <Col xl={6} md={12} sm={12} lg={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Card
                        className="border-0 h-100"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <Card.Header
                          className="text-center border-bottom-0 pt-4"
                          style={{ backgroundColor: "transparent" }}
                        >
                          <Typography
                            variant="h4"
                            component="h2"
                            fontWeight="medium"
                            color="secondary"
                          >
                            Mission
                          </Typography>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center">
                          <Typography
                            variant="body1"
                            component="p"
                            className="text-center px-4 pb-3"
                          >
                            To create powerful visuals and authentic sounds that
                            inspire, resonate and move both hearts and minds.
                          </Typography>
                        </Card.Body>
                      </Card>
                    </Paper>
                  </Col>
                </Row>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Studio Work Showcase */}
      <section className="showcase-section">
        <Container>
          <Row className="align-items-center">
            {/* Left Column - Image Carousel */}
            <Col lg={6} className="mb-4 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Carousel controls indicators interval={3000} pause="hover">
                  {carouselImages.map((image, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100 rounded showcase-image"
                        src={image}
                        alt={`Studio Image ${index + 1}`}
                        loading="lazy"
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              </motion.div>
            </Col>

            {/* Right Column - Embedded YouTube Videos */}
            <Col lg={6} className="video-container">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="video-wrapper mb-3">
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <div key={video.id.videoId} className="mb-3">
                        <iframe
                          width="100%"
                          height="250"
                          src={`https://www.youtube.com/embed/${video.id.videoId}`}
                          title={video.snippet.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5">
                      <p>No videos available at the moment.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section - Updated with Categories and Subcategories */}
      <section className="services-section py-5">
        <Container>
          <motion.div
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>
              We Offer Awesome <span>Services</span>
            </h2>
            <div className="section-divider"></div>
            <p className="section-description">
              Our premium services are designed to meet all your creative needs,
              from photography to video production, ensuring high-quality
              results for your projects.
            </p>
          </motion.div>

          {showAlert && (
            <Alert
              variant="success"
              className="text-center"
              dismissible
              onClose={() => setShowAlert(false)}
            >
              Service added to cart. Go to your dashboard to view and/or book
              it!
            </Alert>
          )}

          {authAlert && (
            <Alert
              variant="danger"
              className="text-center"
              dismissible
              onClose={() => setAuthAlert(false)}
            >
              You must be logged in to add services to the cart.
            </Alert>
          )}

          {/* Category Tabs */}
          <div className="category-tabs mb-4">
            {Object.keys(groupedServices).length > 0 ? (
              <Tab.Container 
                id="service-categories" 
                activeKey={activeCategory}
                onSelect={(k) => setActiveCategory(k)}
              >
                <Row>
                  <Col sm={12}>
                    <Nav variant="tabs" className="service-category-nav">
                      {Object.keys(groupedServices).map((category) => (
                        <Nav.Item key={category}>
                          <Nav.Link eventKey={category}>
                            {formatCategoryName(category)}
                          </Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>
                  </Col>
                  <Col sm={12}>
                    <Tab.Content>
                      {Object.keys(groupedServices).map((category) => (
                        <Tab.Pane key={category} eventKey={category}>
                          {/* Subcategory sections */}
                          {Object.keys(groupedServices[category]).map((subcategory) => (
                            <div key={subcategory} className="subcategory-section my-4">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 3,
                                }}
                              >
                                <Typography variant="h5" component="h3">
                                  {formatSubcategoryName(subcategory)}
                                </Typography>
                                <Divider sx={{ flexGrow: 1, ml: 2 }} />
                              </Box>
                              
                              <Row className="services-row">
                                {groupedServices[category][subcategory].map((service, index) => (
                                  <Col
                                    key={service.id}
                                    xl={4}
                                    lg={4}
                                    md={4}
                                    sm={12}
                                    className="mb-4"
                                  >
                                    <motion.div
                                      className="service-card"
                                      initial={{ opacity: 0, y: 20 }}
                                      whileInView={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: index * 0.1 }}
                                      viewport={{ once: true }}
                                      whileHover={{ y: -5 }}
                                    >
                                      <div className="price-badge">KSH {service.price}</div>
                                      <div className="service-image-container">
                                        <Image
                                          src={service.image}
                                          className="service-image"
                                          alt={service.name}
                                          loading="lazy"
                                        />
                                      </div>
                                      <div className="service-content">
                                        <h3 className="service-title">{service.name}</h3>
                                        <p className="service-description">{service.description}</p>
                                        <Chip 
                                          label={formatSubcategoryName(service.subcategory)}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                          className="mb-3"
                                        />
                                        <Button
                                          variant="primary"
                                          className="service-button"
                                          onClick={() => handleFillEventDetails(service.id)}
                                        >
                                          Book Now
                                        </Button>
                                      </div>
                                    </motion.div>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          ))}
                        </Tab.Pane>
                      ))}
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            ) : (
              <div className="text-center py-4">
                <p>No service categories available.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-5">
            <Button
              className="rounded-pill px-4 py-2"
              variant="primary"
              size="lg"
              onClick={() => navigate("/services")}
              style={{ borderRadius: "30px", padding: "0.5rem 2rem" }}
            >
              View All Services
            </Button>
          </div>
        </Container>
      </section>
    </Container>
  );
}

export default Home;