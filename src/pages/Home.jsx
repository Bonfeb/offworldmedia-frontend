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
import { Paper, Typography, Box, Grid, Chip } from "@mui/material";
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

        if (!response.data) {
          throw new Error("No data received from server");
        }

        if (Array.isArray(response.data.services)) {
          setServices(response.data.services);
        } else {
          console.warn("Expected services array not found in response");
          setServices([]);
        }

        if (
          response.data.grouped_services &&
          typeof response.data.grouped_services === "object"
        ) {
          setGroupedServices(response.data.grouped_services);
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
        setServices([]);
        setGroupedServices({});
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const categories = Object.keys(groupedServices);
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [groupedServices, activeCategory]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await API.get("/videos/", {
          withCredentials: true,
        });

        if (!response.data) {
          throw new Error("No data received from server");
        }

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
        setVideos([]);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }

      videoTimerRef.current = setTimeout(() => {
        setActiveVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
      }, VIDEO_DISPLAY_DURATION);
    }
    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
    };
  }, [activeVideoIndex, videos.length]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await API.get("/images/", {
          withCredentials: true,
        });

        if (!response.data) {
          throw new Error("No data received from server");
        }

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
        setImages([]);
      }
    };

    fetchImages();
  }, []);

  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatSubcategoryName = (subcategory) => {
    if (!subcategory) return "";
    return subcategory
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const LoadingSpinner = () => (
    <div className="text-center py-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading services...</span>
      </Spinner>
      <p className="mt-3">Loading services...</p>
    </div>
  );

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

                          <Grid container spacing={3}>
                            {groupedServices[category][subcategory].map(
                              (service) => (
                                <Grid
                                  item
                                  xs={12}
                                  md={6}
                                  lg={4}
                                  key={service.id}
                                >
                                  <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Card className="service-card h-100 shadow-sm border-0">
                                      {service.image && (
                                        <Card.Img
                                          variant="top"
                                          src={service.image}
                                          alt={service.name}
                                          style={{
                                            height: "200px",
                                            objectFit: "cover",
                                          }}
                                        />
                                      )}
                                      <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <Card.Title className="service-card-title">
                                            {service.name}
                                          </Card.Title>
                                          <Chip
                                            label={`KSH ${service.price}`}
                                            color="primary"
                                            size="small"
                                          />
                                        </div>
                                        <Card.Text className="service-card-description flex-grow-1">
                                          {service.description}
                                        </Card.Text>
                                        <div className="mt-2">
                                          <small className="text-muted">
                                            Category:{" "}
                                            {formatCategoryName(
                                              service.category
                                            )}
                                          </small>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </motion.div>
                                </Grid>
                              )
                            )}
                          </Grid>
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
      {/* Hero Section */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 15% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 20%),
              radial-gradient(circle at 85% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 20%),
              linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.03) 50%, transparent 51%)
            `,
            backgroundSize: "100% 100%, 100% 100%, 30px 30px",
            zIndex: 0,
          },
        }}
        id="home"
      >
        <Container>
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                  marginBottom: "1rem",
                  background: "linear-gradient(45deg, #fff, #a8d8ea)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Offworld Media
              </Typography>
              <Typography
                variant="h5"
                component="p"
                gutterBottom
                sx={{
                  mb: { xs: 2, md: 4 },
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
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
                  gap: 2,
                  justifyContent: "center",
                  flexDirection: { xs: "column", sm: "row" },
                  marginTop: { xs: "2rem", md: "3rem" },
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
                      backgroundColor: "#4cc9f0",
                      color: "#1a1a2e",
                      border: "none",
                      padding: "12px 30px",
                      borderRadius: "30px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      width: { xs: "100%", sm: "auto" },
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#2a9d8f",
                        transform: "translateY(-3px)",
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
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
                    variant="outlined"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      padding: "12px 30px",
                      borderRadius: "30px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      width: { xs: "100%", sm: "auto" },
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "#4cc9f0",
                        color: "#4cc9f0",
                        transform: "translateY(-3px)",
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    Contact Us
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          backgroundColor: "#f8f9fa",
          position: "relative",
        }}
      >
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h3"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: "2rem",
                  }}
                >
                  Who We Are
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    marginBottom: "2rem",
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                    color: "#495057",
                  }}
                >
                  Offworld Media Africa is a business company specializing in
                  photography, videography, music production, graphic designing
                  and digital broadcasting.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    label="Photography"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Videography"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Music Production"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Graphic Design"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Digital Broadcasting"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        padding: 3,
                        height: "100%",
                        background:
                          "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                        color: "white",
                        borderRadius: "12px",
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box component="span" sx={{ color: "#4cc9f0" }}>
                          Vision
                        </Box>
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        To be a transformative force in global media, revealing
                        the essence of life and capturing the heartbeat through
                        photography, film, music and digital broadcasting.
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        padding: 3,
                        height: "100%",
                        background:
                          "linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)",
                        color: "white",
                        borderRadius: "12px",
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#4cc9f0",
                        }}
                      >
                        Mission
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        To create powerful visuals and authentic sounds that
                        inspire, resonate and move both hearts and minds.
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: "white" }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#1a1a2e",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Our Services
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                maxWidth: "700px",
                margin: "0 auto 3rem",
                fontSize: "1.1rem",
                color: "#495057",
              }}
            >
              Explore our comprehensive range of professional media services
              designed to meet all your creative needs.
            </Typography>
          </motion.div>

          {renderServicesSection()}
        </Container>
      </Box>

      {/* Gallery Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          backgroundColor: "#f8f9fa",
        }}
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#1a1a2e",
                textAlign: "center",
                marginBottom: "3rem",
              }}
            >
              Our Portfolio
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "#1a1a2e", mb: 2 }}
                >
                  Photo Gallery
                </Typography>
                <Box
                  sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "white",
                  }}
                >
                  <Carousel fade indicators={true}>
                    {images.length > 0 ? (
                      images.map((image, index) => (
                        <Carousel.Item key={image.id || index}>
                          <img
                            className="d-block w-100"
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
                        <Box
                          sx={{
                            height: "400px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#e9ecef",
                          }}
                        >
                          <Typography variant="h6" sx={{ textAlign: "center" }}>
                            No images available.
                          </Typography>
                        </Box>
                      </Carousel.Item>
                    )}
                  </Carousel>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "#1a1a2e", mb: 2 }}
                >
                  Video Showcase
                </Typography>
                <Box
                  sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "white",
                  }}
                >
                  {videos.length > 0 ? (
                    <>
                      <Box sx={{ position: "relative" }}>
                        <video
                          className="w-100"
                          controls
                          style={{
                            height: "400px",
                            objectFit: "cover",
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

                      <Box
                        sx={{
                          padding: "1rem",
                          backgroundColor: "#f8f9fa",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Button
                            onClick={goToPrevVideo}
                            size="small"
                            sx={{
                              backgroundColor: "#1a1a2e",
                              color: "white",
                              minWidth: "auto",
                              "&:hover": {
                                backgroundColor: "#0f3460",
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
                                    index === activeVideoIndex
                                      ? "#1a1a2e"
                                      : "#ccc",
                                  cursor: "pointer",
                                  transition: "background-color 0.3s ease",
                                  "&:hover": {
                                    backgroundColor:
                                      index === activeVideoIndex
                                        ? "#0f3460"
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
                            size="small"
                            sx={{
                              backgroundColor: "#1a1a2e",
                              color: "white",
                              minWidth: "auto",
                              "&:hover": {
                                backgroundColor: "#0f3460",
                              },
                            }}
                          >
                            Next →
                          </Button>
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6c757d",
                          }}
                        >
                          {activeVideoIndex + 1} of {videos.length}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        height: "400px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#e9ecef",
                      }}
                    >
                      <Typography variant="h6" sx={{ textAlign: "center" }}>
                        No videos available.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Payment Banner */}
      <Box sx={{ py: 4, backgroundColor: "white" }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: 3,
                background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                color: "white",
                borderRadius: "12px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
                    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 20%)
                  `,
                },
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                gutterBottom
                sx={{ fontWeight: 600, position: "relative" }}
              >
                Buy Goods & Services
              </Typography>
              <Typography
                variant="h4"
                component="p"
                sx={{ fontWeight: 700, position: "relative" }}
              >
                Till Number: 4323716
              </Typography>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </div>
  );
}

export default Home;
