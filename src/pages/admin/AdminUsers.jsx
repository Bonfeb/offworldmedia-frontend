import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Card,
  Row,
  Col,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import {
  IconButton,
  Tooltip,
  Snackbar,
  Alert as MuiAlert,
  Paper,
  Box,
  Chip,
  Avatar,
  Typography,
  Fade,
} from "@mui/material";
import API from "../../api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Initial page load
  const [tableLoading, setTableLoading] = useState(false); // Table-specific loading
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({
    username: "",
    email: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    address: "",
    email: "",
    profile_pic: null,
    profile_pic_preview: null,
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const queryParams = new URLSearchParams({ action: "users" });
      if (filters.username) queryParams.append("username", filters.username);
      if (filters.email) queryParams.append("email", filters.email);
      const response = await API.get(
        `/admin-dashboard/?${queryParams.toString()}`
      );
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
      console.error("Error fetching users:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers().then(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle edit user
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      phone: user.phone || "",
      address: user.address,
      email: user.email || "",
      profile_pic: null,
      profile_pic_preview: user.profile_pic || null,
    });
    setShowModal(true);
  };

  // Handle delete user
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    setFormData((prev) => ({
      ...prev,
      [name]: file || null,
    }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [`${name}_preview`]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit updated user data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "profile_pic_preview") return;

        const newVal = formData[key];
        const oldVal = currentUser[key];

        if (key === "profile_pic") {
          if (newVal instanceof File) {
            formDataToSend.append("profile_pic", newVal);
          }
          return;
        }

        const newValString = newVal == null ? "" : String(newVal);
        const oldValString = oldVal == null ? "" : String(oldVal);

        if (newValString !== oldValString) {
          formDataToSend.append(key, newVal);
        }
      });

      await API.put(`/admin-dashboard/${currentUser.id}`, formDataToSend, {
        withCredentials: true,
      });
      fetchUsers();
      setShowModal(false);
      setSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating user:", err);
      const apiError = err.response?.data;
      if (apiError?.err && apiError?.details) {
        alert(
          `${apiError?.err}\n${JSON.stringify(apiError?.details, null, 2)}`
        );
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update user. Please try again.",
          severity: "error",
        });
      }
    }
  };

  // Confirm and delete user
  const handleDeleteConfirm = async () => {
    try {
      await API.delete(
        `/admin-dashboard/${currentUser.id}?type=user&confirm=true`
      );
      fetchUsers();
      setShowDeleteModal(false);
      setSnackbar({
        open: true,
        message: "User deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      setSnackbar({
        open: true,
        message: "Failed to delete user. Please try again.",
        severity: "error",
      });
    }
  };

  // Toggle row expansion and fetch user details
  const toggleRowExpansion = async (userId) => {
    const newExpandedRows = { ...expandedRows };

    if (!newExpandedRows[userId] && !userDetails[userId]) {
      try {
        const details = await API.get(
          `/admin-dashboard/?action=user-details&user_id=${userId}`
        );
        setUserDetails((prev) => ({
          ...prev,
          [userId]: details.data,
        }));
      } catch (err) {
        console.error("Error fetching user details:", err);
        setUserDetails((prev) => ({
          ...prev,
          [userId]: {
            bookings: [],
            reviews: [],
            messages: [],
          },
        }));
      }
    }

    newExpandedRows[userId] = !newExpandedRows[userId];
    setExpandedRows(newExpandedRows);
  };

  const clearFilters = () => {
    setFilters({ username: "", email: "" });
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div className="mt-3">
            <Typography variant="h6" color="text.secondary">
              Loading users...
            </Typography>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Box sx={{ background: "#1A2A44", minHeight: "100vh", py: 4 }}>
      <Container>
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
          <Row className="align-items-center justify-content-between">
            <Col xs="auto">
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
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                <PersonIcon sx={{ fontSize: 32, color: "#667eea" }} />
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, color: "#2c3e50", mb: 0 }}
                >
                  Users Management
                </Typography>
              </div>
            </Col>
          </Row>
        </Paper>

        {/* Search Section */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.98)",
          }}
        >
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted">
                  Search by Username
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    style={{ backgroundColor: "#f8f9fa", border: "none" }}
                  >
                    <SearchIcon fontSize="small" />
                  </InputGroup.Text>
                  <FormControl
                    type="text"
                    name="username"
                    value={filters.username}
                    onChange={handleFilterChange}
                    placeholder="Enter username..."
                    style={{ border: "none", borderLeft: "1px solid #dee2e6" }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted">
                  Search by Email
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    style={{ backgroundColor: "#f8f9fa", border: "none" }}
                  >
                    <SearchIcon fontSize="small" />
                  </InputGroup.Text>
                  <FormControl
                    type="email"
                    name="email"
                    value={filters.email}
                    onChange={handleFilterChange}
                    placeholder="Enter email..."
                    style={{ border: "none", borderLeft: "1px solid #dee2e6" }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Button
                  variant="outline-secondary"
                  onClick={clearFilters}
                  className="d-flex align-items-center gap-2 w-100"
                  style={{
                    borderRadius: "20px",
                    padding: "10px 20px",
                    height: "38px",
                  }}
                >
                  <ClearIcon fontSize="small" />
                  Clear Search
                </Button>
              </Form.Group>
            </Col>
          </Row>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            💡 Search is case-insensitive and matches partial text
          </Typography>
        </Paper>

        {/* Users Table */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.98)",
          }}
        >
          {tableLoading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Spinner
                animation="border"
                role="status"
                variant="primary"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <Typography variant="h6" color="text.secondary" className="mt-3">
                Loading users...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="error">
                ⚠️ {error}
              </Typography>
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                👥 No users matched your search criteria
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-2"
              >
                Try adjusting your search or clear the filters to see all users
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: "600px", overflow: "auto" }}>
              <Table hover responsive className="mb-0">
                <thead
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th
                      className="text-center text-white fw-bold"
                      style={{ width: "60px", padding: "15px 10px" }}
                    >
                      #
                    </th>
                    <th
                      className="text-dark fw-bold"
                      style={{ width: "50px", padding: "15px 10px" }}
                    ></th>
                    <th
                      className="text-dark fw-bold"
                      style={{ padding: "15px 10px" }}
                    >
                      User
                    </th>
                    <th
                      className="text-dark fw-bold"
                      style={{ padding: "15px 10px" }}
                    >
                      Contact
                    </th>
                    <th
                      className="text-center text-dark fw-bold"
                      style={{ padding: "15px 10px" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <React.Fragment key={user.id || user.username}>
                      <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                        <td
                          className="text-center align-middle"
                          style={{ padding: "15px 10px" }}
                        >
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              backgroundColor: "#667eea",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </td>
                        <td
                          className="text-center align-middle"
                          style={{ padding: "15px 10px" }}
                        >
                          <Tooltip
                            title={
                              expandedRows[user.id]
                                ? "Collapse details"
                                : "Expand details"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => toggleRowExpansion(user.id)}
                              sx={{
                                backgroundColor: expandedRows[user.id]
                                  ? "#e3f2fd"
                                  : "#f5f5f5",
                                "&:hover": {
                                  backgroundColor: expandedRows[user.id]
                                    ? "#bbdefb"
                                    : "#eeeeee",
                                },
                              }}
                            >
                              <Fade in={true}>
                                {expandedRows[user.id] ? (
                                  <KeyboardArrowUpIcon />
                                ) : (
                                  <KeyboardArrowDownIcon />
                                )}
                              </Fade>
                            </IconButton>
                          </Tooltip>
                        </td>
                        <td
                          className="align-middle"
                          style={{ padding: "15px 10px" }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <Avatar
                              src={user.profile_pic}
                              sx={{
                                width: 45,
                                height: 45,
                                border: "2px solid #667eea",
                              }}
                            >
                              {user.first_name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <div>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, mb: 0 }}
                              >
                                {user.first_name} {user.last_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                @{user.username}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td
                          className="align-middle"
                          style={{ padding: "15px 10px" }}
                        >
                          <div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              📧 {user.email || "N/A"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📱 {user.phone || "N/A"}
                            </Typography>
                          </div>
                        </td>
                        <td
                          className="text-center align-middle"
                          style={{ padding: "15px 10px" }}
                        >
                          <div className="d-flex justify-content-center gap-1">
                            <Tooltip title="Edit User">
                              <IconButton
                                onClick={() => handleEditClick(user)}
                                size="small"
                                sx={{
                                  backgroundColor: "#e8f5e8",
                                  color: "#2e7d32",
                                  "&:hover": { backgroundColor: "#c8e6c9" },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                onClick={() => handleDeleteClick(user)}
                                size="small"
                                sx={{
                                  backgroundColor: "#ffebee",
                                  color: "#d32f2f",
                                  "&:hover": { backgroundColor: "#ffcdd2" },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[user.id] && (
                        <tr>
                          <td colSpan="5" className="p-0">
                            <Fade in={expandedRows[user.id]}>
                              <Box
                                sx={{
                                  p: 3,
                                  backgroundColor: "#f8f9fa",
                                  borderTop: "3px solid #667eea",
                                }}
                              >
                                <Row>
                                  <Col md={4}>
                                    <Card
                                      className="h-100 shadow-sm"
                                      style={{ border: "none" }}
                                    >
                                      <Card.Header
                                        style={{
                                          backgroundColor: "#667eea",
                                          color: "white",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        👤 User Details
                                      </Card.Header>
                                      <Card.Body>
                                        <div className="text-center mb-3">
                                          <Avatar
                                            src={user.profile_pic}
                                            sx={{
                                              width: 80,
                                              height: 80,
                                              mx: "auto",
                                              border: "3px solid #667eea",
                                            }}
                                          >
                                            {user.first_name
                                              ?.charAt(0)
                                              ?.toUpperCase()}
                                          </Avatar>
                                          <Typography
                                            variant="h6"
                                            className="mt-2 mb-1"
                                          >
                                            {user.first_name} {user.last_name}
                                          </Typography>
                                          <Chip
                                            label={`@${user.username}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ backgroundColor: "#e3f2fd" }}
                                          />
                                        </div>
                                        <Typography
                                          variant="body2"
                                          className="mb-2"
                                        >
                                          <strong>📍 Address:</strong>{" "}
                                          {user.address || "Not provided"}
                                        </Typography>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                  <Col md={8}>
                                    <Row className="h-100">
                                      <Col md={12} className="mb-3">
                                        <Card
                                          className="shadow-sm"
                                          style={{ border: "none" }}
                                        >
                                          <Card.Header
                                            style={{
                                              backgroundColor: "#4caf50",
                                              color: "white",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            📅 Bookings (
                                            {userDetails[user.id]?.bookings
                                              ?.length || 0}
                                            )
                                          </Card.Header>
                                          <Card.Body
                                            style={{
                                              maxHeight: "150px",
                                              overflow: "auto",
                                            }}
                                          >
                                            {userDetails[user.id]?.bookings
                                              ?.length > 0 ? (
                                              <Table size="sm" className="mb-0">
                                                <thead>
                                                  <tr>
                                                    <th>ID</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {userDetails[
                                                    user.id
                                                  ]?.bookings?.map(
                                                    (booking) => (
                                                      <tr key={booking.id}>
                                                        <td>#{booking.id}</td>
                                                        <td>{booking.date}</td>
                                                        <td>
                                                          <Chip
                                                            label={
                                                              booking.status
                                                            }
                                                            size="small"
                                                            color={
                                                              booking.status ===
                                                              "confirmed"
                                                                ? "success"
                                                                : "default"
                                                            }
                                                          />
                                                        </td>
                                                      </tr>
                                                    )
                                                  )}
                                                </tbody>
                                              </Table>
                                            ) : (
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                className="text-center py-3"
                                              >
                                                No bookings found
                                              </Typography>
                                            )}
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                      <Col md={6}>
                                        <Card
                                          className="shadow-sm h-100"
                                          style={{ border: "none" }}
                                        >
                                          <Card.Header
                                            style={{
                                              backgroundColor: "#ff9800",
                                              color: "white",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            ⭐ Reviews (
                                            {userDetails[user.id]?.reviews
                                              ?.length || 0}
                                            )
                                          </Card.Header>
                                          <Card.Body
                                            style={{
                                              maxHeight: "150px",
                                              overflow: "auto",
                                            }}
                                          >
                                            {userDetails[user.id]?.reviews
                                              ?.length > 0 ? (
                                              userDetails[
                                                user.id
                                              ]?.reviews?.map((review) => (
                                                <div
                                                  key={review.id}
                                                  className="mb-2 p-2"
                                                  style={{
                                                    backgroundColor: "#fff3e0",
                                                    borderRadius: "8px",
                                                  }}
                                                >
                                                  <div className="d-flex justify-content-between">
                                                    <Chip
                                                      label={`${review.rating}/5 ⭐`}
                                                      size="small"
                                                    />
                                                  </div>
                                                  <Typography
                                                    variant="body2"
                                                    className="mt-1"
                                                  >
                                                    {review.comment}
                                                  </Typography>
                                                </div>
                                              ))
                                            ) : (
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                className="text-center py-3"
                                              >
                                                No reviews found
                                              </Typography>
                                            )}
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                      <Col md={6}>
                                        <Card
                                          className="shadow-sm h-100"
                                          style={{ border: "none" }}
                                        >
                                          <Card.Header
                                            style={{
                                              backgroundColor: "#9c27b0",
                                              color: "white",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            💬 Messages (
                                            {userDetails[user.id]?.messages
                                              ?.length || 0}
                                            )
                                          </Card.Header>
                                          <Card.Body
                                            style={{
                                              maxHeight: "150px",
                                              overflow: "auto",
                                            }}
                                          >
                                            {userDetails[user.id]?.messages
                                              ?.length > 0 ? (
                                              userDetails[
                                                user.id
                                              ]?.messages?.map((message) => (
                                                <div
                                                  key={message.id}
                                                  className="mb-2 p-2"
                                                  style={{
                                                    backgroundColor: "#f3e5f5",
                                                    borderRadius: "8px",
                                                  }}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                  >
                                                    {message.date}
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    className="mt-1"
                                                  >
                                                    {message.content}
                                                  </Typography>
                                                </div>
                                              ))
                                            ) : (
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                className="text-center py-3"
                                              >
                                                No messages found
                                              </Typography>
                                            )}
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </Box>
                            </Fade>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </Box>
          )}
        </Paper>

        {/* Edit User Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header
            closeButton
            style={{ backgroundColor: "#667eea", color: "white" }}
          >
            <Modal.Title className="d-flex align-items-center gap-2">
              <EditIcon />
              Edit User
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "#f8f9fa" }}>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Profile Picture</Form.Label>
                <Form.Control
                  type="file"
                  name="profile_pic"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ borderRadius: "10px" }}
                />
                {formData.profile_pic_preview && (
                  <div className="mt-3 text-center">
                    <Avatar
                      src={formData.profile_pic_preview}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: "auto",
                        border: "3px solid #667eea",
                      }}
                    />
                  </div>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: "#f8f9fa" }}>
            <Button
              variant="outline-secondary"
              onClick={() => setShowModal(false)}
              style={{ borderRadius: "20px" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              style={{
                borderRadius: "20px",
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                border: "none",
              }}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header
            closeButton
            style={{ backgroundColor: "#dc3545", color: "white" }}
          >
            <Modal.Title className="d-flex align-items-center gap-2">
              <DeleteIcon />
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <div className="mb-3">
              <DeleteIcon sx={{ fontSize: 60, color: "#dc3545" }} />
            </div>
            <Typography variant="h6" className="mb-3">
              Are you sure you want to delete this user?
            </Typography>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {currentUser?.first_name} {currentUser?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{currentUser?.username}
              </Typography>
            </Paper>
            <Typography variant="body2" color="error" className="mt-3">
              ⚠️ This action cannot be undone and will permanently remove all
              user data.
            </Typography>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowDeleteModal(false)}
              style={{ borderRadius: "20px" }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              style={{
                borderRadius: "20px",
                background: "linear-gradient(45deg, #dc3545, #c82333)",
                border: "none",
              }}
            >
              Delete User
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <MuiAlert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              borderRadius: "15px",
              fontWeight: 600,
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminUsers;
