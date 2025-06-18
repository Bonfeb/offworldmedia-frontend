import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

// Material UI imports
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  Avatar, 
  Container,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";

// React Bootstrap components for layout
import { Card } from "react-bootstrap";

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
const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  }
}));

const FormContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(3),
  textAlign: 'center',
}));

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  margin: '0 auto',
  width: 80,
  height: 80,
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  boxShadow: '0 8px 16px rgba(37, 117, 252, 0.3)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  boxShadow: '0 4px 10px rgba(37, 117, 252, 0.3)',
  padding: '12px 0',
  '&:hover': {
    background: 'linear-gradient(135deg, #5800c4 0%, #1a68e5 100%)',
    boxShadow: '0 6px 15px rgba(37, 117, 252, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
    color: 'rgba(255, 255, 255, 0.6)',
    boxShadow: 'none',
  }
}));

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true); // Start loading

    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && key !== 'confirmPassword') {
        formData.append(key, userData[key]);
      }
    });

    try {
      const response = await API.post("/register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Registration successful:", response.data);
      setIsLoading(false); // Stop loading
      setShowSuccessDialog(true);
    } catch (error) {
      setIsLoading(false); // Stop loading on error
      
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
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <GradientCard className="border-0">
        <FormContainer>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <AvatarStyled>
              <PersonAddIcon fontSize="large" />
            </AvatarStyled>
            <FormTitle variant="h4" component="h1">
              Create an Account
            </FormTitle>
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
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
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
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
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
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
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
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
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
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 2 }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    disabled={isLoading}
                    sx={{ 
                      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                      boxShadow: '0 4px 10px rgba(37, 117, 252, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5800c4 0%, #1a68e5 100%)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                        color: 'rgba(255, 255, 255, 0.6)',
                      },
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Upload Profile Picture
                    <VisuallyHiddenInput 
                      type="file" 
                      name="profile_pic"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </Button>
                  {fileSelected && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: isMobile ? 1 : 0 }}
                    >
                      File selected: {userData.profile_pic?.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ 
                    mt: 2, 
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    position: 'relative'
                  }}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress 
                        size={20} 
                        sx={{ 
                          color: 'white',
                          position: 'absolute',
                          left: '50%',
                          marginLeft: '-10px'
                        }} 
                      />
                      <Box sx={{ ml: 4 }}>Creating Account...</Box>
                    </>
                  ) : (
                    'Register Account'
                  )}
                </StyledButton>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1">
              Already have an account?{" "}
              <Typography
                component="span"
                variant="body1"
                sx={{ 
                  cursor: isLoading ? 'default' : 'pointer',
                  fontWeight: 'medium',
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: isLoading ? 0.5 : 1,
                  '&:hover': {
                    textDecoration: isLoading ? 'none' : 'underline'
                  }
                }}
                onClick={() => !isLoading && navigate("/login")}
              >
                Log in
              </Typography>
            </Typography>
          </Box>
        </FormContainer>
      </GradientCard>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => navigate("/login")}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ background: 'linear-gradient(to right, #6a11cb, #2575fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Registration Successful
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account has been created successfully. You can now log in.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button 
            onClick={() => navigate("/login")} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
              boxShadow: '0 4px 10px rgba(37, 117, 252, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5800c4 0%, #1a68e5 100%)',
              }
            }}
            autoFocus
          >
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