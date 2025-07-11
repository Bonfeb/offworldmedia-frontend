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
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";

// React Bootstrap components
import { Card } from "react-bootstrap";
import ForgotPassword from "./ForgotPassword";

// Glassmorphism Card with backdrop blur
const GlassmorphismCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "20px",
  boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1)",
  maxWidth: "500px",
  width: "100%",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    borderRadius: "20px",
    zIndex: 0,
  },
}));

// Main container with animated gradient background
const GlassContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  padding: theme.spacing(3),
  background:
    "linear-gradient(-45deg, #1e3c72, #2a5298, #0f2027, #203a43, #2c5364, #1a237e, #283593, #3949ab)",
  backgroundSize: "400% 400%",
  animation: "gradientShift 15s ease infinite",
  "@keyframes gradientShift": {
    "0%": {
      backgroundPosition: "0% 50%",
    },
    "50%": {
      backgroundPosition: "100% 50%",
    },
    "100%": {
      backgroundPosition: "0% 50%",
    },
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: "rgba(255, 255, 255, 0.9)",
  marginBottom: theme.spacing(1),
  textAlign: "center",
  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
}));

const FormSubtitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  color: "rgba(255, 255, 255, 0.7)",
  marginBottom: theme.spacing(3),
  textAlign: "center",
  fontSize: "1rem",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
}));

const GlassButton = styled(Button)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: "white",
  fontWeight: "bold",
  padding: "12px 0",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.3)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    background: "rgba(255, 255, 255, 0.1)",
    color: "rgba(255, 255, 255, 0.5)",
    transform: "none",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
  },
  transition: "all 0.3s ease",
}));

const RegisterText = styled(Typography)(({ theme }) => ({
  color: "rgba(255, 255, 255, 0.9)",
  cursor: "pointer",
  fontWeight: 600,
  display: "inline",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    textDecoration: "underline",
    color: "white",
  },
  transition: "all 0.2s ease",
}));

const ForgotPasswordText = styled(Typography)(({ theme }) => ({
  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  paddingTop: theme.spacing(2),
  marginTop: theme.spacing(2),
  fontSize: "0.95rem",
  color: "rgba(255, 255, 255, 0.7)",
  fontStyle: "italic",
}));

const ForgotPasswordLink = styled(Typography)(({ theme }) => ({
  color: "rgba(255, 255, 255, 0.8)",
  cursor: "pointer",
  fontWeight: 500,
  display: "inline",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    textDecoration: "underline",
    color: "rgba(255, 255, 255, 0.95)",
  },
  transition: "all 0.2s ease",
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
}));

const GlassIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
}));

const GlassTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    color: "white",
    "& fieldset": {
      border: "none",
    },
    "&:hover": {
      background: "rgba(255, 255, 255, 0.15)",
    },
    "&.Mui-focused": {
      background: "rgba(255, 255, 255, 0.2)",
      boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.8)",
    "&.Mui-focused": {
      color: "white",
    },
  },
  "& .MuiOutlinedInput-input": {
    color: "white",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.6)",
    },
  },
  "& .MuiSvgIcon-root": {
    color: "rgba(255, 255, 255, 0.8)",
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleCloseForgot = () => {
    setShowForgotPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked! Submitting form...");

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassContainer>
      <GlassmorphismCard className="border-0">
        <FormContainer>
          <IconButton
            aria-label="close"
            onClick={() => navigate("/")}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              zIndex: 2,
              color: "rgba(255, 255, 255, 0.9)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(5px)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
              },
              width: 40,
              height: 40,
            }}
          >
            <CloseIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
          <IconContainer>
            <GlassIcon>
              <LoginIcon sx={{ fontSize: 40, color: "white" }} />
            </GlassIcon>
          </IconContainer>

          <FormTitle variant="h4" component="h1">
            Welcome Back
          </FormTitle>

          <FormSubtitle variant="body1">Sign in to your account</FormSubtitle>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <GlassTextField
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
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <GlassTextField
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
              disabled={isLoading}
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
                      disabled={isLoading}
                      sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />

            <GlassButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </GlassButton>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{ mb: 2, color: "rgba(255, 255, 255, 0.9)" }}
              >
                Don't have an account?{" "}
                <RegisterText
                  onClick={() => !isLoading && navigate("/register")}
                >
                  Register
                </RegisterText>
              </Typography>

              <ForgotPasswordText variant="body2">
                Forgot Password?{" "}
                <ForgotPasswordLink
                  onClick={() => !isLoading && setShowForgotPassword(true)}
                >
                  Reset
                </ForgotPasswordLink>
              </ForgotPasswordText>
              <ForgotPassword
                show={showForgotPassword}
                handleClose={handleCloseForgot}
              />
            </Box>
          </Box>
        </FormContainer>
      </GlassmorphismCard>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() =>
          navigate(
            userGroups?.includes("admin")
              ? "/admin-dashboard"
              : "/userdashboard"
          )
        }
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Login Successful
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have successfully logged in! Redirecting to your dashboard...
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button
            onClick={() =>
              navigate(
                userGroups?.includes("admin")
                  ? "/admin-dashboard"
                  : "/userdashboard"
              )
            }
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              boxShadow: "0 4px 10px rgba(37, 117, 252, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #5800c4 0%, #1a68e5 100%)",
              },
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
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Login Failed
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
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
    </GlassContainer>
  );
};

export default Login;
