import React, { useState, useEffect } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faBellSlash,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../../api";

const BookingNotification = ({ showDropdown, setShowDropdown }) => {
  const [latestBookings, setLatestBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date().toISOString());
  const [playSound, setPlaySound] = useState(true);

  const notificationSound = new Audio("/notification.wav");

  const fetchLatestBookings = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/bookings/", {
        params: {
          since: lastChecked,
        },
        withCredentials: true,
      });

      if (response.data.admin_bookings?.latest_bookings) {
        const newBookings = response.data.admin_bookings.latest_bookings;
        setLatestBookings(newBookings);

        // Calculate new bookings since last check
        const newCount = newBookings.length;
        if (newCount > 0) {
          setUnreadCount((prev) => prev + newCount);

          // Show toast for each new booking
          newBookings.forEach((booking) => {
            try {
              notificationSound.play();
            } catch (err) {
              console.warn("Sound playback failed:", err);
            }
            toast.info(
              <div style={{ color: "yellow", wordBreak: "break-word" }}>
                <strong style={{ color: "red" }}>New Booking!</strong>
                <div>
                  {booking.user.username} booked {booking.service.name}
                </div>
                <small>
                  {new Date(booking.created_at).toLocaleTimeString()}
                </small>
              </div>,
              {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                className: "toast-container-no-scroll",
              }
            );
          });
        }
      }
    } catch (error) {
      console.error("Error fetching latest bookings:", error);
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

  const handleToggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  return (
    <>
      <style>
        {`
          .toast-container-no-scroll {
            word-wrap: break-word; 
            max-width: 100%;
            overflow: hidden;
          }
           .Toastify__toast-container--top-center {
            top: 20px; /* Adjust distance from top */
            left: 50%;
            transform: translateX(-50%); /* Center the toast horizontally */
          } 
        `}
      </style>
      <Dropdown show={showDropdown} onToggle={setShowDropdown}>
        <Dropdown.Menu
          style={{
            width: "350px",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#1e213a",
            border: "1px solid #2e3347",
          }}
        >
          <Dropdown.Header className="d-flex justify-content-between align-items-center">
            <span>Recent Bookings</span>
            {unreadCount > 0 && (
              <small
                style={{ cursor: "pointer", color: "#4299e1" }}
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
              title={playSound ? "Sound On" : "Sound Off"}
              onClick={(e) => {
                e.stopPropagation();
                setPlaySound(!playSound);
              }}
              style={{
                color: playSound ? "#38b2ac" : "#a0aec0",
                cursor: "pointer",
                fontSize: "1rem",
                marginLeft: "10px",
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
            latestBookings.map((booking) => (
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
                    <div>
                      Status:{" "}
                      <span
                        className={`text-${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>
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

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "success";
    case "paid":
      return "primary";
    case "unpaid":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

export default BookingNotification;
