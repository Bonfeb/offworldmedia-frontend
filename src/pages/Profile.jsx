import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api";

// Material UI imports
import { 
  Box, Container, Paper, Typography, TextField, Button, 
  Avatar, Grid, CircularProgress, Alert, Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

// Custom styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: "0 auto 16px",
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3]
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)"
  }
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function Profile() {
  const { userProfilePic, setUserProfilePic, isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // Fetch Profile Data Automatically on Mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await API.get("/profile/");
        setUser(response.data);
        setUserProfilePic(response.data.profile_pic);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, setUserProfilePic]);

  // Handle Input Changes
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Handle Profile Update Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    const formData = new FormData();
    Object.keys(user).forEach((key) => {
      formData.append(key, user[key]);
    });

    if (selectedFile) {
      formData.append("profile_pic", selectedFile);
    }

    try {
      const response = await API.put("/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(response.data);
      setUserProfilePic(response.data.profile_pic);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );
  
  if (!isAuthenticated) return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h6">You need to log in to view this page.</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        sx={{ mt: 2 }} 
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
        Your Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ProfileCard elevation={2}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <ProfileAvatar
                src={preview || userProfilePic || "/default-profile.png"}
                alt={`${user?.first_name} ${user?.last_name}`}
              />
              <Typography variant="h5" fontWeight="500" gutterBottom>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {user?.email}
              </Typography>
              
              <Button
                component="label"
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<AccountCircleIcon />}
                sx={{ mb: 2 }}
              >
                Change Picture
                <VisuallyHiddenInput type="file" onChange={handleFileChange} />
              </Button>
              
              {preview && (
                <Typography variant="body2" color="success.main" textAlign="center">
                  New image selected
                </Typography>
              )}
            </Box>
          </ProfileCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <ProfileCard elevation={2}>
            <Typography variant="h6" fontWeight="500" mb={3}>
              Profile Information
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    value={user?.first_name || ""}
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
                    value={user?.last_name || ""}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Username"
                    value={user?.username || ""}
                    variant="outlined"
                    fullWidth
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    value={user?.email || ""}
                    variant="outlined"
                    fullWidth
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={user?.phone || ""}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    value={user?.address || ""}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => navigate("/")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                    >
                      Update
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </ProfileCard>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;