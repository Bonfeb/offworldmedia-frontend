import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Box, Typography, Rating, Avatar, Alert } from '@mui/material';
import API from '../../api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Using the provided fetch method
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin-dashboard/?action=reviews');
      setReviews(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reviews. Please try again later.');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(); // Call the fetch method when component mounts
  }, []);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="admin-reviews mt-4">
      {reviews.map((review) => (
        <Card key={review.id} className="review-card mb-3">
          <Card.Body>
            <Row>
              <Col xs={12}>
                <Box className="review-header">
                  <Box className="user-info">
                    <Avatar 
                      src={review.user.avatar || "/api/placeholder/60/60"} 
                      alt={review.user.name}
                      className="user-avatar"
                    />
                    <Typography variant="h6" className="user-name">{review.user.name}</Typography>
                  </Box>
                  <Rating 
                    value={review.rating} 
                    readOnly 
                    precision={0.5}
                    className="review-rating"
                  />
                </Box>
                <Typography variant="body1" className="review-comment mt-2">
                  {review.comment}
                </Typography>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      {reviews.length === 0 && !loading && !error && (
        <Alert severity="info">No reviews found.</Alert>
      )}
    </Container>
  );
};

export default AdminReviews;