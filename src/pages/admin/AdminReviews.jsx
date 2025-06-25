import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Card, Container, Row, Col, Spinner } from "react-bootstrap";
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Alert,
  TextField,
  Button,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Reviews,
} from "@mui/icons-material";
import API from "../../api";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    service: "",
    user: "",
    rating: "",
    rating__gte: "",
    rating__lte: "",
  });

  const fetchReviews = async (filters = {}) => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append("action", "reviews");

      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          queryParams.append(key, value);
        }
      });

      const response = await API.get(
        `/admin-dashboard/?${queryParams.toString()}`
      );
      setReviews(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch reviews. Please try again later.");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    fetchReviews(searchFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = Object.keys(searchFilters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    setSearchFilters(clearedFilters);
    fetchReviews({});
  };

  const hasActiveFilters = Object.values(searchFilters).some(
    (value) => value && value.toString().trim()
  );

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
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
        }}
      >
        <Row className="align-items-center justify-content-between flex-wrap">
          {/* Back to Dashboard Button */}
          <Col xs={12} sm="auto" className="mb-2 mb-sm-0">
            <Link to="/admin-dashboard" style={{ textDecoration: "none" }}>
              <Button
                variant="outline-primary"
                className="d-flex align-items-center gap-2"
                style={{
                  borderRadius: "25px",
                  padding: "10px 20px",
                  border: "2px solid #007bff",
                  fontWeight: "600",
                }}
              >
                <DashboardIcon fontSize="small" />
                Back to Dashboard
              </Button>
            </Link>
          </Col>

          {/* Title: Reviews Management */}
          <Col xs={12} sm="auto" className="text-sm-end mb-2 mb-sm-0">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Reviews sx={{ fontSize: 32, color: "#667eea" }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, color: "#2c3e50", mb: 0 }}
              >
                Reviews Management
              </Typography>
            </div>
          </Col>
        </Row>
      </Paper>

      <hr />

      {/* Search and Filter Form */}
      <Paper elevation={2} className="mb-4" sx={{ p: 3 }}>
        <Box className="d-flex align-items-center gap-2 mb-3">
          <FilterIcon color="primary" />
          <Typography variant="h6" color="primary">
            Search & Filter Reviews
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="Filters Active"
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {/* General Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Reviews"
              placeholder="Search in comments, usernames, services..."
              value={searchFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchFilters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange("search", "")}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </Grid>

          {/* Service Filter */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Service Name"
              placeholder="Filter by service name"
              value={searchFilters.service}
              onChange={(e) => handleFilterChange("service", e.target.value)}
              InputProps={{
                endAdornment: searchFilters.service && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange("service", "")}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* User Filter */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              placeholder="Filter by username"
              value={searchFilters.user}
              onChange={(e) => handleFilterChange("user", e.target.value)}
              InputProps={{
                endAdornment: searchFilters.user && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange("user", "")}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Exact Rating Filter */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Exact Rating</InputLabel>
              <Select
                value={searchFilters.rating}
                label="Exact Rating"
                onChange={(e) => handleFilterChange("rating", e.target.value)}
              >
                <MenuItem value="">
                  <em>All Ratings</em>
                </MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Minimum Rating Filter */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Minimum Rating</InputLabel>
              <Select
                value={searchFilters.rating__gte}
                label="Minimum Rating"
                onChange={(e) =>
                  handleFilterChange("rating__gte", e.target.value)
                }
              >
                <MenuItem value="">
                  <em>No Minimum</em>
                </MenuItem>
                <MenuItem value="1">1+ Stars</MenuItem>
                <MenuItem value="2">2+ Stars</MenuItem>
                <MenuItem value="3">3+ Stars</MenuItem>
                <MenuItem value="4">4+ Stars</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Maximum Rating Filter */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Maximum Rating</InputLabel>
              <Select
                value={searchFilters.rating__lte}
                label="Maximum Rating"
                onChange={(e) =>
                  handleFilterChange("rating__lte", e.target.value)
                }
              >
                <MenuItem value="">
                  <em>No Maximum</em>
                </MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="5">5- Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box className="d-flex gap-2 mt-3">
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            color="primary"
          >
            Apply Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear All
          </Button>
        </Box>
      </Paper>

      {/* Reviews Display */}
      <Card className="review-card my-3">
        <Card.Body>
          {error && (
            <Alert severity="error" className="mb-3">
              {error}
            </Alert>
          )}
          {!error && reviews.length === 0 && (
            <Alert severity="info">
              {hasActiveFilters
                ? "No reviews match your search criteria."
                : "No reviews found."}
            </Alert>
          )}
          {reviews.map((review) => (
            <Card key={review.id} className="review-item mb-3">
              <Card.Body>
                <Row>
                  <Col xs={12}>
                    <Box className="review-header d-flex justify-content-between align-items-center">
                      <Box className="d-flex align-items-center gap-2">
                        <Avatar
                          src={
                            review.user.profile_pic || "/api/placeholder/60/60"
                          }
                          alt={review.user.name}
                          className="user-avatar"
                        />
                        <Typography variant="h6">
                          {review.user.username}
                        </Typography>
                        <small className="text-muted">
                          {review.service.name}
                        </small>
                      </Box>
                      <Rating value={review.rating} readOnly precision={0.5} />
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
