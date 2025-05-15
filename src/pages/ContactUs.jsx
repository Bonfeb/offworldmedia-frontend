import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

// Skeleton placeholder component
const LoadingSkeleton = ({ width = "100%" }) => (
  <div className="form-control placeholder-glow" style={{ width }}>
    <span className="placeholder col-6"></span>
  </div>
);

const ContactUs = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(false);
  const [profileFetching, setProfileFetching] = useState(true);
  const [user, setUser] = useState(null);
  const {isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          console.log("No access token found.");
          return;
        }

        const response = await API.get("/profile/", {
          withCredentials: true,
        });

        setUser(response.data);
        setFormData((prev) => ({
          ...prev,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
        }));
        setProfile(true);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        localStorage.removeItem("access_token");
      } finally {
        setProfileFetching(false);
      }
    };

    if (isAuthenticated) {
      checkAuth();
    } else {
      setProfileFetching(false);
    }
  }, [isAuthenticated, setUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        ...(isAuthenticated && user ? { user: user.id } : {}),
      };

      await API.post("/contact/", payload, {
        withCredentials: true,
      });

      setResponseMessage("Message sent successfully! We'll get back to you soon.");
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
        ...(isAuthenticated ? {} : { first_name: "", last_name: "", email: "" }),
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      setResponseMessage("Error sending message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="py-4 py-md-5"
      style={{
        background: "linear-gradient(to right, rgb(11, 177, 80), rgb(1, 63, 172))",
        minHeight: "100vh",
      }}
    >
      <Container>
        <h1 className="text-center mb-3 mb-md-4 text-white fs-2 fs-md-1">
          Get in Touch With Us
        </h1>
        <hr className="bg-white mx-auto" style={{ maxWidth: "80%" }} />

        <Row className="justify-content-center g-4">
          {/* Contact Info and Map */}
          <Col xs={12} lg={6}>
            <Card className="shadow h-100">
              <Card.Body className="p-3 p-md-4">
                <div className="map-container mb-3" style={{ height: "250px", position: "relative", overflow: "hidden" }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.844733880548!2d39.85400177568686!3d-3.6229327963511357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x183fdd77b5e306bd%3A0x29d1cd979d54b312!2sWater%20Sports%20Ground!5e0!3m2!1sen!2ske!4v1742594009117!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: "absolute", top: 0, left: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Location Map"
                  ></iframe>
                </div>
                <ListGroup variant="flush" className="border-top pt-2">
                  <ListGroup.Item className="px-0 py-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-primary fa-fw me-2" />
                    <strong>Email:</strong>{" "}
                    <span className="text-muted">offworldmedia@africa.com</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 py-2">
                    <FontAwesomeIcon icon={faPhone} className="text-primary fa-fw me-2" />
                    <strong>Phone:</strong>{" "}
                    <span className="text-muted">+2547-979-8030</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 py-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary fa-fw me-2" />
                    <strong>Address:</strong>
                    <span className="text-muted d-block">
                      500 Office Center Drive, Suite 400,
                      <br /> Fort Washington, PA 19034
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact Form */}
          <Col xs={12} lg={6}>
            <Card className="shadow h-100">
              <Card.Body className="p-3 p-md-4">
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col xs={12} sm={6} className="mb-3 mb-sm-0">
                      <Form.Group>
                        <Form.Label>First Name *</Form.Label>
                        {profileFetching ? (
                          <LoadingSkeleton />
                        ) : (
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            readOnly={isAuthenticated && profile}
                            required
                            aria-busy={profileFetching}
                            aria-live="polite"
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label>Last Name *</Form.Label>
                        {profileFetching ? (
                          <LoadingSkeleton />
                        ) : (
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            readOnly={isAuthenticated && profile}
                            required
                            aria-busy={profileFetching}
                            aria-live="polite"
                          />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    {profileFetching ? (
                      <LoadingSkeleton />
                    ) : (
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={isAuthenticated && profile}
                        required
                        aria-busy={profileFetching}
                        aria-live="polite"
                      />
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Subject *</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Message *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>
                  <div className="d-grid">
                    <Button
                      variant="success"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </div>
                </Form>

                {responseMessage && (
                  <div
                    className={`mt-3 text-center ${
                      responseMessage.includes("Error")
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {responseMessage}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default ContactUs;
