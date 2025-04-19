import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../../../api';

const BookingNotification = () => {
  const [latestBookings, setLatestBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date().toISOString());
  const [playSound, setPlaySound] = useState(true);
  
  const notificationSound = new Audio('/notification.wav')

  const fetchLatestBookings = async () => {
    setIsLoading(true);
    try {
      const response = await API.get('/bookings/', {
        params: {
          since: lastChecked
        },
        withCredentials: true,
      });
      
      if (response.data.admin_bookings?.latest_bookings) {
        const newBookings = response.data.admin_bookings.latest_bookings;
        setLatestBookings(newBookings);
        
        // Calculate new bookings since last check
        const newCount = newBookings.length;
        if (newCount > 0) {
          setUnreadCount(prev => prev + newCount);
          
          // Show toast for each new booking
          newBookings.forEach(booking => {
            try {
                notificationSound.play();
              } catch (err) {
                console.warn("Sound playback failed:", err);
              }
            toast.info(
              <div>
                <strong>New Booking!</strong>
                <div>{booking.user.username} booked {booking.service.name}</div>
                <small>{new Date(booking.created_at).toLocaleTimeString()}</small>
              </div>,
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark"
              }
            );
          });
        }
      }
    } catch (error) {
      console.error('Error fetching latest bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLatestBookings();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchLatestBookings, 30000);
    
    return () => clearInterval(interval);
  }, [lastChecked]);

  const markAsRead = () => {
    setUnreadCount(0);
    setLastChecked(new Date().toISOString());
  };

  return (
    <>
      <Dropdown show={showDropdown} onToggle={setShowDropdown}>
        <Dropdown.Toggle 
          as={CustomToggle} 
          unreadCount={unreadCount}
          onClick={() => {
            if (unreadCount > 0 && !showDropdown) {
              markAsRead();
            }
          }}
        />
        
        <Dropdown.Menu 
          style={{ 
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: '#1e213a',
            border: '1px solid #2e3347',
          }}
        >
          <Dropdown.Header className="d-flex justify-content-between align-items-center">
            <span>Recent Bookings</span>
            {unreadCount > 0 && (
              <small 
                style={{ cursor: 'pointer', color: '#4299e1' }}
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead();
                }}
              >
                Mark as read
              </small>
            )}
            <FontAwesomeIcon 
                icon={playSound ? faBell : faBellSlash}
                title={playSound ? 'Sound On' : 'Sound Off'}
                onClick={(e) => {
                  e.stopPropagation();
                  setPlaySound(!playSound);
                }}
                style={{
                  color: playSound ? '#38b2ac' : '#a0aec0',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginLeft: '10px'
                }}
              />
          </Dropdown.Header>
          
          {isLoading ? (
            <Dropdown.Item className="text-center py-3">
              <Spinner animation="border" size="sm" />
            </Dropdown.Item>
          ) : latestBookings.length === 0 ? (
            <Dropdown.Item className="text-center text-muted py-3">
              No recent bookings
            </Dropdown.Item>
          ) : (
            latestBookings.map(booking => (
              <Dropdown.Item 
                key={booking.id}
                className="py-2"
                onClick={() => {
                  // Navigate to booking or other action
                }}
              >
                <div className="d-flex align-items-start">
                  <FontAwesomeIcon 
                    icon={faCalendarAlt} 
                    className="me-2 mt-1 text-primary" 
                  />
                  <div>
                    <div className="fw-bold">{booking.service.name}</div>
                    <div>Status: <span className={`text-${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span></div>
                    <small className="text-muted">
                      {new Date(booking.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              </Dropdown.Item>
            ))
          )}
        </Dropdown.Menu>
      </Dropdown>
      
      <ToastContainer />
    </>
  );
};

// Helper function for status colors
const getStatusColor = (status) => {
  switch(status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'canceled': return 'danger';
    default: return 'secondary';
  }
};

// Custom toggle component remains the same
const CustomToggle = React.forwardRef(({ children, onClick, unreadCount }, ref) => (
  <span
    ref={ref}
    onClick={onClick}
    style={{ 
      cursor: 'pointer',
      position: 'relative',
      marginRight: '10px'
    }}
  >
    <FontAwesomeIcon icon={faBell} />
    {unreadCount > 0 && (
      <span 
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          backgroundColor: '#f56565',
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {unreadCount}
      </span>
    )}
  </span>
));

export default BookingNotification;