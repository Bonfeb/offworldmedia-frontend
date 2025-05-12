import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import {
  TextField,
  Select,
  InputLabel,
  FormControl,
  Box,
  MenuItem,
  Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import API from '../../../api';

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
  bookingToUpdate,
  refreshData,
}) => {
  const [updateFormValues, setUpdateFormValues] = useState({
    user_id: '',
    service_id: '',
    event_date: null,
    event_time: null,
    event_location: '',
    status: 'pending',
  });

  const [createFormValues, setCreateFormValues] = useState({
    user_id: '',
    service_id: '',
    event_date: null,
    event_time: null,
    event_location: '',
    status: 'pending',
  });

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, serviceRes] = await Promise.all([
          API.get('/admin-dashboard/?action=users'),
          API.get('/admin-dashboard/?action=services'),
        ]);
        console.log("Users and Services:", userRes, serviceRes);
        setUsers(userRes.data);
        setServices(serviceRes.data);
      } catch (err) {
        setError('Failed to load users or services');
      }
    };

    if (createOpen || updateOpen) {
      fetchData();
    }
  }, [createOpen, updateOpen]);

  useEffect(() => {
    if (bookingToUpdate) {
      setUpdateFormValues({
        user_id: bookingToUpdate.user?.id || '',
        service_id: bookingToUpdate.service?.id || '',
        event_date: bookingToUpdate.event_date ? new Date(bookingToUpdate.event_date) : null,
        event_time: bookingToUpdate.event_time ? new Date(`2000-01-01T${bookingToUpdate.event_time}`) : null,
        event_location: bookingToUpdate.event_location || '',
        status: bookingToUpdate.status || 'pending',
      });
    }
  }, [bookingToUpdate]);

  const handleCreateInputChange = (field, value) => {
    setCreateFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateInputChange = (field, value) => {
    setUpdateFormValues(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date) => date?.toISOString().split('T')[0] || null;
  const formatTime = (date) => date?.toTimeString().split(' ')[0] || null;

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
      await API.post('/admin-dashboard/', payload);
      onCreateConfirm(payload);
      onCreateClose();
      refreshData();
    } catch (err) {
      setError('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!bookingToUpdate) return;

    try {
      setIsLoading(true);
      const payload = {
        user_id: updateFormValues.user_id,
        service_id: updateFormValues.service_id,
        event_date: formatDate(updateFormValues.event_date),
        event_time: formatTime(updateFormValues.event_time),
        event_location: updateFormValues.event_location,
        status: updateFormValues.status,
      };
      await API.put(`/admin-dashboard/${bookingToUpdate.id}/`, payload);
      onUpdateConfirm(payload);
      onUpdateClose();
      refreshData();
    } catch (err) {
      setError('Failed to update booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await API.delete(`/admin-dashboard/${bookingToUpdate.id}/`);
      onDeleteConfirm(bookingToUpdate.id);
      onDeleteClose();
      refreshData();
    } catch (err) {
      setError('Failed to delete booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Create Booking Modal */}
      <Modal show={createOpen} onHide={onCreateClose} centered backdrop="static" size="lg">
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
                  onChange={(e) => handleCreateInputChange('user_id', e.target.value)}
                >
                  {users.map(user => (
                    <MenuItem key={`create-user-${user.id}`} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))}
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
                  onChange={(e) => handleCreateInputChange('service_id', e.target.value)}
                >
                  {services.map(service => (
                    <MenuItem key={`create-service-${service.id}`} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} key="create-date-grid">
              <DatePicker
                label="Event Date"
                value={createFormValues.event_date}
                onChange={(date) => handleCreateInputChange('event_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} key="create-time-grid">
              <TimePicker
                label="Event Time"
                value={createFormValues.event_time}
                onChange={(time) => handleCreateInputChange('event_time', time)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} key="create-location-grid">
              <TextField
                label="Event Location"
                value={createFormValues.event_location}
                onChange={(e) => handleCreateInputChange('event_location', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} key="create-status-grid">
              <FormControl fullWidth>
                <InputLabel id="create-status-label">Status</InputLabel>
                <Select
                  labelId="create-status-label"
                  value={createFormValues.status}
                  label="Status"
                  onChange={(e) => handleCreateInputChange('status', e.target.value)}
                >
                  <MenuItem value="pending" key="create-status-pending">Pending</MenuItem>
                  <MenuItem value="cancelled" key="create-status-cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed" key="create-status-completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCreateClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreateSubmit} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Booking Modal */}
      <Modal show={updateOpen} onHide={onUpdateClose} centered backdrop="static" size="lg">
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
                  onChange={(e) => handleUpdateInputChange('user_id', e.target.value)}
                >
                  {users.map(user => (
                    <MenuItem key={`update-user-${user.id}`} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))}
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
                  onChange={(e) => handleUpdateInputChange('service_id', e.target.value)}
                >
                  {services.map(service => (
                    <MenuItem key={`update-service-${service.id}`} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} key="update-date-grid">
              <DatePicker
                label="Event Date"
                value={updateFormValues.event_date}
                onChange={(date) => handleUpdateInputChange('event_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} key="update-time-grid">
              <TimePicker
                label="Event Time"
                value={updateFormValues.event_time}
                onChange={(time) => handleUpdateInputChange('event_time', time)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} key="update-location-grid">
              <TextField
                label="Event Location"
                value={updateFormValues.event_location}
                onChange={(e) => handleUpdateInputChange('event_location', e.target.value)}
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
                  onChange={(e) => handleUpdateInputChange('status', e.target.value)}
                >
                  <MenuItem value="pending" key="update-status-pending">Pending</MenuItem>
                  <MenuItem value="cancelled" key="update-status-cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed" key="update-status-completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onUpdateClose}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdateSubmit} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Booking Modal */}
      <Modal show={deleteOpen} onHide={onDeleteClose} centered backdrop="static">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this booking? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onDeleteClose}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </LocalizationProvider>
  );
};

export default BookingModals;