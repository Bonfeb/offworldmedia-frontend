import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api";

// Material UI imports
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Avatar, 
  Container,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// React Bootstrap components for layout
import { Card, Row, Col } from "react-bootstrap";

// Styled component for file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Styled Card with gradient background
const GradientCard = styled(Card)({
  background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
  borderRadius: '12px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
});

const Register = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    profile_pic: null,
  });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileSelected, setFileSelected] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUserData({ ...userData, profile_pic: e.target.files[0] });
      setFileSelected(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password !== userData.confirmPassword) {
      const errMsg = "Passwords do not match!";
      console.error("Registration failed:", errMsg);
      setErrorMessage(errMsg);
      setShowErrorAlert(true);
      return;
    }

    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && key !== 'confirmPassword') {
        formData.append(key, userData[key]);
      }
    });

    try {

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/register/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Registration successful:", response.data);
      setShowSuccessDialog(true);
    } catch (error) {
      const errMsg = error.response?.data?.message || 
                   (typeof error.response?.data === 'object' ? 
                    Object.values(error.response.data).flat().join(", ") : 
                    "Registration failed. Please try again.");
      
      console.error("Registration failed:", error.response?.data || error.message);
      setErrorMessage(errMsg);
      setShowErrorAlert(true);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <GradientCard className="shadow-lg border-0">
        <Card.Body className="p-5">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
              Create an Account
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mr: 2 }}
                  >
                    Upload Profile Picture
                    <VisuallyHiddenInput 
                      type="file" 
                      name="profile_pic"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {fileSelected && <Typography variant="body2" color="text.secondary">
                    File selected: {userData.profile_pic?.name}
                  </Typography>}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    mt: 2, 
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  Register Account
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1">
              Already have an account?{" "}
              <Typography
                component="span"
                variant="body1"
                color="primary"
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 'medium',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => navigate("/login")}
              >
                Log in
              </Typography>
            </Typography>
          </Box>
        </Card.Body>
      </GradientCard>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => navigate("/login")}
      >
        <DialogTitle>Registration Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account has been created successfully. You can now log in.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/login")} variant="contained" autoFocus>
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      <Snackbar 
        open={showErrorAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowErrorAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowErrorAlert(false)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;