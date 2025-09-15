import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import API from "../api";

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await API.get("/reviews/");
      setReviews(response.data);
    } catch (err) {
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "UU";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <i key={i} className="bi bi-star-fill text-warning me-1"></i>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <i key={i} className="bi bi-star-half text-warning me-1"></i>
        );
      } else {
        stars.push(<i key={i} className="bi bi-star text-muted me-1"></i>);
      }
    }
    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "success";
    if (rating >= 4) return "primary";
    if (rating >= 3) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <Container
        fluid
        className="py-4 d-flex align-items-center justify-content-center"
        style={{
          background: "#1a1a1a",
          color: "white",
          minHeight: "50vh",
        }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            role="status"
            variant="light"
            style={{ width: "3rem", height: "3rem" }}
            className="mb-3"
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h5 className="fw-light">Loading amazing reviews...</h5>
        </div>
      </Container>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <Container
        className="py-4"
        style={{ background: "#1a1a1a", minHeight: "50vh" }}
      >
        <Row className="justify-content-center align-items-center h-100">
          <Col md={6}>
            <Alert variant="danger" className="shadow-lg border-0 rounded-4">
              <Alert.Heading className="d-flex align-items-center justify-content-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Error loading reviews
              </Alert.Heading>
              <p className="mb-3">{error}</p>
              <div className="text-center">
                <Button
                  variant="outline-danger"
                  onClick={fetchReviews}
                  className="rounded-pill px-4"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Try Again
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ background: "#1a1a1a" }}>
      <Container className="py-2">
        {/* Enhanced Header */}
        <Row className="mb-2">
          <Col className="text-center">
            <div className="mb-2">
              <Badge
                bg="primary"
                className="rounded-pill px-4 py-2 mb-2"
                style={{ fontSize: "0.9rem" }}
              >
                <i className="bi bi-chat-heart-fill me-2"></i>
                Customer Reviews
              </Badge>
            </div>
            <h1 className="display-5 fw-bold text-white mb-2">
              What Our Clients Say
            </h1>
            <p
              className="lead text-light mx-auto"
              style={{ maxWidth: "600px" }}
            >
              Discover the experiences and feedback from our valued customers
            </p>
            <div className="d-flex justify-content-center align-items-center mt-1">
              <div className="bg-white rounded-pill px-4 py-2 shadow-sm">
                <span className="text-primary fw-semibold">
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  {reviews.length} Reviews
                </span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <Row>
            <Col className="text-center">
              <Card className="border-0 shadow-lg rounded-4 bg-dark text-light">
                <Card.Body className="py-4">
                  <i className="bi bi-chat-left-dots display-1 text-muted mb-3"></i>
                  <h4 className="text-light">No reviews available yet</h4>
                  <p className="text-muted">
                    Be the first to share your experience!
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row className="g-4">
            {reviews.map((review, index) => (
              <Col
                key={review.id}
                xs={12}
                sm={12}
                md={6}
                lg={4}
                xl={4}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <Card
                  className="h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative bg-dark text-light"
                  style={{
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Rating Badge */}
                  <div
                    className="position-absolute top-0 end-0 m-3"
                    style={{ zIndex: 1 }}
                  >
                    <Badge
                      bg={getRatingColor(review.rating)}
                      className="rounded-pill px-3 py-2"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <i className="bi bi-star-fill me-1"></i>
                      {review.rating}
                    </Badge>
                  </div>

                  <Card.Body className="d-flex flex-column p-3">
                    {/* User Avatar */}
                    <div className="text-center mb-3">
                      {review.user?.profile_pic ? (
                        <img
                          src={review.user.profile_pic}
                          alt={review.user?.username || "User"}
                          className="rounded-circle border border-3 border-primary"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-gradient d-flex align-items-center justify-content-center border border-3 border-primary mx-auto"
                          style={{
                            width: "80px",
                            height: "80px",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {review.user?.username ? (
                            getInitials(review.user.username)
                          ) : (
                            <i className="bi bi-person-fill"></i>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rating Stars */}
                    <div className="text-center mb-3">
                      <div className="d-flex justify-content-center align-items-center">
                        {renderStars(review.rating)}
                        <span className="ms-2 text-light small">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="text-center mb-3 flex-grow-1">
                      {review.comment ? (
                        <div className="position-relative">
                          <i
                            className="bi bi-quote display-6 text-primary opacity-25 position-absolute"
                            style={{ top: "-10px", left: "10px" }}
                          ></i>
                          <p
                            className="fst-italic text-light lh-base px-3"
                            style={{
                              fontSize: "0.95rem",
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            "{review.comment}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted fst-italic">
                          <i className="bi bi-chat-left me-2"></i>
                          No comment provided
                        </p>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="text-center border-top border-secondary pt-2">
                      <h6 className="fw-bold text-light mb-1">
                        {review.user?.username || "Anonymous User"}
                      </h6>
                      {review.date && (
                        <small className="text-muted d-flex align-items-center justify-content-center">
                          <i className="bi bi-calendar3 me-2"></i>
                          {formatDate(review.date)}
                        </small>
                      )}
                    </div>
                  </Card.Body>

                  {/* Decorative bottom border */}
                  <div
                    className="position-absolute bottom-0 start-0 w-100"
                    style={{
                      height: "4px",
                      background: `linear-gradient(90deg, var(--bs-${getRatingColor(
                        review.rating
                      )}) 0%, var(--bs-${getRatingColor(review.rating)}) 100%)`,
                    }}
                  ></div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Add custom CSS styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bg-gradient {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 100%
          ) !important;
        }

        @media (max-width: 768px) {
          .display-5 {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AllReviews;
