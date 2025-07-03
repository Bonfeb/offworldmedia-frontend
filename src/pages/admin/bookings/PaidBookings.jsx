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

const PaidBookings = () => {
  const [paidBookings, setPaidBookings] = useState([]);
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
      // Make sure we're requesting PAID status, not canceled
      const response = await API.get("/admin-dashboard/", {
        params: {
          action: "bookings",
          status: BOOKING_STATUS.PAID,
        },
      });
      // Debug the response
      console.log("API Response:", response.data);

      let bookings = response.data || [];
      let formattedBookings = formatBookings(bookings)
      
      setPaidBookings(formattedBookings);
      setError(null);
    } catch (err) {
      console.error("Failed to load paid bookings", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleEditClick = (booking) => {
    handleUpdate(booking, paidBookings, setSelectedBooking, setUpdateModalOpen);
  };

  const handleDeleteClick = (booking) => {
    handleDelete(booking, paidBookings, setSelectedBooking, setDeleteModalOpen);
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
      paidBookings,
      setPaidBookings,
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
          Paid Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <BookingsTable
          bookings={paidBookings}
          bookingType="paid"
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

export default PaidBookings;
