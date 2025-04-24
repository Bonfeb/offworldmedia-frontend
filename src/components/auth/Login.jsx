import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// Material UI imports
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";

// React Bootstrap components
import { Card } from "react-bootstrap";

// Styled Card with dark blue background
const DarkBlueCard = styled(Card)(({ theme }) => ({
  background: '#1a237e', // Dark blue background
  borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  maxWidth: '500px',
  width: '100%',
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
  color: '#ffffff',
  marginBottom: theme.spacing(3),
  textAlign: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: '#3f51b5',
  boxShadow: '0 4px 10px rgba(63, 81, 181, 0.3)',
  padding: '12px 0',
  '&:hover': {
    background: '#303f9f',
    boxShadow: '0 6px 15px rgba(63, 81, 181, 0.4)',
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#90caf9',
    },
    color: 'white'
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#90caf9',
  },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  }
});

const CircleIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#3f51b5',
  boxShadow: '0 8px 16px rgba(63, 81, 181, 0.3)',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
}));

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login } = useContext(AuthContext);

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userGroups, setUserGroups] = useState(null);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked! Submitting form...");
    
    try {
      const groups = await login(credentials);
      console.log("User belongs to groups:", groups);
      
      setUserGroups(groups);
      setShowSuccessDialog(true);
      
      setTimeout(() => {
        if (groups.includes("admin")) {
          navigate("/admin-dashboard");
        } else {
          navigate("/userdashboard");
        }
      }, 2000);

    } catch (error) {
      console.error("Login error:", error.message);
      setErrorMessage(error.message || "Login failed. Please try again.");
      setShowFailureDialog(true);
    }
  };

  return (
    <Container 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        py: 3
      }}
    >
      <DarkBlueCard className="border-0">
        <FormContainer>
          <CircleIcon>
            <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
          </CircleIcon>
          
          <FormTitle variant="h4" component="h1">
            Welcome Back
          </FormTitle>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={credentials.username}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
            
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
            >
              Sign In
            </StyledButton>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }} color="rgba(255, 255, 255, 0.7)">
                Don't have an account?{" "}
                <Typography
                  component="span"
                  variant="body1"
                  sx={{ 
                    cursor: 'pointer',
                    fontWeight: 'medium',
                    color: '#90caf9',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </Typography>
              </Typography>
              
              <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                Forgot Password?{" "}
                <Typography
                  component="span"
                  variant="body1"
                  sx={{ 
                    cursor: 'pointer',
                    fontWeight: 'medium',
                    color: '#90caf9',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Reset
                </Typography>
              </Typography>
            </Box>
          </Box>
        </FormContainer>
      </DarkBlueCard>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => navigate(userGroups?.includes("admin") ? "/admin-dashboard" : "/userdashboard")}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#3f51b5' }}>
          Login Successful
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have successfully logged in!
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button 
            onClick={() => navigate(userGroups?.includes("admin") ? "/admin-dashboard" : "/userdashboard")}
            variant="contained"
            sx={{
              background: '#3f51b5',
              boxShadow: '0 4px 10px rgba(63, 81, 181, 0.3)',
              '&:hover': {
                background: '#303f9f',
              }
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Failure Dialog */}
      <Dialog
        open={showFailureDialog}
        onClose={() => setShowFailureDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Login Failed
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button 
            onClick={() => setShowFailureDialog(false)}
            variant="contained"
            color="primary"
          >
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
