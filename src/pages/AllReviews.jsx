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
import { Star, Person, FormatQuote } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Typography,
  Rating,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import API from "../api";

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  if (loading) {
    return (
      <Container className="py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <Box className="text-center">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            className="mb-3"
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <Typography variant="h6" className="text-muted">
            Loading reviews...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <Container className="py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <Box className="text-center">
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Error loading reviews</Alert.Heading>
            <p>{error}</p>
          </Alert>
          <Button variant="primary" onClick={fetchReviews}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="py-5 min-vh-100">
      {/* Header */}
      <Row className="mb-5">
        <Col className="text-center">
          <Typography
            variant="h6"
            className="text-muted mb-0 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            See what our clients have to say about our services and experience
          </Typography>
        </Col>
      </Row>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <Row>
          <Col className="text-center">
            <Typography variant="h5" className="text-muted">
              No reviews available yet.
            </Typography>
          </Col>
        </Row>
      ) : (
        <Row>
          {reviews.map((review) => (
            <Col
              key={review.id}
              xs={12}
              sm={12}
              md={12}
              lg={4}
              xl={4}
              className="mb-4"
            >
              <Card className="h-100 shadow-sm border-0 rounded-3 hover-shadow">
                <Card.Body className="d-flex flex-column p-4">
                  {/* User Avatar */}
                  <Box className="d-flex justify-content-center mb-3">
                    {review.user?.profile_pic ? (
                      <Avatar
                        src={review.user.profile_pic}
                        alt={review.user?.username || "User"}
                        sx={{ width: 80, height: 80 }}
                        className="border-2 border-primary"
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: "primary.main",
                          fontSize: "1.5rem",
                        }}
                        className="border-2 border-primary"
                      >
                        {review.user?.username ? (
                          getInitials(review.user.username)
                        ) : (
                          <Person fontSize="large" />
                        )}
                      </Avatar>
                    )}
                  </Box>

                  {/* Comment */}
                  <Box className="text-center mb-3 flex-grow-1">
                    {review.comment ? (
                      <>
                        <FormatQuote className="text-muted mb-2" />
                        <Typography
                          variant="body2"
                          className="fst-italic text-dark"
                        >
                          {review.comment}
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        className="text-muted fst-italic"
                      >
                        No comment provided
                      </Typography>
                    )}
                  </Box>

                  {/* Rating */}
                  <Box className="d-flex justify-content-center mb-3">
                    <Rating
                      value={review.rating}
                      readOnly
                      precision={0.5}
                      size={isMobile ? "small" : "medium"}
                      emptyIcon={<Star className="text-muted" />}
                    />
                  </Box>

                  {/* User Name and Date */}
                  <Box className="text-center">
                    <Typography
                      variant="subtitle2"
                      className="fw-medium text-dark"
                    >
                      {review.user?.username || "Anonymous User"}
                    </Typography>
                    {review.date && (
                      <Typography variant="caption" className="text-muted">
                        {formatDate(review.date)}
                      </Typography>
                    )}
                  </Box>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default AllReviews;
