import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Alert, Snackbar } from "@mui/material";
import BookingsTable from "./BookingsTable";
import BookingModals from "./BookingModals";
import API from "../../../api";
import {
  BOOKING_STATUS,
  formatBookings,
  handleUpdate,
  handleDelete,
  handleDeleteConfirm,
  handleUpdateConfirm,
} from "../../../utils/constants";

const CancelledBookings = () => {
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin-dashboard/", {
        params: {
          action: "bookings",
          status: BOOKING_STATUS.CANCELLED,
        },
      });
      console.log("API Response:", response.data);

      let bookings = response.data || [];
      let formattedBookings = formatBookings(bookings)
      setCancelledBookings(formattedBookings);
      setError(null);
    } catch (err) {
      console.error("Failed to load cancelled bookings", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleEditClick = (booking) =>
    handleUpdate(booking, cancelledBookings, setSelectedBooking, setUpdateModalOpen);

  const handleDeleteClick = (booking) =>
    handleDelete(booking, cancelledBookings, setSelectedBooking, setDeleteModalOpen);

  const handleConfirmUpdate = (updatedBooking) =>
    handleUpdateConfirm(
      updatedBooking,
      loadBookings,
      setNotification,
      setUpdateModalOpen,
      setSubmitting
    );

  const handleConfirmDelete = (booking) =>
    handleDeleteConfirm(
      booking,
      cancelledBookings,
      setCancelledBookings,
      setNotification,
      setDeleteModalOpen,
      setSubmitting
    );

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className="text-danger"
        >
          Cancelled Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <BookingsTable
          bookings={cancelledBookings}
          bookingType="cancelled"
          onUpdate={handleEditClick}
          onDelete={handleDeleteClick}
          loading={loading}
        />
      </Box>

      <BookingModals
        updateOpen={updateModalOpen}
        deleteOpen={deleteModalOpen}
        onUpdateClose={() => setUpdateModalOpen(false)}
        onDeleteClose={() => setDeleteModalOpen(false)}
        onUpdateConfirm={handleConfirmUpdate}
        onDeleteConfirm={handleConfirmDelete}
        updateBooking={selectedBooking}
        isLoading={submitting}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CancelledBookings;
