import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
import { AuthContext } from "../context/AuthContext";
import Footer from "../components/Footer";
import { media_url } from "../utils/constants";

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [authAlert, setAuthAlert] = useState(false);

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
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center my-5">
        {error}
      </Alert>
    );
  }

  if (services.length === 0) {
    return <p className="text-center my-5">No services available.</p>;
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
            <h1>Relate to Our Creative Designs Beyond Expectations</h1>
            <p className="hero-subtitle">
              Leading digital agency with solid design and development expertise.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* About Section */}
      <section className="about-section">
        <Container>
          <Row className="justify-content-center">
            <Col xl={8} lg={10} className="text-center">
              <h2>About Us</h2>
              <div className="section-divider"></div>
              <p className="about-text">
                We are a leading digital agency with expertise in design and
                development. Our team builds readymade websites, mobile
                applications, and online business solutions.
              </p>
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
              <Carousel controls indicators>
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
            </Col>

            {/* Right Column - Embedded YouTube Videos */}
            <Col lg={6} className="video-container">
              <div className="video-wrapper mb-3">
                <iframe
                  src="https://www.youtube.com/embed/rZTh1m9SDGM"
                  title="Gonda - Kidutani"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-wrapper">
                <iframe
                  src="https://www.youtube.com/embed/lEO9Tp2EMm4"
                  title="Bechi x Nizo Nanga x Baclint - Telephone"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <Container>
          <div className="section-header text-center">
            <h2>
              We Offer Awesome <span>Services</span>
            </h2>
            <div className="section-divider"></div>
            <p className="section-description">
              Ut possimus qui ut temporibus culpa velit eveniet modi omnis est
              adipisci expedita at voluptas atque vitae autem.
            </p>
          </div>

          {showAlert && (
            <Alert variant="success" className="text-center" dismissible>
              Service added to cart. Go to your dashboard to view and/or book it!
            </Alert>
          )}

          {authAlert && (
            <Alert variant="danger" className="text-center" dismissible>
              You must be logged in to add services to the cart.
            </Alert>
          )}

          <Row className="services-row">
            {services.map((service) => (
              <Col
                key={service.id}
                xl={3}
                lg={4}
                md={6}
                sm={6}
                className="mb-4"
              >
                <motion.div 
                  className="service-card"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
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
                      Fill Event Details to Book
                    </Button>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </Container>
  );
}

export default Home;