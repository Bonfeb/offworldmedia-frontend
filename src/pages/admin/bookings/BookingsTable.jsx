import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Box, Button, CircularProgress, Alert, Collapse
} from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const BookingRow = ({ row, onUpdate, onDelete, isStriped }) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditClick = (event) => {
    event.stopPropagation(); // Prevent row expansion when clicking edit
    console.log('Edit clicked for row ID:', row);
    onUpdate(row);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Prevent row expansion when clicking delete
    onDelete(row.id);
  };

  return (
    <>
      <TableRow 
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          backgroundColor: isHovered ? 'action.hover' : (isStriped ? 'grey.50' : 'background.paper'),
          '&:hover': {
            backgroundColor: 'action.hover',
            cursor: 'pointer'
          },
          '& .MuiTableCell-root': {
            py: 1.5
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.serialNo}</TableCell>
        <TableCell>{row.customer}</TableCell>
        <TableCell>{row.service}</TableCell>
        <TableCell>{row.location}</TableCell>
        <TableCell>{row.eventDate}</TableCell>
        <TableCell>
          <IconButton color="primary" onClick={handleEditClick}>
            <FontAwesomeIcon icon={faEdit} />
          </IconButton>
          <IconButton color="error" onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ 
              margin: 1,
              backgroundColor: isStriped ? 'grey.50' : 'background.paper',
              borderRadius: 1,
              p: 2
            }}>
              <Table size="small" aria-label="additional details">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Booking ID:</TableCell>
                    <TableCell>{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Customer Contact:</TableCell>
                    <TableCell>{row.contact}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Event Time:</TableCell>
                    <TableCell>{row.eventTime || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Booked At:</TableCell>
                    <TableCell>{row.booked || 'N/A'}</TableCell>
                  </TableRow>
                  
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const BookingsTable = ({ bookings, onUpdate, onDelete, loading, bookingType = "pending" }) => {
  return (
    <Paper sx={{ 
      width: '100%', 
      overflow: 'hidden',
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ p: 2 }}>
        <Button
          component={Link}
          to="/admin-dashboard"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
      
      <TableContainer sx={{ 
        maxHeight: 'calc(100vh - 200px)',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'grey.400',
          borderRadius: '4px'
        }
      }}>
        <Table stickyHeader aria-label="bookings table" sx={{
          '& .MuiTableCell-root': {
            borderBottom: '1px solid',
            borderColor: 'divider'
          },
          '& .MuiTableHead-root': {
            '& .MuiTableRow-root': {
              backgroundColor: 'background.paper',
              '& .MuiTableCell-root': {
                color: 'text.primary',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                py: 2,
                backgroundColor: 'background.paper',
                borderBottom: '2px solid',
                borderColor: 'divider',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }
            }
          }
        }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '50px' }} />
              <TableCell sx={{ fontWeight: 'bold' }}>S/No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Event Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Event Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : bookings.length > 0 ? (
              bookings.map((row, index) => (
                <BookingRow
                  key={row.id}
                  row={row}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  isStriped={index % 2 !== 0}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No {bookingType} bookings found.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BookingsTable;