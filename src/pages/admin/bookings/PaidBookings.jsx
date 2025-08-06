import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Grid,
  TablePagination,
} from "@mui/material";
import { Search, Clear, GetApp } from "@mui/icons-material";
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
  downloadBookingsPdf,
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

  // Add state for search filters
  const [filters, setFilters] = useState({
    username: "",
    service: "",
    event_location: "",
  });

  // Add state for pagination
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    totalCount: 0,
  });

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      // Prepare API parameters
      const params = {
        action: "bookings",
        status: BOOKING_STATUS.PAID,
        page: pagination.page + 1, // Django typically uses 1-based pagination
        page_size: pagination.rowsPerPage,
      };

      // Add search filters if they have values (matching Django filter field names)
      if (filters.username.trim()) {
        params.username = filters.username.trim();
      }
      if (filters.service.trim()) {
        params.service = filters.service.trim();
      }
      if (filters.event_location.trim()) {
        params.event_location = filters.event_location.trim();
      }

      const response = await API.get("/admin-dashboard/", { params });
      
      console.log("API Response:", response.data);
      console.log('Response status:', response.status);
      
      // Handle paginated response
      let bookings = [];
      let totalCount = 0;
      
      if (response.data.results) {
        // If response is paginated with results array
        bookings = response.data.results;
        totalCount = response.data.count || response.data.total || 0;
      } else {
        // If response is a simple array
        bookings = response.data || [];
        totalCount = bookings.length;
      }

      console.log('Total bookings received:', bookings.length);
      console.log('Total count:', totalCount);
      
      const formattedBookings = formatBookings(bookings);
      
      setPaidBookings(formattedBookings);
      setPagination(prev => ({
        ...prev,
        totalCount: totalCount
      }));
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
  }, [pagination.page, pagination.rowsPerPage]);

  // Handle filter input changes
  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle search submission
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
    loadBookings();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      username: "",
      service: "",
      event_location: "",
    });
    setPagination(prev => ({ ...prev, page: 0 }));
    // Trigger search with cleared filters
    setTimeout(() => {
      loadBookings();
    }, 0);
  };

  // Handle pagination changes
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

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

  const handleDownloadPdf = () => {
    downloadBookingsPdf({
      endpoint: "/admin-dashboard/paid-bookings",
      filters: {
        status: BOOKING_STATUS.PAID,
        username: filters.username,
        service: filters.service,
        event_location: filters.event_location
      },
      pagination: { page: pagination.page, rowsPerPage: pagination.rowsPerPage },
      defaultFilename: "Offworldmedia_Paid_Bookings.pdf"
    });
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

        {/* Search Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Username"
                value={filters.username}
                onChange={handleFilterChange('username')}
                size="small"
                placeholder="Search by username..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Service"
                value={filters.service}
                onChange={handleFilterChange('service')}
                size="small"
                placeholder="Search by service..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Event Location"
                value={filters.event_location}
                onChange={handleFilterChange('event_location')}
                size="small"
                placeholder="Search by location..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {/* Download PDF Button */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={handleDownloadPdf}
              disabled={loading || paidBookings.length === 0}
            >
              Download PDF
            </Button>
          </Box>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {loading ? (
              "Loading..."
            ) : (
              `Showing ${paidBookings.length} of ${pagination.totalCount} paid bookings`
            )}
          </Typography>
        </Box>

        <BookingsTable
          bookings={paidBookings}
          bookingType="paid"
          onUpdate={handleEditClick}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        {/* Pagination */}
        {!loading && paidBookings.length > 0 && (
          <Paper elevation={1} sx={{ mt: 2 }}>
            <TablePagination
              component="div"
              count={pagination.totalCount}
              page={pagination.page}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
              }
            />
          </Paper>
        )}
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