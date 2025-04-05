import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Alert, Snackbar } from "@mui/material";
import BookingsTable from "./BookingsTable";
import BookingModals from "./BookingModals";
import API from "../../../api/";
import {
  BOOKING_STATUS,
  formatBookings,
  handleDelete,
  handleUpdate,
  handleUpdateConfirm,
  handleDeleteConfirm,
} from "../../../utils/constants";

const CompletedBookings = () => {
  const [completedBookings, setCompletedBookings] = useState([]);
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
      const response = await API.get("/bookings/", {
        params: {
          status: BOOKING_STATUS.COMPLETED,
        },
      });

      let bookings = [];

      if (
        response.data &&
        response.data.admin_bookings &&
        response.data.admin_bookings.completed_bookings
      ) {
        bookings = response.data.admin_bookings.completed_bookings;
      }

      const formattedBookings = formatBookings(bookings);

      setCompletedBookings(formattedBookings);
      setError(null);
    } catch (err) {
      console.error("Failed to load completed bookings", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleEditClick = (id) =>
    handleUpdate(id, completedBookings, setSelectedBooking, setUpdateModalOpen);

  const handleDeleteClick = (id) =>
    handleDelete(id, completedBookings, setSelectedBooking, setDeleteModalOpen);

  const handleConfirmUpdate = (updatedBooking) =>
    handleUpdateConfirm(
      updatedBooking,
      loadBookings,
      setNotification,
      setUpdateModalOpen,
      setSubmitting
    );

  const handleConfirmDelete = (id) =>
    handleDeleteConfirm(
      id,
      completedBookings,
      setCompletedBookings,
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
        <Typography variant="h4" component="h1" gutterBottom>
          Completed Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <BookingsTable
          bookings={completedBookings}
          bookingType="completed"
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
        bookingToUpdate={selectedBooking}
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

export default CompletedBookings;
