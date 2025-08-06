import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Paper,
  TextField,
  Grid,
  Button,
  TablePagination,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Search, Clear, GetApp } from "@mui/icons-material";
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
  downloadBookingsPdf,
} from "../../../utils/constants";
import { set } from "lodash";

const CompletedBookings = () => {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Search and pagination state
  const [filters, setFilters] = useState({
    username: "",
    service: "",
    event_location: "",
  });

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    totalCount: 0,
  });

  // Modal states
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);

  const loadBookings = useCallback(
    async (searchFilters = filters, paginationParams = pagination) => {
      try {
        setLoading(true);

        // Prepare API parameters
        const params = {
          action: "bookings",
          status: BOOKING_STATUS.COMPLETED,
          page: paginationParams.page + 1, // Django uses 1-based pagination
          page_size: paginationParams.rowsPerPage,
        };

        // Add search filters (excluding empty values)
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value && value.trim()) {
            params[key] = value.trim();
          }
        });

        const response = await API.get("/admin-dashboard/", { params });

        console.log("API Response:", response.data);

        // Handle both paginated and non-paginated responses
        let bookings, totalCount;

        if (response.data.results) {
          // Paginated response
          bookings = response.data.results || [];
          totalCount = response.data.count || 0;
        } else {
          // Non-paginated response (fallback)
          bookings = response.data || [];
          totalCount = bookings.length;
        }

        console.log("Total bookings received:", bookings.length);
        console.log("Total count:", totalCount);

        const formattedBookings = formatBookings(bookings);
        setCompletedBookings(formattedBookings);

        // Update pagination with total count
        setPagination((prev) => ({
          ...prev,
          totalCount: totalCount,
        }));

        setError(null);
      } catch (err) {
        console.error("Failed to load completed bookings", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination]
  );

  // Initial load
  useEffect(() => {
    loadBookings();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Handle filter changes with debouncing
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      const resetPagination = { ...pagination, page: 0 };
      setPagination(resetPagination);
      loadBookings(newFilters, resetPagination);
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);
  };

  // Handle immediate search
  const handleSearchClick = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const resetPagination = { ...pagination, page: 0 };
    setPagination(resetPagination);
    loadBookings(filters, resetPagination);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      username: "",
      service: "",
      event_location: "",
    };
    setFilters(clearedFilters);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const resetPagination = { ...pagination, page: 0 };
    setPagination(resetPagination);
    loadBookings(clearedFilters, resetPagination);
  };

  // Handle pagination changes
  const handlePageChange = (event, newPage) => {
    const newPagination = { ...pagination, page: newPage };
    setPagination(newPagination);
    loadBookings(filters, newPagination);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const newPagination = {
      ...pagination,
      rowsPerPage: newRowsPerPage,
      page: 0, // Reset to first page when changing page size
    };
    setPagination(newPagination);
    loadBookings(filters, newPagination);
  };

  // Modal handlers
  const handleEditClick = (booking) =>
    handleUpdate(
      booking,
      completedBookings,
      setSelectedBooking,
      setUpdateModalOpen
    );

  const handleDeleteClick = (booking) =>
    handleDelete(
      booking,
      completedBookings,
      setSelectedBooking,
      setDeleteModalOpen
    );

  const handleConfirmUpdate = (updatedBooking) =>
    handleUpdateConfirm(
      updatedBooking,
      () => loadBookings(filters, pagination), // Reload with current filters and pagination
      setSnackbar,
      setUpdateModalOpen,
      setSubmitting
    );

  const handleConfirmDelete = (booking) =>
    handleDeleteConfirm(
      booking,
      completedBookings,
      setCompletedBookings,
      setSnackbar,
      setDeleteModalOpen,
      setSubmitting,
      () => loadBookings(filters, pagination) // Reload after delete
    );

  const handleDownloadPdf = () => {
    downloadBookingsPdf({
      endpoint: "/admin-dashboard/",
      filters: {
        status: BOOKING_STATUS.COMPLETED,
        username: filters.username,
        service: filters.service,
        event_location: filters.event_location,
      },
      pagination: {
        page: pagination.page,
        rowsPerPage: pagination.rowsPerPage,
      },
      defaultFilename: "Offworldmedia_Completed_Bookings.pdf",
    }).then((res) => {
      if (res.success) {
        setSnackbar({
          open: true,
          message: "PDF downloaded successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to download PDF",
          severity: "error",
        });
      }
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value.trim()
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Completed Bookings
          </Typography>

          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={handleDownloadPdf}
            disabled={loading}
          >
            Download PDF
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search & Filter
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Username"
                value={filters.username}
                onChange={(e) => handleFilterChange("username", e.target.value)}
                placeholder="Search by username..."
                size="small"
                InputProps={{
                  endAdornment: filters.username && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange("username", "")}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Service"
                value={filters.service}
                onChange={(e) => handleFilterChange("service", e.target.value)}
                placeholder="Search by service..."
                size="small"
                InputProps={{
                  endAdornment: filters.service && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange("service", "")}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Event Location"
                value={filters.event_location}
                onChange={(e) =>
                  handleFilterChange("event_location", e.target.value)
                }
                placeholder="Search by location..."
                size="small"
                InputProps={{
                  endAdornment: filters.event_location && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange("event_location", "")}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearchClick}
                  disabled={loading}
                  size="small"
                >
                  Search
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    disabled={loading}
                    size="small"
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Results summary */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {loading
                ? "Loading..."
                : `Showing ${completedBookings.length} of ${pagination.totalCount} completed bookings`}
            </Typography>

            {hasActiveFilters && (
              <Typography variant="body2" color="primary">
                Filters active
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Bookings Table */}
        <Paper>
          <BookingsTable
            bookings={completedBookings}
            bookingType="completed"
            onUpdate={handleEditClick}
            onDelete={handleDeleteClick}
            loading={loading}
          />

          {/* Pagination */}
          <TablePagination
            component="div"
            count={pagination.totalCount}
            page={pagination.page}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
            sx={{
              borderTop: 1,
              borderColor: "divider",
              ".MuiTablePagination-toolbar": {
                paddingLeft: 2,
                paddingRight: 2,
              },
            }}
          />
        </Paper>
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
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompletedBookings;
