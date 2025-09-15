import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Carousel,
} from "react-bootstrap";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import { media_url } from "../utils/constants";
import "../assets/css/Reviews.css"; // Make sure to import your CSS file

// Function to chunk reviews into groups of 3
const chunkReviews = (reviews, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < reviews.length; i += chunkSize) {
    chunks.push(reviews.slice(i, i + chunkSize));
  }
  return chunks;
};

function Reviews({ reviews }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [reviewList, setReviewList] = useState([]);
  const reviewChunks = chunkReviews(reviewList || [], 3); // Show 3 reviews per slide
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    API.get("/reviews/")
      .then((response) => {
        console.log("Fetched Reviews:", response.data);
        setReviewList(response.data);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  }, []);

  useEffect(() => {
    API.get("/services/")
      .then((response) => {
        console.log("Fetched services:", response.data.services);
        setServices(response.data.services || []);
      })
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  const handleStarClick = (index) => {
    setRating(index + 1); // Star rating from 1-5
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setMessage("You must be logged in to submit a review.");
      setMessageType("error");
      setShowMessageModal(true);
      return;
    }

    try {
      await API.post(
        `/review/${serviceId}`,
        { rating, comment, service: parseInt(serviceId) },
        { withCredentials: true }
      );
      setMessage("Review submitted successfully!");
      setMessageType("success");
      setShowMessageModal(true);
      setServiceId("");
      setRating(0);
      setComment("");

      // Refresh the reviews
      API.get("/reviews/").then((response) => setReviewList(response.data));
    } catch (error) {
      setMessage("Error submitting review. Please try again.");
      setMessageType("error");
      setShowMessageModal(true);
    }
  };

  return (
    <Container fluid className="reviews-container p-0">
      {/* Reviews Section */}
      <Row
        className="py-5 m-0"
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.5)), url('/review.jpg') no-repeat center center fixed",
          backgroundSize: "cover",
          color: "white",
        }}
      >
        <h1 className="text-center fw-bold">Reviews</h1>
        <p className="text-center">
          See what the hype is all about and check out our Yelp to see
          <Link
            to="/all-reviews"
            className="text-white text-decoration-underline"
          >
            {" "}
            all our reviews!
          </Link>
        </p>
        <Row className="m-0">
          <Carousel interval={5000} pause="hover">
            {chunkReviews(reviewList, 3).map((chunk, chunkIndex) => (
              <Carousel.Item key={chunkIndex}>
                <Row className="justify-content-center m-0">
                  {chunk.map((review, index) => (
                    <Col key={index} md={4} className="mb-4">
                      <Card className="review-card">
                        <Card.Body>
                          <div className="user-info d-flex align-items-center">
                            <img
                              src={review.user?.profile_pic}
                              alt={review.user?.username}
                              className="user-image me-2"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                            <Card.Title className="user-name">
                              {review.user?.username}
                            </Card.Title>
                          </div>

                          <Card.Subtitle className="service-name mt-2">
                            Service: <i>{review.service_details?.category}</i>
                          </Card.Subtitle>

                          <div className="rating-stars mt-2">
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={
                                  i < review.rating ? solidStar : regularStar
                                }
                                className="text-warning"
                              />
                            ))}
                          </div>

                          <Card.Text className="review-comment">
                            {review.comment}
                          </Card.Text>

                          <p className="text-muted mb-0">
                            <strong>Reviewed At:</strong>{" "}
                            <i>{new Date(review.created_at).toDateString()}</i>
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        </Row>
      </Row>
      {/* Add Review Section */}
      <fieldset
        className="m-0 text-white rounded-0"
        style={{
          background:
            "linear-gradient(to right, rgb(54, 61, 73), rgb(32, 2, 65))",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          paddingBottom: "20px",
        }}
      >
        <legend className="text-center fw-bold text-light px-3">
          Add a Review
        </legend>

        <Form onSubmit={handleSubmit} className="pb-0">
          <Form.Group>
            {/* Service Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Select Service:</Form.Label>
              <Form.Select
                value={serviceId || ""}
                onChange={(e) => setServiceId(e.target.value)}
                required
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "green",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <option value="">Choose a service...</option>
                {services && services.length > 0 ? (
                  services.map((service) => (
                    <option
                      key={service.id}
                      value={service.id ? service.id.toString() : ""}
                    >
                      {service.category || "Uncategorized Service"}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading services...</option>
                )}
              </Form.Select>
            </Form.Group>
            <Form.Label>Rating:</Form.Label>
            <div>
              {[...Array(5)].map((_, index) => (
                <FontAwesomeIcon
                  key={index}
                  icon={index < rating ? solidStar : regularStar}
                  onClick={() => handleStarClick(index)}
                  className="text-warning fs-3 mx-1"
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Comment:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            />
          </Form.Group>

          <Row className="justify-content-center m-0">
            <Button variant="success" type="submit" className="mt-3 w-50 mb-0">
              Submit Review
            </Button>
          </Row>
        </Form>
      </fieldset>

      {/* Success/Error Message Modal */}
      <Modal
        show={showMessageModal}
        onHide={() => setShowMessageModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {messageType === "success" ? "Success" : "Error"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p
            className={
              messageType === "success" ? "text-success" : "text-danger"
            }
          >
            {message}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowMessageModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Reviews;
