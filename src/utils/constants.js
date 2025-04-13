import API from "../api";

export const media_url = "https://offworldmedia-backend.onrender.com"

export const formatBookings = (bookings) => {
    return bookings.map((booking, index) => ({
      id: booking.id,
      serialNo: index + 1,
      customer: booking.user,
      service: booking.service?.name || 'Unknown Service',
      location: booking.event_location || 'N/A',
      eventDate: booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A',
      eventTime: booking.event_time || 'N/A',
      price: booking.service?.price || 0,
      status: booking.status || 'N/A',
      booked: booking.booked_at ? new Date(booking.booked_at).toLocaleString() : 'N/A',
      contact: booking.phone || N/A// Added rating for completed bookings
    }));
  };

  export const BOOKING_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'canceled'
  };

  export const handleUpdate = (id, bookings, setSelectedBooking, setUpdateModalOpen) => {
    console.log(`Update booking with ID: ${id}`);
    const bookingToUpdate = bookings.find((booking) => booking.id === id);
    if (bookingToUpdate) {
      setSelectedBooking(bookingToUpdate);
      setUpdateModalOpen(true);
    }
  };
  
  export const handleDelete = (id, bookings, setSelectedBooking, setDeleteModalOpen) => {
    const bookingToDelete = bookings.find((booking) => booking.id === id);
    if (bookingToDelete) {
      setSelectedBooking(bookingToDelete);
      setDeleteModalOpen(true);
    }
  };
  
  export const handleUpdateConfirm = async (
    updatedBooking,
    loadBookings,
    setNotification,
    setUpdateModalOpen,
    setSubmitting
  ) => {
    setSubmitting(true);
    try {
      await API.put(`/bookings/${updatedBooking.id}/`, updatedBooking);
      await loadBookings(); // Refresh bookings
      setNotification({ open: true, message: "Booking updated successfully", severity: "success" });
      setUpdateModalOpen(false);
    } catch (err) {
      console.error("Failed to update booking", err);
      setNotification({ open: true, message: "Failed to update booking", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };
  
  export const handleDeleteConfirm = async (
    id,
    bookings,
    setBookings,
    setNotification,
    setDeleteModalOpen,
    setSubmitting
  ) => {
    setSubmitting(true);
    try {
      await API.delete(`/bookings/${id}/`);
      setBookings(bookings.filter((booking) => booking.id !== id)); // Remove from state
      setNotification({ open: true, message: "Booking deleted successfully", severity: "success" });
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ open: true, message: "Failed to delete booking", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };
  
  export const SERVICE_CATEGORIES = {
    AUDIO: 'audio',
    VIDEO: 'video',
    PHOTO: 'photo'
  };

  export const handleServiceChange = (e, service, setService) => {
    const { name, value } = e.target;
    setService(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  export const handleServiceUpdate = async (serviceId, updatedService, onSuccess, onError) => {
    try {
      const response = await axios.put(`/service/${serviceId}/`, updatedService);
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      if (onError) onError(error);
      throw error;
    }
  };
  
  export const handleServiceDelete = async (serviceId, onSuccess, onError) => {
    try {
      await axios.delete(`/service/${serviceId}/`);
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      if (onError) onError(error);
      throw error;
    }
  };
  

  