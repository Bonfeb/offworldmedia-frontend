import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Toast } from "react-bootstrap";
import { CalendarToday, AccessTime, LocationOn } from "@mui/icons-material";
import { format } from "date-fns";

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
    } catch (error) {
      console.error("Error fetching service details:", error);
      setErrorMessage("Failed to load service details.");
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
    }
  };

  const toggleShowToast = () => setShowToast(!showToast);

  if (!serviceData) {
    return <Typography align="center" mt={5}>Loading service details...</Typography>;
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #182C0B, #089494, #174214)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, md: 5 },
      }}
    >
      <Card
        sx={{
          width: { xs: "100%", md: "50%" },
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <CardHeader
          title={
            <Typography variant="h5" align="center">
              {bookingId ? "Update Booking" : "Fill Event Details"}
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                component="img"
                src={serviceData.image}
                alt={serviceData.name}
                sx={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6">{serviceData.name}</Typography>
              <Typography>
                <strong>Price:</strong> KSH {serviceData.price}
              </Typography>
            </Grid>
          </Grid>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Date"
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <CalendarToday color="action" />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Time"
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AccessTime color="action" />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Location"
                  type="text"
                  name="event_location"
                  value={formData.event_location}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <LocationOn color="action" />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  sx={{ mt: 2, backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#115293" } }}
                >
                  {bookingId ? "Update Booking" : "Add To Cart"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Toast
        show={showToast}
        onClose={toggleShowToast}
        delay={3000}
        autohide
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          minWidth: "250px",
          backgroundColor: toastType === "success" ? "#28a745" : "#dc3545",
          color: "#fff",
        }}
      >
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Container>
  );
};

export default EventDetails;