import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import {
  IconButton,
  Tooltip,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import API from "../../api";
import { set } from "date-fns";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
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
    setLoading(true);
    try {
      const response = await API.get("/admin-dashboard/?action=users");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    const { name, files, value } = e.target;
    const file = files?.[0];
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [`${name}_preview`]: reader.result,
        }));
        console.log("File preview:", reader.result);
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
      fetchUsers(); // Refresh the user list
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
        alert(`${apiError?.err}\n{JSON.stringify(apiError?.details, null, 2)}`);
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
        `/admin-dashboard/{currentUser.id}?type=user&confirm=true`
      );
      fetchUsers(); // Refresh the user list
      setShowDeleteModal(false);
      setSnackbar({
        open: true,
        message: "User deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  // Toggle row expansion and fetch user details
  const toggleRowExpansion = async (userId) => {
    const newExpandedRows = { ...expandedRows };

    // If row is being expanded and we don't have details yet, fetch them
    if (!newExpandedRows[userId] && !userDetails[userId]) {
      try {
        // Fetch user details including bookings, reviews, and messages
        const details = await API.get(
          `/admin-dashboard/?action=user-details&user_id=${userId}`
        );
        setUserDetails((prev) => ({
          ...prev,
          [userId]: details.data,
        }));
      } catch (err) {
        console.error("Error fetching user details:", err);
        // Set dummy data if the API fails
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

    // Toggle expansion state
    newExpandedRows[userId] = !newExpandedRows[userId];
    setExpandedRows(newExpandedRows);
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Users Management</h2>

      {/* Vertical scrollable table container */}
      <div style={{ height: "500px", overflow: "auto" }}>
        <Table striped bordered hover responsive>
          <thead className="bg-primary text-white sticky-top">
            <tr>
              <th className="text-center" style={{ width: "60px" }}>
                S/No
              </th>
              <th style={{ width: "50px" }}></th>
              <th>First Name</th>
              <th>Username</th>
              <th>Phone</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan="6" className="text-center text-danger">
                  {error}
                </td>
              </tr>
            ) : (
              <>
                {users.map((user, index) => (
                  <React.Fragment key={user.id || user.username}>
                    <tr>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(user.id)}
                        >
                          {expandedRows[user.id] ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </td>
                      <td>{user.first_name}</td>
                      <td>{user.username}</td>
                      <td>{user.phone || "N/A"}</td>
                      <td className="text-center">
                        <Tooltip title="Edit User">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(user)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                    {expandedRows[user.id] && (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <div className="p-3 bg-light">
                            <Row>
                              <Col md={4}>
                                <Card className="mb-3">
                                  <Card.Header>User Details</Card.Header>
                                  <Card.Body>
                                    <div className="d-flex mb-3">
                                      {user.profile_pic ? (
                                        <img
                                          src={user.profile_pic}
                                          alt={`${user.first_name}'s profile`}
                                          style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                          }}
                                        />
                                      ) : (
                                        <div
                                          className="d-flex justify-content-center align-items-center bg-secondary text-white"
                                          style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "50%",
                                          }}
                                        >
                                          No Image
                                        </div>
                                      )}
                                      <div className="ms-3">
                                        <h5>
                                          {user.first_name} {user.last_name}
                                        </h5>
                                        <p className="mb-1">
                                          <strong>Username:</strong>{" "}
                                          {user.username}
                                        </p>
                                        <p className="mb-1">
                                          <strong>Phone:</strong>{" "}
                                          {user.phone || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    <p>
                                      <strong>Address:</strong> {user.address}
                                    </p>
                                  </Card.Body>
                                </Card>
                              </Col>
                              <Col md={8}>
                                <Row>
                                  <Col md={12}>
                                    <Card className="mb-3">
                                      <Card.Header>Bookings</Card.Header>
                                      <Card.Body
                                        style={{
                                          maxHeight: "150px",
                                          overflow: "auto",
                                        }}
                                      >
                                        {userDetails[user.id]?.bookings
                                          ?.length > 0 ? (
                                          <Table size="sm">
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
                                              ]?.bookings?.map((booking) => (
                                                <tr key={booking.id}>
                                                  <td>{booking.id}</td>
                                                  <td>{booking.date}</td>
                                                  <td>{booking.status}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </Table>
                                        ) : (
                                          <p className="mb-0">
                                            No bookings found
                                          </p>
                                        )}
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                  <Col md={6}>
                                    <Card className="mb-3">
                                      <Card.Header>Reviews</Card.Header>
                                      <Card.Body
                                        style={{
                                          maxHeight: "150px",
                                          overflow: "auto",
                                        }}
                                      >
                                        {userDetails[user.id]?.reviews?.length >
                                        0 ? (
                                          <Table size="sm">
                                            <thead>
                                              <tr>
                                                <th>Rating</th>
                                                <th>Comment</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {userDetails[
                                                user.id
                                              ]?.reviews?.map((review) => (
                                                <tr key={review.id}>
                                                  <td>{review.rating}/5</td>
                                                  <td>{review.comment}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </Table>
                                        ) : (
                                          <p className="mb-0">
                                            No reviews found
                                          </p>
                                        )}
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                  <Col md={6}>
                                    <Card>
                                      <Card.Header>Messages</Card.Header>
                                      <Card.Body
                                        style={{
                                          maxHeight: "150px",
                                          overflow: "auto",
                                        }}
                                      >
                                        {userDetails[user.id]?.messages
                                          ?.length > 0 ? (
                                          <Table size="sm">
                                            <thead>
                                              <tr>
                                                <th>Date</th>
                                                <th>Message</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {userDetails[
                                                user.id
                                              ]?.messages?.map((message) => (
                                                <tr key={message.id}>
                                                  <td>{message.date}</td>
                                                  <td>{message.content}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </Table>
                                        ) : (
                                          <p className="mb-0">
                                            No messages found
                                          </p>
                                        )}
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {users.length === 0 && !error && (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>
      </div>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                name="profile_pic"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.profile_pic_preview && (
                <img
                  src={formData.profile_pic_preview}
                  alt="Profile Preview"
                  className="mt-2"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {currentUser?.first_name}{" "}
          {currentUser?.last_name}? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        key="snackbar"
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
          style={{
            backgroundColor:
              snackbar.severity === "error" ? "#f44336" : "#4caf50",
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default AdminUsers;
