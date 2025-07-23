import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

// MUI Components
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// MUI Icons
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  ShoppingCart,
  Edit,
  Image as ImageIcon,
  AttachMoney,
  ArrowBack,
  Check,
  Error as ErrorIcon,
} from "@mui/icons-material";

// React Bootstrap
import { Toast, ToastContainer } from "react-bootstrap";
import { format } from "date-fns";

// Styled Components using MUI's styled API
const StyledCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  color: "white",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    color: "white",
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "2px solid rgba(255, 255, 255, 0.5)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.8)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
  },
  "& input": {
    color: "white",
  },
  "& textarea": {
    color: "white",
  },
  "& input::placeholder": {
    color: "rgba(255, 255, 255, 0.6)",
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #667eea, #764ba2)",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  color: "white",
  fontWeight: "bold",
  padding: "16px 24px",
  fontSize: "1.1rem",
  textTransform: "none",
  "&:hover": {
    background: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
    transform: "translateY(-2px)",
  },
  transition: "all 0.3s ease",
}));

const EventDetails = () => {
  const { serviceId, bookingId } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);
  const [formData, setFormData] = useState({
    event_date: "",
    event_time: "",
    event_location: "",
    service_id: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    fetchServiceDetails();
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const response = await API.get(`/service/${serviceId}/`);
      setServiceData(response.data);
      setFormData((prevState) => ({
        ...prevState,
        service_id: serviceId,
      }));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching service details:", error);
      setErrorMessage("Failed to load service details.");
      setLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const response = await API.get(`/booking/${bookingId}/`);
      setFormData((prevState) => ({
        ...prevState,
        event_date: response.data.event_date || "",
        event_time: response.data.event_time || "",
        event_location: response.data.event_location || "",
        service_id: response.data.service.id || serviceId,
      }));
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setErrorMessage("Failed to load booking details.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`1970-01-01T${time}Z`).toTimeString().split(" ")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { event_date, event_time, event_location } = formData;
      const payload = {
        service_id: formData.service_id,
        event_date: formatDate(event_date),
        event_location,
        event_time: formatTime(event_time),
      };

      if (bookingId) {
        const response = await API.put(`/booking/${bookingId}/`, payload, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setSuccessMessage("Booking updated successfully!");
          setToastMessage("Booking Updated Successfully!");
          setToastType("success");
          setShowToast(true);
          setTimeout(() => navigate("/userdashboard"), 2000);
        }
      } else {
        const response = await API.post("/userdashboard/", payload, {
          withCredentials: true,
        });
        if (response.status === 201) {
          setSuccessMessage("Service added to cart successfully!");
          setToastMessage("Service added to cart successfully!");
          setToastType("success");
          setShowToast(true);
          setTimeout(() => navigate("/userdashboard"), 2000);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setErrorMessage("Failed to process your request.");
      setToastMessage("Failed to process your request.");
      setToastType("error");
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3c4043",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            color: "white",
          }}
        >
          <CircularProgress sx={{ color: "white", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "white" }}>
            Loading service details...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!serviceData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Typography variant="h6">Loading service details...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 2 },
        background: "#3c4043",
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Main Card */}
        <StyledCard>
          {/* Header */}
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{
                    color: "white",
                    background: "rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  {bookingId ? "Update Booking" : "Event Details"}
                </Typography>
              </Box>
              <Chip
                icon={bookingId ? <Edit /> : <ShoppingCart />}
                label={bookingId ? "Edit Mode" : "Add to Cart"}
                sx={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                }}
              />
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {/* Service Display */}
            <StyledCard sx={{ mb: 3, background: "rgba(255, 255, 255, 0.05)" }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: "relative" }}>
                      <img
                        src={serviceData?.image}
                        alt={serviceData?.category}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                      <Avatar
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                        }}
                      >
                        <ImageIcon />
                      </Avatar>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography
                      variant="h4"
                      sx={{ color: "white", mb: 2, fontWeight: 600 }}
                    >
                      {serviceData?.category}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ color: "#4ade80", fontWeight: 700 }}
                      >
                        KSH {serviceData?.price?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        lineHeight: 1.6,
                      }}
                    >
                      {serviceData?.description}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>

            {/* Error Alert */}
            {errorMessage && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{
                  mb: 3,
                  background: "rgba(239, 68, 68, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  "& .MuiAlert-icon": {
                    color: "#fca5a5",
                  },
                }}
              >
                {errorMessage}
              </Alert>
            )}

            {/* Form */}
            <StyledCard sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
              <CardContent>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        type="date"
                        name="event_date"
                        label="Event Date"
                        value={formData.event_date}
                        onChange={handleChange}
                        required
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday
                                sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        type="time"
                        name="event_time"
                        label="Event Time"
                        value={formData.event_time}
                        onChange={handleChange}
                        required
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTime
                                sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 4 }}>
                    <StyledTextField
                      fullWidth
                      multiline
                      rows={3}
                      name="event_location"
                      label="Event Location"
                      value={formData.event_location}
                      onChange={handleChange}
                      placeholder="Enter the event venue or location"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{ alignSelf: "flex-start", mt: 1 }}
                          >
                            <LocationOn
                              sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <GradientButton
                    type="submit"
                    fullWidth
                    size="large"
                    startIcon={bookingId ? <Edit /> : <ShoppingCart />}
                  >
                    {bookingId ? "Update Booking" : "Add To Cart"}
                  </GradientButton>
                </Box>
              </CardContent>
            </StyledCard>
          </CardContent>
        </StyledCard>

        {/* React Bootstrap Toast */}
        <ToastContainer position="bottom-end" className="p-3">
          <Toast
            show={showToast}
            onClose={() => setShowToast(false)}
            delay={4000}
            autohide
            bg={toastType === "success" ? "success" : "danger"}
          >
            <Toast.Header>
              {toastType === "success" ? (
                <Check className="me-2" />
              ) : (
                <ErrorIcon className="me-2" />
              )}
              <strong className="me-auto">
                {toastType === "success" ? "Success" : "Error"}
              </strong>
            </Toast.Header>
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Box>
    </Box>
  );
};

export default EventDetails;
