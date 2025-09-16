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
    <Container fluid className="main-container justify-content-center p-0">
      {/* Enhanced Header */}
      <Container
        fluid
        className="bg-dark text-white py-5 px-4 px-lg-5 text-center"
      >
        <h1 className="display-5 fw-bold text-white mb-2">
          What Our Clients Say
        </h1>
        <div
          className="mx-auto mb-4"
          style={{
            width: "50%",
            height: "2px",
            backgroundColor: "#45463bff",
          }}
        ></div>
        <p className="lead text-light mx-auto" style={{ maxWidth: "600px" }}>
          Discover the experiences and feedback from our valued customers
        </p>

        <div className="d-flex justify-content-center align-items-center mt-2">
          <div className="bg-white rounded-pill px-4 py-2 shadow-sm">
            <span className="text-primary fw-semibold">
              <i className="bi bi-star-fill text-warning me-2"></i>
              {reviews.length} Reviews
            </span>
          </div>
        </div>
      </Container>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <Container fluid className="bg-dark text-white py-5 px-4 px-lg-5">
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6} className="text-center">
              <Card className="border-0 shadow-lg rounded-4 bg-transparent text-light">
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
        </Container>
      ) : (
        <Container fluid className="bg-dark text-white py-5 px-4 px-lg-5">
          <Row className="g-4 justify-content-center">
            {reviews.map((review, index) => (
              <Col
                key={review.id}
                xs={12}
                sm={10}
                md={6}
                lg={4}
                xl={3}
                className="d-flex justify-content-center"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <Card
                  className="h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative text-light"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    maxWidth: "300px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 24px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0,0,0,0.1)";
                  }}
                >
                  <Card.Body className="d-flex flex-column p-4 text-center">
                    {/* User Avatar */}
                    <div className="mb-3">
                      {review.user?.profile_pic ? (
                        <img
                          src={review.user.profile_pic}
                          alt={review.user?.username || "User"}
                          className="rounded-circle"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                          style={{
                            width: "60px",
                            height: "60px",
                            background: "rgba(255, 255, 255, 0.2)",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            color: "white",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
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

                    {/* Review Text */}
                    <div className="mb-3 flex-grow-1">
                      {review.comment ? (
                        <p
                          className="text-light mb-0"
                          style={{
                            fontSize: "0.9rem",
                            lineHeight: "1.4",
                            fontWeight: "300",
                          }}
                        >
                          {review.comment}
                        </p>
                      ) : (
                        <p
                          className="text-muted fst-italic mb-0"
                          style={{ fontSize: "0.9rem" }}
                        >
                          No comment provided
                        </p>
                      )}
                    </div>

                    {/* Rating Stars */}
                    <div className="mb-2">
                      <div className="d-flex justify-content-center align-items-center">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`bi ${
                              i < review.rating ? "bi-star-fill" : "bi-star"
                            } me-1`}
                            style={{
                              fontSize: "1rem",
                              color:
                                i < review.rating
                                  ? "#ffc107"
                                  : "rgba(255, 255, 255, 0.3)",
                            }}
                          ></i>
                        ))}
                      </div>
                    </div>

                    {/* User Name */}
                    <div>
                      <p
                        className="text-light mb-0"
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "400",
                          opacity: "0.8",
                        }}
                      >
                        - {review.user?.username || "Anonymous User"} -
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

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
    </Container>
  );
};

export default AllReviews;
