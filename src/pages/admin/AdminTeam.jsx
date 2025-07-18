import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Slide,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Dashboard as DashboardIcon, Group } from "@mui/icons-material";
import API from "../../api";

const AdminTeam = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    vertical: "top",
    horizontal: "center",
    autoHideDuration: 3000,
    severity: "success",
  });

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  // Form state for editing/adding team members
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    facebook_link: "",
    twitter_link: "",
    instagram_link: "",
    profile_pic: null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    member: null,
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Function to fetch team members (provided in your code)
  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin-dashboard/?action=team");
      setTeamMembers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch Team Members. Please try again later.");
      console.error("Error fetching Team Members:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening edit modal
  const handleEdit = (member) => {
    setCurrentMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      facebook_link: member.facebook_link,
      instagram_link: member.instagram_link,
      twitter_link: member.twitter_link,
      profile_pic: null, // We don't set the existing image here as we can't pre-fill file inputs
    });
    setShowModal(true);
  };

  // Handle opening delete confirmation dialog
  const handleDeleteClick = (member) => {
    setDeleteDialog({
      open: true,
      member: member,
    });
  };

  // Handle actual deletion of team member
  const handleDelete = async () => {
    if (!deleteDialog.member) return;
    const member_id = deleteDialog.member.id;
    setLoading(true);
    try {
      const response = await API.delete(`/team/${member_id}/`);
      if (response.status === 204) {
        setSnackbar({
          open: true,
          vertical: "top",
          horizontal: "center",
          autoHideDuration: 3000,
          message: response.data?.message || "Team member deleted successfully",
          severity: "success",
        });
        fetchTeamMembers(); // Refetch the updated list
      } else {
        throw new Error(`Unexpected Status code: ${response.status}`);
      }
    } catch (err) {
      console.error("Error deleting team member:", {
        message: err.message,
        response: {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers,
        },
        config: err.config,
      });
      setSnackbar({
        open: true,
        message: "Failed to delete team member. Please try again.",
        severity: "error",
      });
      console.error("Error deleting team member:", err);
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, member: null });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile_pic" && files && files[0]) {
      setFormData({
        ...formData,
        profile_pic: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle Update team member - specific function for updating
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentMember) return;

    setLoading(true);

    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("bio", formData.bio);
    console.log("Preparing to update team member:");
    if (formData.profile_pic instanceof File) {
      formDataToSend.append("profile_pic", formData.profile_pic);
    }
    console.log("FormData prepared for update:", {
      name: formData.name,
      role: formData.role,
      bio: formData.bio,
      profile_pic: formData.profile_pic ? "File selected" : "No new file",
    });
    try {
      // Update existing member
      console.log(
        "Sending PUT request to update team member:",
        currentMember.id
      );
      console.log("FormData to send:", formDataToSend);
      await API.put(`/team/${currentMember.id}/`, formDataToSend, {
        withCredentials: true,
      });
      setSnackbar({
        open: true,
        message: "Team member updated successfully",
        severity: "success",
      });
      setShowModal(false);
      fetchTeamMembers(); // Refresh the list
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to update team member",
        severity: "error",
      });
      console.error("Error updating team member:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new team member
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Form submission started");

    // Create FormData object for file upload
    const formDataToSend = new FormData();
    console.log("Initializing FormData");

    // Append form data with logging
    formDataToSend.append("name", formData.name);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("bio", formData.bio);
    formDataToSend.append("facebook_link", formData.facebook_link);
    formDataToSend.append("twitter_link", formData.twitter_link);
    formDataToSend.append("instagram_link", formData.instagram_link);
    console.log("Basic form data appended:", {
      name: formData.name,
      role: formData.role,
      bio: formData.bio,
      profile_pic: formData.profile_pic,
      facebook_link: formData.facebook_link,
      instagram_link: formData.instagram_link,
      twitter_limk: formData.twitter_link,
    });

    // Validate profile picture
    console.log("Checking profile picture:", formData.profile_pic);
    if (!formData.profile_pic || !(formData.profile_pic instanceof File)) {
      console.error(
        "Profile picture validation failed - either missing or not a File object"
      );
      setSnackbar({
        open: true,
        message: "Please select a profile picture",
        severity: "error",
      });
      setLoading(false);
      return;
    }
    formDataToSend.append("profile_pic", formData.profile_pic);
    console.log("Profile picture appended to FormData");

    try {
      console.log("Attempting to POST to /team endpoint");
      const response = await API.post("/team/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log("API Response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      setSnackbar({
        open: true,
        message: "Team member added successfully",
        severity: "success",
      });
      setShowModal(false);
      console.log("Modal closed, refreshing team members list");
      fetchTeamMembers(); // Refresh the list
    } catch (err) {
      console.error("Error in API call:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config,
      });

      const errorMessage =
        err.response?.data?.message || "Failed to add team member";
      console.log("Full server error response:", err.response?.data);
      console.error("Derived error message:", errorMessage);

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      console.log("Form submission process completed");
      setLoading(false);
    }
  };

  // Add new team member
  const handleAddNewMember = () => {
    setCurrentMember(null);
    setFormData({
      name: "",
      role: "",
      bio: "",
      profile_pic: null,
    });
    setShowModal(true);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Container fluid={isMobile} className="admin-team-container px-md-4">
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

          {/* Title: Team Management */}
          <Col xs={12} sm="auto" className="text-center mb-2 mb-sm-0">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Group sx={{ fontSize: 32, color: "#667eea" }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, color: "#2c3e50", mb: 0 }}
              >
                Team Management
              </Typography>
            </div>
          </Col>

          {/* Dropdown: Add Media */}
          <Col xs={12} sm="auto" className="text-sm-end text-center">
            <Button
              variant="primary"
              onClick={handleAddNewMember}
              disabled={loading}
              className="mt-3"
              size={isMobile ? "sm" : "md"}
            >
              Add New Member
            </Button>
          </Col>
        </Row>
      </Paper>

      {error && (
        <Alert severity="error" className="mb-4 mx-2">
          {error}
        </Alert>
      )}

      {loading && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Box>
      )}

      {!loading && !error && teamMembers.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            mx: isMobile ? 2 : 0,
            my: 4,
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#777",
              fontSize: isMobile ? "1rem" : "1.25rem",
              textAlign: "center",
            }}
          >
            No team members found. Click "Add New Member" to create one.
          </Typography>
        </Box>
      )}

      {!loading && teamMembers.length > 0 && (
        <Row className="team-members-row g-3 mx-0">
          {teamMembers.map((member) => (
            <Col key={member.id} lg={4} md={6} sm={12} className="mb-3">
              <Card className="team-member-card h-100 shadow-sm">
                <div className="avatar-container text-center pt-3">
                  {member.profile_pic ? (
                    <img
                      src={member.profile_pic}
                      alt={member.name}
                      className="team-avatar"
                      style={{
                        width: isMobile ? "100px" : "120px",
                        height: isMobile ? "100px" : "120px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <Avatar
                      className="team-avatar default-avatar"
                      sx={{
                        width: isMobile ? "100px" : "120px",
                        height: isMobile ? "100px" : "120px",
                        fontSize: isMobile ? "2.5rem" : "3rem",
                        margin: "0 auto",
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                  )}
                </div>

                <Card.Body className="text-center d-flex flex-column">
                  <Card.Title className="member-name">{member.name}</Card.Title>
                  <Card.Text className="member-bio flex-grow-1">
                    {member.bio}
                  </Card.Text>
                  <Card.Text className="member-role text-muted">
                    {member.role}
                  </Card.Text>

                  <div className="social-icons">
                    {member.facebook_link && (
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        component="a"
                        href={member.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FacebookIcon fontSize="small" />
                      </IconButton>
                    )}
                    {member.twitter_link && (
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        component="a"
                        href={member.twitter_link}
                        target="_blank"
                        rel="nooperner noreferrer"
                      >
                        <TwitterIcon fontSize="small" />
                      </IconButton>
                    )}
                    {member.instagram_link && (
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        component="a"
                        href={member.instagram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <InstagramIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>

                  <div className="action-buttons mt-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(member)}
                      className="me-2"
                    >
                      <EditIcon fontSize="small" /> {isMobile ? "" : "Update"}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(member)}
                    >
                      <DeleteIcon fontSize="small" /> {isMobile ? "" : "Delete"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Edit/Add Member Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        fullscreen={isMobile ? "sm-down" : false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentMember ? "Edit Team Member" : "Add New Team Member"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={currentMember ? handleUpdate : handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Role</option>
                <option value="ceo">CEO</option>
                <option value="producer">Producer</option>
                <option value="director">Director</option>
                <option value="editor">Editor</option>
                <option value="photographer">Photographer</option>
                <option value="videographer">Videographer</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                name="profile_pic"
                onChange={handleInputChange}
              />
              {currentMember && currentMember.profile_pic && (
                <div className="mt-2">
                  <small>
                    Current image will be kept if no new image is selected
                  </small>
                </div>
              )}
            </Form.Group>

            {/* Social Media Links Section */}
            <hr />
            <h6 className="mb-3">Social Media Links (Optional)</h6>

            <Form.Group className="mb-3">
              <Form.Label>
                <FacebookIcon fontSize="small" className="me-2" />
                Facebook Link
              </Form.Label>
              <Form.Control
                type="url"
                name="facebook_link"
                value={formData.facebook_link || ""}
                onChange={handleInputChange}
                placeholder="https://facebook.com/username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <TwitterIcon fontSize="small" className="me-2" />
                Twitter Link
              </Form.Label>
              <Form.Control
                type="url"
                name="twitter_link"
                value={formData.twitter_link || ""}
                onChange={handleInputChange}
                placeholder="https://twitter.com/username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <InstagramIcon fontSize="small" className="me-2" />
                Instagram Link
              </Form.Label>
              <Form.Control
                type="url"
                name="instagram_link"
                value={formData.instagram_link || ""}
                onChange={handleInputChange}
                placeholder="https://instagram.com/username"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {currentMember ? "Updating..." : "Adding..."}
                </>
              ) : currentMember ? (
                "Update Member"
              ) : (
                "Add Member"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: isMobile ? "90%" : "auto" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, member: null })}
        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteDialog.member?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, member: null })}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="danger">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTeam;
