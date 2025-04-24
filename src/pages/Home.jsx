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
} from "react-bootstrap";
import API from "../api";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
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
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Failed to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
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
          }
        );
        setvideos(response.data.items);
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
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
            <h1>Welcom to OffWorld Media Africa</h1>
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
                  We are a leading digital agency with expertise in design and
                  development. Our team builds readymade websites, mobile
                  applications, and online business solutions. With a passion
                  for creativity and an eye for detail, we bring your vision to
                  life through cutting-edge technology and innovative design.
                </p>
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
                  {videos.map((video) => (
                    <iframe
                      key={video.id.videoId}
                      width="100%"
                      height="250"
                      src={`https://www.youtube.com/embed/${video.id.videoId}`}
                      title={video.snippet.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ))}
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section className="services-section">
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

          <Row className="services-row">
            {services.map((service, index) => (
              <Col
                key={service.id}
                xl={4}
                lg={4}
                md={6}
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

          <div className="text-center mt-5">
            <Button
              variant="outline-primary"
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
