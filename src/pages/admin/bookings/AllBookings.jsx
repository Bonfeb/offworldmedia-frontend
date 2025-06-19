import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { 
  Dashboard as DashboardIcon,
  Person as PersonIcon
 } from "@mui/icons-material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Delete,
  NavigateBefore,
  NavigateNext,
  Search,
  Clear,
} from "@mui/icons-material";
import {Row, Col} from "react-bootstrap";
import { format } from "date-fns";
import BookingModals from "./BookingModals";
import API from "../../../api";

// Row component to handle the expandable functionality
function Row({ booking, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {booking.user?.username || booking.user}
        </TableCell>
        <TableCell>{booking.service?.name || booking.service}</TableCell>
        <TableCell>
          {format(new Date(booking.event_date), "MMM dd, yyyy")}
        </TableCell>
        <TableCell>
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status)}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <Tooltip title="Edit booking">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(booking)}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete booking">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(booking)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Booking Details
              </Typography>
              <Table size="small" aria-label="booking details">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Event Time
                    </TableCell>
                    <TableCell>{booking.event_time}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Event Location
                    </TableCell>
                    <TableCell>{booking.event_location}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Booked at
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(booking.booked_at),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Customer Contact
                    </TableCell>
                    <TableCell>{booking.user?.phone || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Booking ID
                    </TableCell>
                    <TableCell>{booking.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Service ID
                    </TableCell>
                    <TableCell>
                      {booking.service?.id || booking.service}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// Custom pagination display component
function CustomPaginationDisplay({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
        Rows per page:
      </Typography>
      <FormControl size="small" sx={{ mr: 2, minWidth: 80 }}>
        <Select
          value={rowsPerPage}
          onChange={(e) => onPageChange(null, 0, e.target.value)}
          displayEmpty
        >
          {[5, 10, 25, 50].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
        {page * rowsPerPage + 1}–
        {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
      </Typography>
      <IconButton
        disabled={page === 0}
        onClick={(e) => onPageChange(e, page - 1)}
      >
        <NavigateBefore />
      </IconButton>
      <IconButton
        disabled={(page + 1) * rowsPerPage >= totalCount}
        onClick={(e) => onPageChange(e, page + 1)}
      >
        <NavigateNext />
      </IconButton>
    </Box>
  );
}

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Search functionality states
  const [filters, setFilters] = useState({
    user: "",
    service: "",
    event_location: "",
    status: "",
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!isSearchMode) {
      fetchBookings();
    }
  }, [page, rowsPerPage, isSearchMode]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Assuming your API supports pagination parameters
      const response = await API.get(
        `/admin-dashboard/?action=bookings&page=${
          page + 1
        }&per_page=${rowsPerPage}`
      );

      // Adjust this based on your actual API response structure
      setBookings(response.data.bookings || response.data);
      setTotalCount(response.data.total || response.data.length);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage, newRowsPerPage = rowsPerPage) => {
    setPage(newPage);
    if (newRowsPerPage !== rowsPerPage) {
      setRowsPerPage(newRowsPerPage);
    }
  };

  // Search functionality handlers
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    setSearched(true);
    setIsSearchMode(true);
    setPage(0); // Reset to first page when searching

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Add pagination to search
      params.append("page", "1");
      params.append("per_page", rowsPerPage.toString());

      const response = await API.get(
        `/admin-dashboard/?action=bookings${params.toString()}`
      );
      const bookingsData = response.data.bookings || response.data || [];
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(bookingsArray);
      setTotalCount(response.data.total || response.data.length);
    } catch (error) {
      console.error("Search error:", error);
      setBookings([]);
      setTotalCount(0);
      setError(
        "Failed to search bookings. Kindly try again using other variables."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setFilters({
      user: "",
      service: "",
      event_location: "",
      status: "",
    });
    setSearched(false);
    setIsSearchMode(false);
    setPage(0);
    setError(null);
    fetchBookings();
  };

  // Modal handlers
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setUpdateModalOpen(true);
  };

  const handleDeleteBooking = (booking) => {
    setSelectedBooking(booking);
    setDeleteModalOpen(true);
  };

  const handleCreateClose = () => {
    setCreateModalOpen(false);
  };

  const handleUpdateClose = () => {
    setUpdateModalOpen(false);
    setSelectedBooking(null);
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCreateConfirm = (newBooking) => {
    console.log("Booking created:", newBooking);
    // Refresh will be handled by refreshData passed to BookingModals
  };

  const handleUpdateConfirm = (updatedBooking) => {
    console.log("Booking updated:", updatedBooking);
    // Refresh will be handled by refreshData passed to BookingModals
  };

  const handleDeleteConfirm = (bookingId) => {
    console.log("Booking deleted:", bookingId);
    // Refresh will be handled by refreshData passed to BookingModals
  };

  const refreshData = () => {
    if (isSearchMode) {
      handleSearch();
    } else {
      fetchBookings();
    }
  };

  // Display only the current page of bookings
  const displayedBookings = bookings || [];

  if (loading && page === 0 && !isSearchMode) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
          }}
        >
          <Row className="align-items-center justify-content-between">
            <Col xs="auto">
              <Link to="/admin-dashboard" style={{ textDecoration: "none" }}>
                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center gap-2"
                  style={{
                    borderRadius: "25px",
                    padding: "10px 20px",
                    border: "2px solid #007bff",
                    fontWeight: "600",
                  }}
                >
                  <DashboardIcon fontSize="small" />
                  Back to Dashboard
                </Button>
              </Link>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                <PersonIcon sx={{ fontSize: 32, color: "#667eea" }} />
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, color: "#2c3e50", mb: 0 }}
                >
                  All Bookings
                </Typography>
              </div>
            </Col>
          </Row>
        </Paper>

        {/* Search Filters Section */}
        <Box sx={{ padding: 2 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Filters
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="User"
                    name="user"
                    value={filters.user}
                    onChange={handleFilterChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Service"
                    name="service"
                    value={filters.service}
                    onChange={handleFilterChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Event Location"
                    name="event_location"
                    value={filters.event_location}
                    onChange={handleFilterChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    size="small"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="canceled">Cancelled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  disabled={searchLoading}
                  startIcon={
                    searchLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Search />
                    )
                  }
                >
                  {searchLoading ? "Searching..." : "Search Bookings"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearSearch}
                  startIcon={<Clear />}
                  disabled={searchLoading}
                >
                  Clear Search
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Divider />

        <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
          <Table stickyHeader striped hover aria-label="collapsible table">
            <TableHead>
              <TableRow className="fw-bold">
                <TableCell />
                <TableCell>Customer</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Event Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(loading || searchLoading) && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && !searchLoading && displayedBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="textSecondary">
                      {searched && isSearchMode
                        ? "No search results found. Try again using different filters."
                        : "No bookings found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !searchLoading &&
                displayedBookings.map((booking) => (
                  <Row
                    key={booking.id}
                    booking={booking}
                    onEdit={handleEditBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <CustomPaginationDisplay
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
        />
      </Paper>

      {/* BookingModals component integration */}
      <BookingModals
        createOpen={createModalOpen}
        updateOpen={updateModalOpen}
        deleteOpen={deleteModalOpen}
        onCreateClose={handleCreateClose}
        onUpdateClose={handleUpdateClose}
        onDeleteClose={handleDeleteClose}
        onCreateConfirm={handleCreateConfirm}
        onUpdateConfirm={handleUpdateConfirm}
        onDeleteConfirm={handleDeleteConfirm}
        bookingToUpdate={selectedBooking}
        refreshData={refreshData}
      />
    </>
  );
}
