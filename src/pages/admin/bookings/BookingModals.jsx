import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import {
  TextField,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert as MuiAlert,
  MenuItem,
  Grid,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import API from "../../../api";
import {
  handleDeleteConfirm,
  handleUpdateConfirm,
} from "../../../utils/constants";

const BookingModals = ({
  createOpen,
  updateOpen,
  deleteOpen,
  onCreateClose,
  onUpdateClose,
  onDeleteClose,
  onCreateConfirm,
  onUpdateConfirm,
  onDeleteConfirm,
  updateBooking,
  refreshData,
}) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateFormValues, setUpdateFormValues] = useState({
    user_id: "",
    service_id: "",
    event_date: null,
    event_time: null,
    event_location: "",
    status: "",
    audio_category: "",
  });

  const [createFormValues, setCreateFormValues] = useState({
    user_id: "",
    service_id: "",
    event_date: null,
    event_time: null,
    event_location: "",
    status: "unpaid",
  });

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [success, setSuccess] = useState("");
  const AUDIO_SUBCATEGORY_CHOICES = [
    { value: "beat_making", label: "Beat Making" },
    { value: "sound_recording", label: "Sound Recording" },
    { value: "mixing", label: "Mixing" },
    { value: "mastering", label: "Mastering" },
    { value: "music_video", label: "Music Video Production" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, serviceRes] = await Promise.all([
          API.get("/admin-users/"),
          API.get("/services/"),
        ]);
        const userData = Array.isArray(userRes.data) ? userRes.data : [];
        const serviceData = Array.isArray(serviceRes.data.services)
          ? serviceRes.data.services
          : [];
        console.log("Users:", userData);
        console.log("Services:", serviceData);
        setUsers(userData);
        setServices(serviceData);
      } catch (err) {
        setError("Failed to load users or services");
        setUsers([]);
        setServices([]);
      }
    };

    if (createOpen || updateOpen) {
      fetchData();
    }
  }, [createOpen, updateOpen]);

  const selectedService = services.find(
    (service) => service.id === updateFormValues.service_id
  );
  const isAudioCategory = selectedService?.category === "audio";

  useEffect(() => {
    if (updateBooking) {
      setSelectedBooking(updateBooking);
      setUpdateFormValues({
        user_id: updateBooking.user_id || "",
        service_id: updateBooking.service_id || "",
        event_date: updateBooking.eventDate
          ? new Date(updateBooking.eventDate)
          : null,
        event_time: updateBooking.eventTime
          ? new Date(`2000-01-01T${updateBooking.eventTime}`)
          : null,
        event_location: updateBooking.location || "",
        status: updateBooking.status || "uunpaid",
        audio_category: updateBooking.audio_category || "",
      });
    } else {
      setSelectedBooking(null);
      setUpdateFormValues({
        user_id: "",
        service_id: "",
        event_date: null,
        event_time: null,
        event_location: "",
        status: "unpaid",
        audio_category: "",
      });
    }
  }, [updateBooking]);

  const handleCreateInputChange = (field, value) => {
    setCreateFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateInputChange = (field, value) => {
    setUpdateFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (date) => date?.toISOString().split("T")[0] || null;
  const formatTime = (date) => date?.toTimeString().split(" ")[0] || null;

  const handleCreateSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = {
        user_id: createFormValues.user_id,
        service_id: createFormValues.service_id,
        event_date: formatDate(createFormValues.event_date),
        event_time: formatTime(createFormValues.event_time),
        event_location: createFormValues.event_location,
        status: createFormValues.status,
      };
      console.log("Payload: ", payload);
      await API.post("/admin-dashboard/", payload, 
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      onCreateConfirm(payload);
      onCreateClose();
      refreshData();
      setSnackbar({
        open: true,
        message: "Booking created successfully",
        severity: "success",
      });
    } catch (err) {
      setError("Failed to create booking");
      setSnackbar({
        open: true,
        message: "Failed to create booking",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedBooking) return;

    try {
      setIsLoading(true);
      const payload = {
        user_id: updateBooking.user_id || "",
        service_id: updateBooking.service_id || "",
        event_date: updateBooking.eventDate
          ? new Date(updateBooking.eventDate)
          : null,
        event_time: updateBooking.eventTime
          ? new Date(`2000-01-01T${updateBooking.eventTime}`)
          : null,
        event_location: updateBooking.location || "",
        status: updateBooking.status || "unpaid",
        audio_category: updateBooking.audio_category || "",
      };
      console.log("Payload and Selected Booking:", payload, selectedBooking);
      await API.put(`/admin-booking/${selectedBooking.id}/`, payload, {
        withCredentials: true,
      });
      const updatedBooking = { ...selectedBooking, ...payload };
      onUpdateConfirm(updatedBooking);
      onUpdateClose();
      refreshData();
      setSnackbar({
        open: true,
        message: "Booking updated successfully",
        severity: "success",
      });
    } catch (err) {
      setError("Failed to update booking");
      setSnackbar({
        open: true,
        message: "Failed to update booking",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await API.delete(
        `/admin-booking/${selectedBooking.id}?type=booking&confirm=true`
      );
      onDeleteConfirm(selectedBooking);
      onDeleteClose();
      refreshData();
      setSnackbar({
        open: true,
        message: "Booking deleted successfully",
        severity: "success",
      });
    } catch (err) {
      setError("Failed to delete booking");
      setSnackbar({
        open: true,
        message: "Failed to delete booking",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Create Booking Modal */}
      <Modal
        show={createOpen}
        onHide={onCreateClose}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} key="create-user-grid">
              <FormControl fullWidth>
                <InputLabel id="create-user-label">User</InputLabel>
                <Select
                  labelId="create-user-label"
                  value={createFormValues.user_id}
                  label="User"
                  onChange={(e) =>
                    handleCreateInputChange("user_id", e.target.value)
                  }
                >
                  {users?.length === 0 ? (
                    <MenuItem value="" disabled>
                      Loading users...
                    </MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={`create-user-${user.id}`} value={user.id}>
                        {user.username}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} key="create-service-grid">
              <FormControl fullWidth>
                <InputLabel id="create-service-label">Service</InputLabel>
                <Select
                  labelId="create-service-label"
                  value={createFormValues.service_id}
                  label="Service"
                  onChange={(e) =>
                    handleCreateInputChange("service_id", e.target.value)
                  }
                >
                  {services.length === 0 ? (
                    <MenuItem value="" disabled>
                      Loading services...
                    </MenuItem>
                  ) : (
                    services.map((service) => (
                      <MenuItem
                        key={`create-service-${service.id}`}
                        value={service.id}
                      >
                        {service.category}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} key="create-date-grid">
              <DatePicker
                label="Event Date"
                value={createFormValues.event_date}
                onChange={(date) => handleCreateInputChange("event_date", date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} key="create-time-grid">
              <TimePicker
                label="Event Time"
                value={createFormValues.event_time}
                onChange={(time) => handleCreateInputChange("event_time", time)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} key="create-location-grid">
              <TextField
                label="Event Location"
                value={createFormValues.event_location}
                onChange={(e) =>
                  handleCreateInputChange("event_location", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} key="create-status-grid">
              <FormControl fullWidth>
                <InputLabel id="create-status-label">Status</InputLabel>
                <Select
                  labelId="create-status-label"
                  value={createFormValues.status || "unpaid"}
                  label="Status"
                  onChange={(e) =>
                    handleCreateInputChange("status", e.target.value)
                  }
                >
                  <MenuItem value="unpaid" key="create-status-unpaid">
                    Unpaid
                  </MenuItem>
                  <MenuItem value="paid" key="create-status-paid">
                    Paid
                  </MenuItem>
                  <MenuItem value="completed" key="create-status-completed">
                    Completed
                  </MenuItem>
                  <MenuItem value="cancelled" key="create-status-cancelled">
                    Cancelled
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCreateClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Spinner animation="border" size="sm" /> : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Booking Modal */}
      <Modal
        show={updateOpen}
        onHide={onUpdateClose}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} key="update-user-grid">
              <FormControl fullWidth>
                <InputLabel id="update-user-label">User</InputLabel>
                <Select
                  labelId="update-user-label"
                  value={updateFormValues.user_id}
                  label="User"
                  onChange={(e) =>
                    handleUpdateInputChange("user_id", e.target.value)
                  }
                >
                  {users.length === 0 ? (
                    <MenuItem value="" disabled>
                      Loading users...
                    </MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={`update-user-${user.id}`} value={user.id}>
                        {user.username}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} key="update-service-grid">
              <FormControl fullWidth>
                <InputLabel id="update-service-label">Service</InputLabel>
                <Select
                  labelId="update-service-label"
                  value={updateFormValues.service_id}
                  label="Service"
                  onChange={(e) =>
                    handleUpdateInputChange("service_id", e.target.value)
                  }
                >
                  {services.length === 0 ? (
                    <MenuItem value="" disabled>
                      Loading services...
                    </MenuItem>
                  ) : (
                    services.map((service) => (
                      <MenuItem
                        key={`update-service-${service.id}`}
                        value={service.id}
                      >
                        {service.category}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            {isAudioCategory && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="audio-subcategory-label">
                    Audio Subcategory
                  </InputLabel>
                  <Select
                    labelId="audio-subcategory-label"
                    value={updateFormValues.audio_category || ""}
                    label="Audio Subcategory"
                    onChange={(e) =>
                      handleUpdateInputChange("audio_category", e.target.value)
                    }
                  >
                    {[
                      { value: "beat_making", label: "Beat Making" },
                      { value: "sound_recording", label: "Sound Recording" },
                      { value: "mixing", label: "Mixing" },
                      { value: "mastering", label: "Mastering" },
                      { value: "music_video", label: "Music Video Production" },
                    ].map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6} key="update-date-grid">
              <DatePicker
                label="Event Date"
                value={updateFormValues.event_date}
                onChange={(date) => handleUpdateInputChange("event_date", date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} key="update-time-grid">
              <TimePicker
                label="Event Time"
                value={updateFormValues.event_time}
                onChange={(time) => handleUpdateInputChange("event_time", time)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} key="update-location-grid">
              <TextField
                label="Event Location"
                value={updateFormValues.event_location}
                onChange={(e) =>
                  handleUpdateInputChange("event_location", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} key="update-status-grid">
              <FormControl fullWidth>
                <InputLabel id="update-status-label">Status</InputLabel>
                <Select
                  labelId="update-status-label"
                  value={updateFormValues.status}
                  label="Status"
                  onChange={(e) =>
                    handleUpdateInputChange("status", e.target.value)
                  }
                >
                  <MenuItem value="unpaid" key="update-status-unpaid">
                    Unpaid
                  </MenuItem>
                  <MenuItem value="paid" key="update-status-paid">
                    Paid
                  </MenuItem>
                  <MenuItem value="completed" key="update-status-completed">
                    Completed
                  </MenuItem>
                  <MenuItem value="cancelled" key="update-status-cancelled">
                    Cancelled
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onUpdateClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Spinner animation="border" size="sm" /> : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Booking Modal */}
      <Modal
        show={deleteOpen}
        onHide={onDeleteClose}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this booking? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onDeleteClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        key="snackbar"
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
          style={{
            backgroundColor:
              snackbar.severity === "error" ? "#f44336" : "#4caf50",
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default BookingModals;
