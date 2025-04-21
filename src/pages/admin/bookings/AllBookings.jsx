import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp, 
  Edit, 
  Delete,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';
import { format } from 'date-fns';
import BookingModals from './BookingModals';
import API from '../../../api';

// Row component to handle the expandable functionality
function Row({ booking, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
          {booking.user.username || booking.user.email}
        </TableCell>
        <TableCell>{booking.service.name}</TableCell>
        <TableCell>{format(new Date(booking.event_date), 'MMM dd, yyyy')}</TableCell>
        <TableCell>
          <Chip 
            label={booking.status} 
            color={getStatusColor(booking.status)} 
            size="small" 
          />
        </TableCell>
        <TableCell align="right">
          <Tooltip title="Edit booking">
            <IconButton size="small" color="primary" onClick={() => onEdit(booking)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete booking">
            <IconButton size="small" color="error" onClick={() => onDelete(booking)}>
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
                    <TableCell component="th" scope="row">Time</TableCell>
                    <TableCell>{booking.event_time}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Location</TableCell>
                    <TableCell>{booking.event_location}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Booked at</TableCell>
                    <TableCell>{format(new Date(booking.booked_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">User ID</TableCell>
                    <TableCell>{booking.user.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Service ID</TableCell>
                    <TableCell>{booking.service.id}</TableCell>
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
function CustomPaginationDisplay({ page, rowsPerPage, totalCount, onPageChange }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'flex-end',
      padding: 2
    }}>
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
        {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
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
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [page, rowsPerPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Assuming your API supports pagination parameters
      const response = await API.get(`/admin-dashboard/?action=bookings&page=${page + 1}&per_page=${rowsPerPage}`);
      
      // Adjust this based on your actual API response structure
      setBookings(response.data.bookings || response.data);
      setTotalCount(response.data.total || response.data.length);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage, newRowsPerPage = rowsPerPage) => {
    setPage(newPage);
    if (newRowsPerPage !== rowsPerPage) {
      setRowsPerPage(newRowsPerPage);
    }
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
    console.log('Booking created:', newBooking);
    // Refresh will be handled by refreshData passed to BookingModals
  };

  const handleUpdateConfirm = (updatedBooking) => {
    console.log('Booking updated:', updatedBooking);
    // Refresh will be handled by refreshData passed to BookingModals
  };

  const handleDeleteConfirm = (bookingId) => {
    console.log('Booking deleted:', bookingId);
    // Refresh will be handled by refreshData passed to BookingModals
  };

  // Display only the current page of bookings
  const displayedBookings = bookings || [];

  if (loading && page === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && displayedBookings.length === 0) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h5" component="div" sx={{ padding: 2 }}>
          All Bookings
        </Typography>
        
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>User</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Event Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && displayedBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && displayedBookings.map((booking) => (
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
        refreshData={fetchBookings}
      />
    </>
  );
}