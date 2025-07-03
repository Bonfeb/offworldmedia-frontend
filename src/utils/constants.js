import API from "../api";

export const formatBookings = (bookings) => {
    return bookings.map((booking, index) => ({
      id: booking.id,
      user_id: booking.user.id || booking.user_id || null,
      service_id: booking.service?.id || null,
      serialNo: index + 1,
      customer: booking.user?.username || 'Unknown User',
      service: booking.service?.name || 'Unknown Service',
      audio_category: booking.service.audio_category,
      location: booking.event_location || 'N/A',
      eventDate: booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A',
      eventTime: booking.event_time || 'N/A',
      price: booking.service?.price || 0,
      status: booking.status || 'N/A',
      booked: booking.booked_at ? new Date(booking.booked_at).toLocaleString() : 'N/A',
      contact: booking.phone || null // Added rating for completed bookings
    }));
  };

  export const BOOKING_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  export const handleUpdate = (booking, bookings, setSelectedBooking, setUpdateModalOpen) => {
    console.log("Updating Booking:", booking);
    setSelectedBooking(booking)
    setUpdateModalOpen(true)
  };
  
  export const handleDelete = (booking, bookings, setSelectedBooking, setDeleteModalOpen) => {
    if (booking) {
      setSelectedBooking(booking);
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
      await API.put(`/admin-booking/${updatedBooking.id}/`, updatedBooking);
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
    booking,
    bookings,
    setBookings,
    setNotification,
    setDeleteModalOpen,
    setSubmitting
  ) => {
    setSubmitting(true);
    try {
      await API.delete(`/admin-booking/${booking.id}/`);
      setBookings(bookings.filter((b) => b.id !== booking.id)); // Remove from state
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
  

  