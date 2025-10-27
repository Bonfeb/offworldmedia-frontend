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
import { Typography } from "@mui/material";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import ContactUs from "./ContactUs";
import MediaGallery from "./MediaGallery";
import Service from "./Service";
import Reviews from "./AllReviews";

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

  const sharedProps = {
    navigate,
    isAuthenticated,
  };

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
        <Container fluid className="service-tabs-container">
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
                          {/*<div className="subcategory-header mb-4">
                            <h3 className="subcategory-title">
                              {formatSubcategoryName(subcategory)}
                            </h3>
                          </div>*/}

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
                                                backgroundColor: "#7f8806ff",
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
                                              {formatCategoryName(category)}
                                            </Card.Title>

                                            <Card.Text
                                              className="service-card-description mb-4 flex-grow-1"
                                              style={{
                                                color: "rgba(247, 243, 243, 1)",
                                                fontSize: "1rem",
                                                lineHeight: "1.6",
                                              }}
                                            >
                                              {service.description}
                                            </Card.Text>

                                            <div className="d-flex justify-content-end align-items-end">
                                              {/*<Button
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
                                              </Button>*/}
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
        </Container>
      </>
    );
  };

  return (
    <Container fluid className="main-container">
      {/* Main Container for Side-by-Side Layout */}
      <Container fluid className="p-0" style={{ backgroundColor: "#252d35ff" }}>
        <Row className="g-0 align-items-stretch" style={{ minHeight: "60vh" }}>
          {/* Hero Section - Left Side */}
          <div
            className="hero-section w-100 d-flex align-items-center justify-content-center"
            id="home"
            style={{
              backgroundImage: 'url("/OWM Icon.ico")',
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              minHeight: "60vh",
              width: "100%",
            }}
          >
            <div
              className="text-center text-white p-3"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="hero-title fw-bold mb-3">Offworld Media</h1>
                <p className="hero-subtitle mb-4 fs-5">
                  Professional media production services tailored to your needs.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Button
                      onClick={() => navigate("/services")}
                      className="px-4 py-2 rounded-pill fw-semibold"
                      style={{
                        backgroundColor: "#424242",
                        border: "none",
                        fontSize: "0.9rem",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#616161";
                        e.target.style.transform = "translateY(-3px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#424242";
                        e.target.style.transform = "translateY(0)";
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
                      className="px-4 py-2 rounded-pill fw-semibold"
                      style={{
                        backgroundColor: "#424242",
                        border: "none",
                        fontSize: "0.9rem",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#616161";
                        e.target.style.transform = "translateY(-3px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#424242";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      Contact Us
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </Row>
      </Container>

      {/* Studio Work Showcase */}
      <Container fluid className="bg-dark text-white py-5 px-4 px-lg-5">
        <div
          className="mx-auto mb-4"
          style={{
            width: "50%",
            height: "2px",
            backgroundColor: "#45463bff",
          }}
        ></div>
        <Row>
          {/* Image Carousel */}
          <Col
            xl={6}
            lg={6}
            md={12}
            sm={12}
            xs={12}
            className="mt-2 mb-5 mb-lg-0"
          >
            <div className="rounded overflow-hidden shadow">
              <Carousel fade indicators>
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <Carousel.Item key={image.id || index}>
                      <img
                        className="d-block w-100"
                        src={image.image || image.url}
                        alt={`Slide ${index + 1}`}
                        style={{ height: "400px", objectFit: "cover" }}
                      />
                    </Carousel.Item>
                  ))
                ) : (
                  <Carousel.Item>
                    <div
                      className="d-flex align-items-center justify-content-center bg-secondary"
                      style={{ height: "400px" }}
                    >
                      <p className="text-center m-0">
                        No carousel images available.
                      </p>
                    </div>
                  </Carousel.Item>
                )}
              </Carousel>
            </div>
          </Col>

          {/* Video Carousel */}
          <Col xl={6} lg={6} md={12} sm={12} xs={12}>
            <div className="rounded overflow-hidden shadow">
              {videos.length > 0 ? (
                <>
                  <div style={{ height: "340px" }}>
                    <video
                      className="w-100 h-100"
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
                  <div className="bg-secondary p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Button onClick={goToPrevVideo} size="sm" variant="dark">
                        ← Prev
                      </Button>

                      <div className="d-flex gap-1">
                        {videos.map((_, index) => (
                          <div
                            key={index}
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor:
                                index === activeVideoIndex ? "#424242" : "#ccc",
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

                      <Button onClick={goToNextVideo} size="sm" variant="dark">
                        Next →
                      </Button>
                    </div>

                    <small>
                      {videos[activeVideoIndex]?.uploaded_at
                        ? new Date(
                            videos[activeVideoIndex]?.uploaded_at
                          ).toLocaleDateString()
                        : "Date Not Available"}
                    </small>
                  </div>
                </>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-secondary"
                  style={{ height: "400px" }}
                >
                  <p className="text-center m-0">
                    No videos available at the moment.
                  </p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Services Section - Updated with Categories and Subcategories */}
      <Container fluid className="bg-dark text-white py-5">
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <Typography
              variant="h2"
              component="h2"
              className="section-title mb-3"
            >
              We Offer Awesome Services
            </Typography>
            <div
              className="mx-auto mb-4"
              style={{
                width: "50%",
                height: "2px",
                backgroundColor: "#45463bff",
              }}
            ></div>

            <Typography variant="subtitle1" className="section-subtitle">
              Our premium services are designed to meet all your creative needs,
              from photography to video production, ensuring high-quality
              results for your projects.
            </Typography>
            <div
              className="mx-auto mb-4"
              style={{
                width: "50%",
                height: "2px",
                backgroundColor: "#45463bff",
              }}
            ></div>
          </Col>
        </Row>
        {renderServicesSection()}
      </Container>

      {/* Who We Are Section */}
      <Container fluid className="bg-dark py-5">
        <Row>
          <Col
            xl={6}
            lg={6}
            md={12}
            sm={12}
            xs={12}
            className="d-flex align-items-center justify-content-center p-0"
            style={{ minHeight: "60vh" }}
          >
            {/* Payment Banner*/}
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
                <div
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    background:
                      "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
                    color: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 25px rgba(27, 94, 32, 0.3)",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 12px 30px rgba(46, 125, 50, 0.4)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(27, 94, 32, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "20px",
                      textAlign: "center",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "clamp(18px, 4vw, 22px)",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Lipa na Mpesa
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "25px" }}>
                    {/* Buy Goods & Services Fieldset */}
                    <fieldset
                      style={{
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "20px",
                        background: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <legend
                        style={{
                          padding: "0 10px",
                          fontSize: "clamp(14px, 3vw, 16px)",
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        Buy Goods & Services
                      </legend>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "clamp(15px, 3.5vw, 17px)",
                            fontWeight: "600",
                            marginBottom: "5px",
                          }}
                        >
                          Till Number:
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(18px, 4vw, 22px)",
                            fontWeight: "700",
                            letterSpacing: "1px",
                            marginBottom: "15px",
                          }}
                        >
                          4323716
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(14px, 3vw, 15px)",
                            fontWeight: "500",
                            opacity: "0.9",
                            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                            paddingTop: "10px",
                          }}
                        >
                          Transaction Name: <strong>Offworld Media</strong>
                        </div>
                      </div>
                    </fieldset>

                    {/* Paybill Fieldset */}
                    <fieldset
                      style={{
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "8px",
                        padding: "15px",
                        background: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <legend
                        style={{
                          padding: "0 10px",
                          fontSize: "clamp(14px, 3vw, 16px)",
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        Paybill
                      </legend>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "clamp(15px, 3.5vw, 17px)",
                            fontWeight: "600",
                            marginBottom: "8px",
                          }}
                        >
                          Business Number: 400200
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(15px, 3.5vw, 17px)",
                            fontWeight: "600",
                            marginBottom: "15px",
                          }}
                        >
                          A/C No: 1077483
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(14px, 3vw, 15px)",
                            fontWeight: "500",
                            opacity: "0.9",
                            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                            paddingTop: "10px",
                          }}
                        >
                          Transaction Name: <strong>Offworld Media</strong>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Mission & Vision */}
          <Col
            xl={6}
            lg={6}
            md={12}
            sm={12}
            xs={12}
            className="d-flex align-items-center justify-content-center p-4"
            style={{
              minHeight: "60vh",
              backgroundColor: "#444b53ff",
            }}
          >
            <div className="w-100">
              <h2 className="text-center fw-bold mb-4 text-dark">Who We Are</h2>
              <div
                className="mx-auto mb-4"
                style={{
                  width: "50%",
                  height: "2px",
                  backgroundColor: "#45463bff",
                }}
              ></div>
              <p className="text-center mb-5 text-white">
                Offworld Media is a business company specializing in
                photography, videography, music production, graphic designing
                and digital broadcasting.
              </p>

              <Row>
                <Col md={6} className="mb-4 mb-md-0">
                  <Card className="h-100 border-0 shadow-sm bg-dark text-white">
                    <Card.Body className="p-4">
                      <Card.Title className="fw-bold mb-3 border-bottom pb-2">
                        Vision
                      </Card.Title>
                      <Card.Text>
                        To be a transformative force in global media, revealing
                        the essence of life and capturing the heartbeat through
                        photography, film, music and digital broadcasting.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm bg-dark text-white">
                    <Card.Body className="p-4">
                      <Card.Title className="fw-bold mb-3 border-bottom pb-2">
                        Mission
                      </Card.Title>
                      <Card.Text>
                        To create powerful visuals and authentic sounds that
                        inspire, resonate and move both hearts and minds.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Continuos Scroll Imported Components */}
      <ContactUs {...sharedProps} />
      <Service {...sharedProps} />
      <Reviews {...sharedProps} />
    </Container>
  );
}

export default Home;
