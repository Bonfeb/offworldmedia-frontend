import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, Spinner 
} from 'react-bootstrap';
import { 
  Box, Typography, IconButton, Avatar, Tooltip, Snackbar, Alert 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import API from '../../api';

const AdminTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state for editing/adding team members
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    profile_pic: null
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Function to fetch team members (provided in your code)
  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin-dashboard/?action=team');
      setTeamMembers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch Team Members. Please try again later.');
      console.error('Error fetching Team Members:', err);
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
      profile_pic: null // We don't set the existing image here as we can't pre-fill file inputs
    });
    setShowModal(true);
  };

  // Handle delete team member
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setLoading(true);
      try {
        await API.delete(`/admin-dashboard/?action=team&id=${id}`);
        setSnackbar({
          open: true,
          message: 'Team member deleted successfully',
          severity: 'success'
        });
        fetchTeamMembers(); // Refetch the updated list
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete team member',
          severity: 'error'
        });
        console.error('Error deleting team member:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profile_pic' && files && files[0]) {
      setFormData({
        ...formData,
        profile_pic: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
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
    formDataToSend.append('name', formData.name);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('bio', formData.bio);
    if (formData.profile_pic) {
      formDataToSend.append('profile_pic', formData.profile_pic);
    }

    try {
      // Update existing member
      await API.put(`/admin-dashboard/?action=team&id=${currentMember.id}`, formDataToSend);
      setSnackbar({
        open: true,
        message: 'Team member updated successfully',
        severity: 'success'
      });
      setShowModal(false);
      fetchTeamMembers(); // Refresh the list
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update team member',
        severity: 'error'
      });
      console.error('Error updating team member:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new team member
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('bio', formData.bio);
    if (formData.profile_pic) {
      formDataToSend.append('profile_pic', formData.profile_pic);
    }

    try {
      // Add new member
      await API.post('/admin-dashboard/?action=team', formDataToSend);
      setSnackbar({
        open: true,
        message: 'Team member added successfully',
        severity: 'success'
      });
      setShowModal(false);
      fetchTeamMembers(); // Refresh the list
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add team member',
        severity: 'error'
      });
      console.error('Error adding team member:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new team member
  const handleAddNewMember = () => {
    setCurrentMember(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      profile_pic: null
    });
    setShowModal(true);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container className="admin-team-container">
      <Box className="admin-team-header">
        <Typography variant="h4" component="h1">
          Team Members
        </Typography>
        <Button 
          variant="primary" 
          onClick={handleAddNewMember}
          disabled={loading}
        >
          Add New Member
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Box>
      )}

      <Row className="team-members-row">
        {teamMembers.map((member) => (
          <Col key={member.id} md={4} sm={6} className="mb-4">
            <Card className="team-member-card">
              <div className="avatar-container">
                {member.profile_pic ? (
                  <img 
                    src={member.profile_pic} 
                    alt={member.name} 
                    className="team-avatar" 
                  />
                ) : (
                  <Avatar className="team-avatar default-avatar">
                    {member.name.charAt(0)}
                  </Avatar>
                )}
              </div>
              
              <Card.Body className="text-center">
                <Card.Title className="member-name">{member.name}</Card.Title>
                <Card.Text className="member-bio">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut labore et
                  dolore.
                </Card.Text>
                <Card.Text className="member-role">{member.role}</Card.Text>
                
                <div className="social-icons">
                  <IconButton size="small">
                    <FacebookIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <TwitterIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <InstagramIcon fontSize="small" />
                  </IconButton>
                </div>
                
                <div className="action-buttons">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handleEdit(member)}
                    className="me-2"
                  >
                    <EditIcon fontSize="small" /> Update
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleDelete(member.id)}
                  >
                    <DeleteIcon fontSize="small" /> Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Edit/Add Member Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentMember ? 'Edit Team Member' : 'Add New Team Member'}
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
                  <small>Current image will be kept if no new image is selected</small>
                </div>
              )}
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
                  {currentMember ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                currentMember ? 'Update Member' : 'Add Member'
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminTeam;