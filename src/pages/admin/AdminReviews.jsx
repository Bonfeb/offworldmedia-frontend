import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Box, Typography, Rating, Avatar, Alert } from '@mui/material';
import API from '../../api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    fetchReviews();
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

  return (
    <Container className="admin-reviews mt-4">
      <h5 className="text-center" style={{color: 'greenyellow'}}>USER REVIEWS</h5>
      <hr/>
      <Card className="review-card my-3">
        <Card.Body>
          {error && (
            <Alert severity="error" className="mb-3">
              {error}
            </Alert>
          )}
          {(!error && reviews.length === 0) && (
            <Alert severity="info">No reviews found.</Alert>
          )}
          {reviews.map((review) => (
            <Card key={review.id} className="review-item mb-3">
              <Card.Body>
                <Row>
                  <Col xs={12}>
                    <Box className="review-header d-flex justify-content-between align-items-center">
                      <Box className="d-flex align-items-center gap-2">
                        <Avatar 
                          src={review.user.profile_pic || "/api/placeholder/60/60"} 
                          alt={review.user.name}
                          className="user-avatar"
                        />
                        <Typography variant="h6">{review.user.username}</Typography>
                        <small className="text-muted">{review.service.name}</small>
                      </Box>
                      <Rating 
                        value={review.rating} 
                        readOnly 
                        precision={0.5}
                      />
                    </Box>
                    <Typography variant="body1" className="mt-2">
                      {review.comment}
                    </Typography>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminReviews;
