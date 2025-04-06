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
        console.log("Fetching services...");
        console.log("Using baseURL:", import.meta.env.VITE_BASE_URL);
        const response = await API.get("/services/", {
          withCredentials: true,
        });
       
        console.log("API Response:", response.data);
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

    // Redirect to FillEventDetails page
    navigate(`/event-details/${serviceId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading services...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  // No services available
  if (services.length === 0) {
    return <p className="text-center">No services available.</p>;
  }

  // Render services
  return (
    <Container fluid className="p-0">
      {/* Part 1: Hero Section */}

      <Container fluid className="hero-section py-5">
        <h1>Relate to Our Creative Designs Beyond Expectations</h1>
        <p>
          Leading digital agency with solid design and development expertise.
        </p>
      </Container>

      {/* Part 2: About Section */}

      <Container fluid className="about-section py-5">
        <Row className="text-center">
          <h2>About Us</h2>
          <hr style={{ color: "red" }} />
          <p>
            We are a leading digital agency with expertise in design and
            development. Our team builds readymade websites, mobile
            applications, and online business solutions.
          </p>
        </Row>
      </Container>

      {/* Part 3: Studio Work Showcase */}
      <section className="showcase-section py-5">
        <Container>
          <Row>
            {/* Left Column - Image Carousel */}
            <Col md={6}>
              <Carousel>
                {carouselImages.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100 rounded"
                      src={image}
                      alt={`Studio Image ${index + 1}`}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>

            {/* Right Column - Embedded YouTube Videos */}
            <Col md={6} className="d-flex flex-column gap-3">
              <iframe
                width="895"
                height="503"
                src="https://www.youtube.com/embed/rZTh1m9SDGM"
                title="Gonda - Kidutani"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
              <iframe
                width="895"
                height="503"
                src="https://www.youtube.com/embed/lEO9Tp2EMm4"
                title="Bechi x Nizo Nanga x Baclint - Telephone (Official Dance Video)"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Part 4: Services Offered */}

      <Container fluid className="services text-center py-4">
        <h2 style={{ color: "#75aadb" }}>
          We Offer Awesome{" "}
          <span style={{ color: "#d12d33" }}>
            <strong>Services</strong>
          </span>
        </h2>
        <hr />
        <p className="d-inline-block" style={{ width: "50%" }}>
          <strong>
            Ut possimus qui ut temporibus culpa velit eveniet modi omnis est
            adipisci expedita at voluptas atque vitae autem.
          </strong>
        </p>

        {showAlert && (
          <Alert variant="success" className="text-center">
            Service added to cart. Go to your dashboard to view and/or book it!
          </Alert>
        )}

        {authAlert && (
          <Alert variant="danger" className="text-center">
            You must be logged in to add services to the cart.{" "}
          </Alert>
        )}

        <Row className="justify-content-center mt-4">
          {services.map((service) => (
            <Col
              xs={12}
              md={6}
              lg={3}
              className="d-flex align-items-stretch mb-4"
              key={service.id}
            >
              <div className="text-center icon-box p-4 shadow-lg">
                <div className="position-absolute top-0 end-0 bg-warning text-white px-3 py-1 rounded-end">
                  KSH {service.price}
                </div>
                <div className="icon mb-3">
                  <Image
                    src={`https://offworldmedia-backend.onrender.com${service.image}`}
                    className="rounded-circle"
                    style={{ width: "220px", height: "200px" }}
                  />
                </div>
                <hr />
                <h4 className="title">{service.name}</h4>
                <hr />
                <p className="description">{service.description}</p>
                <Button
                  className="w-100 mt-2 bg-primary"
                  onClick={() => handleFillEventDetails(service.id)}
                >
                  Fill Event Details to Book
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
}

export default Home;
