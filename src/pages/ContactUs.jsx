import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import emailjs from '@emailjs/browser';
import API from "../api";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    setIsAuthenticated(!!accessToken);

    if (accessToken) {
      API.get("/profile/", { withCredentials: true })
        .then((response) => {
          setFormData((prevState) => ({
            ...prevState,
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            email: response.data.email,
          }));
        })
        .catch((error) => console.error("Error fetching user details:", error));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    
    setIsLoading(true);
    
    // Prepare EmailJS template parameters
    const templateParams = {
      from_name: `${formData.firstName} ${formData.lastName}`,
      reply_to: formData.email,
      subject: formData.subject,
      message: formData.message,
    };
    
    try {
      // Send email via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      );
      
      // After successful email, also save to backend if needed
      const response = await API.post("/contact/", formData, {
        withCredentials: true,
      });
      
      setResponseMessage("Message sent successfully! We'll get back to you soon.");
      setFormData({
        ...formData,
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setResponseMessage("Error sending message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="py-4 py-md-5" style={{ 
      background: "linear-gradient(to right, rgb(11, 177, 80), rgb(1, 63, 172))", 
      minHeight: "100vh"
    }}>
      <Container>
        <h1 className="text-center mb-3 mb-md-4 text-white fs-2 fs-md-1">Get in Touch With Us</h1>
        <hr className="bg-white mx-auto" style={{ maxWidth: "80%" }} />
        
        <Row className="justify-content-center g-4">
          {/* Map and Contact Info Card */}
          <Col xs={12} lg={6}>
            <Card className="shadow h-100">
              <Card.Body className="p-3 p-md-4">
                <div className="map-container mb-3" style={{ height: "250px", position: "relative", overflow: "hidden" }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.844733880548!2d39.85400177568686!3d-3.6229327963511357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x183fdd77b5e306bd%3A0x29d1cd979d54b312!2sWater%20Sports%20Ground!5e0!3m2!1sen!2ske!4v1742594009117!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: "absolute", top: 0, left: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Location Map"
                  ></iframe>
                </div>
                
                <ListGroup variant="flush" className="border-top pt-2">
                  <ListGroup.Item className="px-0 py-2">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <FontAwesomeIcon icon={faEnvelope} className="text-primary fa-fw" size="lg" />
                      </div>
                      <div>
                        <strong>Email: </strong>
                        <span className="text-muted d-block text-break">
                          offworldmedia@africa.com
                        </span>
                      </div>
                    </div>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="px-0 py-2">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <FontAwesomeIcon icon={faPhone} className="text-primary fa-fw" size="lg" />
                      </div>
                      <div>
                        <strong>Phone: </strong>
                        <span className="text-muted d-block">
                          +2547-979-8030
                        </span>
                      </div>
                    </div>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="px-0 py-2">
                    <div className="d-flex">
                      <div className="me-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary fa-fw" size="lg" />
                      </div>
                      <div>
                        <strong>Address: </strong>
                        <span className="text-muted d-block">
                          500 Office Center Drive, Suite 400,<br />
                          Fort Washington, PA 19034
                        </span>
                      </div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Contact Form Card */}
          <Col xs={12} lg={6}>
            <Card className="shadow h-100">
              <Card.Body className="p-3 p-md-4">
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col xs={12} sm={6} className="mb-3 mb-sm-0">
                      <Form.Group>
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          readOnly
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label>Last Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          readOnly
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      required
                    />
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
                      {isLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </Form>
                
                {responseMessage && (
                  <div className={`mt-3 text-center ${responseMessage.includes('Error') ? 'text-danger' : 'text-success'}`}>
                    {responseMessage}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Authentication Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Authentication Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">You need to log in to send a message.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" href="/login">
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ContactUs;