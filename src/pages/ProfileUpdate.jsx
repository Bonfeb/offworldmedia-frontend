import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

// Material UI imports
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Fade,
  CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

// React Bootstrap imports for specific features
import { Card } from "react-bootstrap";

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  border: "none",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  borderRadius: 16,
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.16)"
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  margin: "0 auto",
  border: `4px solid white`,
  boxShadow: theme.shadows[3],
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)"
  }
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  margin: "0 auto",
  width: 150,
  height: 150,
  "&:hover .camera-icon": {
    opacity: 1
  }
}));

const CameraIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  color: "white",
  opacity: 0.7,
  transition: "opacity 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    opacity: 1
  }
}));

const HiddenInput = styled("input")({
  display: "none"
});

function ProfileUpdate() {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_pic: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await API.get("/profile/");
      setUser(response.data);
      setPreview(response.data.profile_pic);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, profile_pic: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("first_name", user.first_name);
    formData.append("last_name", user.last_name);
    formData.append("email", user.email);
    if (user.profile_pic instanceof File) {
      formData.append("profile_pic", user.profile_pic);
    }

    try {
      await API.put("/profile/edit/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please check your information and try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Fade in={true} timeout={800}>
        <StyledCard>
          <Card.Body className="p-4">
            <Box display="flex" alignItems="center" mb={3}>
              <IconButton 
                onClick={() => navigate("/dashboard")}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" fontWeight="bold">
                Edit Profile
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Profile updated successfully! Redirecting...
              </Alert>
            )}

            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <AvatarWrapper>
                    <ProfileAvatar
                      src={preview || "/default-profile.png"}
                      alt={`${user.first_name} ${user.last_name}`}
                    />
                    <label htmlFor="profile-pic-input">
                      <CameraIconButton 
                        className="camera-icon"
                        component="span"
                        size="small"
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </CameraIconButton>
                      <HiddenInput
                        id="profile-pic-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </AvatarWrapper>
                  
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Click the camera icon to change your profile picture
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        name="first_name"
                        value={user.first_name}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        name="last_name"
                        value={user.last_name}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        required
                        type="email"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<SaveIcon />}
                          disabled={updating}
                        >
                          {updating ? 'Saving...' : 'Save Changes'}
                          {updating && <CircularProgress size={24} sx={{ ml: 1 }} />}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Card.Body>
        </StyledCard>
      </Fade>
    </Container>
  );
}

export default ProfileUpdate;