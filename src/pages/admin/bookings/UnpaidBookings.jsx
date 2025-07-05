import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import BookingsTable from "./BookingsTable";
import BookingModals from "./BookingModals";
import API from "../../../api";
import {
  BOOKING_STATUS,
  formatBookings,
  handleDelete,
  handleDeleteConfirm,
  handleUpdate,
  handleUpdateConfirm,
} from "../../../utils/constants";

const UnpaidBookings = () => {
  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Add state for modals
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      // Make sure we're requesting UNPAID status, not canceled
      const response = await API.get("/admin-dashboard/", {
        params: {
          action: "bookings",
          status: BOOKING_STATUS.UNPAID,
        },
      });
      // Debug the response
      console.log("API Response:", response.data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      

      let bookings = response.data || [];
      console.log('Total bookings received:', bookings.length);
      let formattedBookings = formatBookings(bookings)
      
      setUnpaidBookings(formattedBookings);
      setError(null);
    } catch (err) {
      console.error("Failed to load unpaid bookings", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleEditClick = (booking) => {
    handleUpdate(booking, unpaidBookings, setSelectedBooking, setUpdateModalOpen);
  };

  const handleDeleteClick = (booking) => {
    handleDelete(booking, unpaidBookings, setSelectedBooking, setDeleteModalOpen);
  };

  const handleConfirmUpdate = (updatedBooking) => {
    handleUpdateConfirm(
      updatedBooking,
      loadBookings,
      setNotification,
      setUpdateModalOpen,
      setSubmitting
    );
  };
  
  const handleConfirmDelete = (booking) => {
    handleDeleteConfirm(
      booking,
      unpaidBookings,
      setUnpaidBookings,
      setNotification,
      setDeleteModalOpen,
      setSubmitting
    );
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Unpaid Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <BookingsTable
          bookings={unpaidBookings}
          bookingType="unpaid"
          onUpdate={handleEditClick}
          onDelete={handleDeleteClick}
          loading={loading}
        />
      </Box>

      {/* Add BookingModals component */}
      <BookingModals
        updateOpen={updateModalOpen}
        deleteOpen={deleteModalOpen}
        onUpdateClose={() => setUpdateModalOpen(false)}
        onDeleteClose={() => setDeleteModalOpen(false)}
        onUpdateConfirm={handleConfirmUpdate}
        onDeleteConfirm={handleConfirmDelete}
        updateBooking={selectedBooking}
        refreshData={loadBookings}
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

export default UnpaidBookings;
