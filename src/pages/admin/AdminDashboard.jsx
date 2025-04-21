import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Image,
  Dropdown,
  DropdownToggle,
  DropdownItem,
} from "react-bootstrap";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faClipboardList,
  faEnvelope,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faChartPie,
  faTable,
  faStar,
  faBell,
  faCalendarAlt,
  faGears,
  faGear,
  faAngleDown,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { Card, Box, Typography, CircularProgress, Badge } from "@mui/material";
import NewService from "./services/NewService";
import BookingModals from "./bookings/BookingModals";
import BookingNotification from "./bookings/BookingNotification";

const AdminDashboard = () => {
  const { userProfilePic, firstName, lastName, logout, user } =
    useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out after 10 seconds"));
          }, 10000); // 10 second timeout
        });

        // Fetch dashboard stats
        const response = await Promise.race([
          API.get("/admin-dashboard/", {
            withCredentials: true,
          }),
          timeoutPromise,
        ]);
        setDashboardData(response.data);

        // Fetch recent bookings from the new endpoint
        const bookingsResponse = await Promise.race([
          API.get("/admin-dashboard/", {
            params: { action: "bookings" },
            withCredentials: true,
          }),
          timeoutPromise,
        ]);
        setRecentBookings(bookingsResponse.data.slice(0, 2)); // Get only 5 most recent

        // Fetch recent reviews from the new endpoint
        const reviewsResponse = await Promise.race([
          API.get("/reviews/", {
            withCredentials: true,
          }),
          timeoutPromise,
        ]);
        setRecentReviews(reviewsResponse.data.slice(0, 2));

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleNotificationDropdown = () => {
    setShowNotificationDropdown((prevState) => !prevState);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate time ago
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
      const hours = Math.floor(interval);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    interval = seconds / 60;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  // Stats Card Component
  const StatsCard = ({ icon, value, label, color }) => (
    <Card
      sx={{ backgroundColor: "#1e213a", color: "#fff", borderRadius: "10px" }}
    >
      <Box sx={{ p: 3 }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#aaa", fontSize: "12px" }}
            >
              {label}
            </Typography>
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: color,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={icon} size="lg" />
          </div>
        </div>
      </Box>
    </Card>
  );

  // Booking Item Component
  const BookingItem = ({ booking }) => {
    // Determine the icon and color based on status
    let icon = faClock;
    let iconColor = "#f6ad55";

    if (booking.status === "completed") {
      icon = faCheckCircle;
      iconColor = "#48bb78";
    } else if (booking.status === "canceled") {
      icon = faTimesCircle;
      iconColor = "#f56565";
    }

    // Format status for display
    const displayStatus =
      booking.status === "completed"
        ? "Completed"
        : booking.status === "pending"
        ? "Pending"
        : booking.status === "canceled"
        ? "Canceled"
        : booking.status;

    return (
      <div
        className="d-flex justify-content-between align-items-center mb-3 pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="d-flex align-items-center">
          <div
            className="me-3"
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: iconColor,
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={icon} size="sm" />
          </div>
          <div>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {booking.service.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#aaa" }}>
              {booking.user.username} • {formatDate(booking.event_date)}
            </Typography>
          </div>
        </div>
        <div className="text-end">
          <span
            style={{
              backgroundColor:
                displayStatus === "Completed" || displayStatus === "Completed"
                  ? "#48bb78"
                  : displayStatus === "Pending"
                  ? "#f6ad55"
                  : "#f56565",
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "10px",
              color: "white",
            }}
          >
            {displayStatus}
          </span>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "#aaa", mt: 1 }}
          >
            {booking.created_at ? timeAgo(booking.created_at) : ""}
          </Typography>
        </div>
      </div>
    );
  };

  // Review Item Component
  const ReviewItem = ({ review }) => (
    <div
      className="mb-3 pb-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="d-flex justify-content-between">
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {review.user.username}
          <i>{review.service.category}</i>
        </Typography>
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={faStar}
              style={{
                color: star <= review.rating ? "#f6ad55" : "#444",
                fontSize: "12px",
              }}
              className="ms-1"
            />
          ))}
        </div>
      </div>
      <Typography
        variant="caption"
        sx={{ color: "#aaa", display: "block", mt: 1 }}
      >
        "{review.comment}"
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "#888", display: "block", mt: 1 }}
      >
        {formatDate(review.created_at)}
      </Typography>
    </div>
  );

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#1a1d2b" }}
    >
      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
        style={{
          width: sidebarOpen ? "240px" : "60px",
          backgroundColor: "#12151f",
          color: "#fff",
          transition: "width 0.3s ease",
          overflow: "hidden",
          boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
        }}
      >
        <div className="text-center p-3">
          <Typography
            variant="h6"
            component="div"
            className="text-light my-3"
            style={{ fontWeight: "bold" }}
          >
            BOOKING ADMIN
          </Typography>

          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0"
            >
              <div className="position-relative d-inline-block">
                <Image
                  src={userProfilePic || "/default-profile.png"}
                  roundedCircle
                  width="40"
                  height="40"
                  className="mb-2"
                  alt="User profile"
                />
                <span
                  className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                  style={{
                    width: "10px",
                    height: "10px",
                    border: "2px solid #12151f",
                  }}
                ></span>
              </div>
              <div className="text-light" style={{ fontSize: "14px" }}>
                {firstName} {lastName}
                <div style={{ fontSize: "12px", opacity: 0.8 }}>Admin</div>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{
                backgroundColor: "#1a1d2b",
                border: "1px solid #2e3347",
              }}
            >
              <Dropdown.Item as={NavLink} to="/profile" className="text-light">
                View Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout} className="text-light">
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div
          className="mt-3 px-2"
          style={{ color: "#6c757d", fontSize: "12px", letterSpacing: "1px" }}
        >
          DASHBOARD
        </div>
        <Nav className="flex-column mt-2">
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard"
            end
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faChartPie} className="me-3" /> Dashboard
          </Nav.Link>
        </Nav>
        <div
          className="mt-4 px-2"
          style={{ color: "#6c757d", fontSize: "12px", letterSpacing: "1px" }}
        >
          SERVICES
        </div>
        <Nav className="flex-column mt-2">
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/video-recording"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faClock} className="me-3" /> Video
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/audio-recording"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faTimesCircle} className="me-3" /> Audio
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/photo-shooting"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-3" /> Photo
          </Nav.Link>
        </Nav>

        <div
          className="mt-4 px-2"
          style={{ color: "#6c757d", fontSize: "12px", letterSpacing: "1px" }}
        >
          BOOKINGS
        </div>
        <Nav className="flex-column mt-2">
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/pending-bookings"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faClock} className="me-3" /> Pending
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/cancelled-bookings"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faTimesCircle} className="me-3" /> Cancelled
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/completed-bookings"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-3" /> Completed
          </Nav.Link>
        </Nav>

        <div
          className="mt-4 px-2"
          style={{ color: "#6c757d", fontSize: "12px", letterSpacing: "1px" }}
        >
          MANAGEMENT
        </div>
        <Nav className="flex-column mt-2">
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/team-members"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faUserGroup} className="me-4" /> Team
          </Nav.Link>
          <hr style={{ color: "yellowgreen" }} />
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/users"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faUser} className="me-3" /> Users
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/reviews"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faStar} className="me-3" /> Reviews
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            to="/admin-dashboard/messages"
            className="text-light py-2"
          >
            <FontAwesomeIcon icon={faEnvelope} className="me-3" /> Messages
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, overflow: "auto" }}>
        <Navbar
          bg="dark"
          variant="dark"
          style={{
            backgroundColor: "#12151f",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <Container fluid className="d-flex justify-content-between">
            <div className="d-flex">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control bg-dark text-light border-dark"
                  placeholder="Search for booking..."
                  style={{ borderRadius: "20px", fontSize: "14px" }}
                />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  <span
                    className="rounded-pill px-3 py-2"
                    style={{ fontSize: "14px" }}
                  >
                    + New
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  style={{
                    backgroundColor: "#2c3e50",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                >
                  <Dropdown.Item
                    className="text-light"
                    style={{
                      padding: "10px 15px",
                      borderRadius: "6px",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#34495e")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                    onClick={() => setShowBookingModal(true)}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} /> Booking
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-light"
                    style={{
                      padding: "10px 15px",
                      borderRadius: "6px",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#34495e")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                    onClick={() => setShowServiceModal(true)}
                  >
                    <FontAwesomeIcon icon={faGear} /> Service
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <div className="d-flex align-items-center">
                <span className="mx-2 text-light" style={{ cursor: "pointer" }}>
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <span
                  className="mx-2 text-light"
                  style={{ cursor: "pointer" }}
                  onClick={handleToggleNotificationDropdown}
                >
                  <FontAwesomeIcon icon={faBell} />
                </span>
                <BookingNotification
                  showDropdown={showNotificationDropdown}
                  setShowDropdown={setShowNotificationDropdown}
                />
                <Image
                  src={userProfilePic || "/default-profile.png"}
                  roundedCircle
                  width="30"
                  height="30"
                  className="ms-3"
                  alt="User profile"
                />
                <FontAwesomeIcon icon={faAngleDown} />
              </div>
            </div>
          </Container>
        </Navbar>

        <Container fluid className="px-4 py-4">
          {/* Show statistics by default if on the base dashboard route */}
          {location.pathname === "/admin-dashboard" ? (
            isLoading ? (
              <div className="text-center p-5 text-light">
                <CircularProgress color="inherit" />
                <p className="mt-3">Loading dashboard data...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : dashboardData ? (
              <>
                <Row className="mb-4">
                  <Col lg={3} md={6} className="mb-3">
                    <StatsCard
                      icon={faCalendarAlt}
                      value={dashboardData.stats?.total_bookings || 0}
                      label="Total Bookings"
                      color="#4299e1"
                    />
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <StatsCard
                      icon={faClock}
                      value={dashboardData.stats?.pending_bookings || 0}
                      label="Pending Bookings"
                      color="#f6ad55"
                    />
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <StatsCard
                      icon={faCheckCircle}
                      value={dashboardData.stats?.completed_bookings || 0}
                      label="Completed Bookings"
                      color="#48bb78"
                    />
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <StatsCard
                      icon={faTimesCircle}
                      value={dashboardData.stats?.cancelled_bookings || 0}
                      label="Cancelled Bookings"
                      color="#f56565"
                    />
                  </Col>
                </Row>

                <Row>
                  <Col lg={4} md={6} className="mb-4">
                    <Card
                      sx={{
                        backgroundColor: "#1e213a",
                        color: "#fff",
                        borderRadius: "10px",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Booking Status
                        </Typography>
                        <div className="text-center position-relative my-4">
                          <div
                            style={{
                              width: "150px",
                              height: "150px",
                              margin: "0 auto",
                            }}
                          >
                            <Box
                              sx={{
                                position: "relative",
                                display: "inline-flex",
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              <CircularProgress
                                variant="determinate"
                                value={75}
                                size={150}
                                thickness={10}
                                sx={{
                                  color: "green",
                                  background:
                                    "conic-gradient(from 0deg, #48bb78 40%, #f6ad55 40%, #f6ad55 70%, #f56565 70%, #f56565 100%)",
                                  borderRadius: "50%",
                                }}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: "absolute",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography
                                  variant="h5"
                                  component="div"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  {dashboardData.stats?.total_bookings || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="me-2"
                                style={{
                                  width: "15px",
                                  height: "15px",
                                  backgroundColor: "#48bb78",
                                  borderRadius: "3px",
                                }}
                              ></div>
                              <Typography variant="body2">Completed</Typography>
                            </div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              40%
                            </Typography>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="me-2"
                                style={{
                                  width: "15px",
                                  height: "15px",
                                  backgroundColor: "#f6ad55",
                                  borderRadius: "3px",
                                }}
                              ></div>
                              <Typography variant="body2">Pending</Typography>
                            </div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              30%
                            </Typography>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <div
                                className="me-2"
                                style={{
                                  width: "15px",
                                  height: "15px",
                                  backgroundColor: "#f56565",
                                  borderRadius: "3px",
                                }}
                              ></div>
                              <Typography variant="body2">Cancelled</Typography>
                            </div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              30%
                            </Typography>
                          </div>
                        </div>
                      </Box>
                    </Card>
                  </Col>

                  <Col lg={8} md={6} className="mb-4">
                    <Card
                      sx={{
                        backgroundColor: "#1e213a",
                        color: "#fff",
                        borderRadius: "10px",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Recent Bookings
                        </Typography>

                        <div className="mt-3">
                          {recentBookings.length > 0 ? (
                            recentBookings.map((booking) => (
                              <BookingItem key={booking.id} booking={booking} />
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ color: "#aaa", textAlign: "center", py: 3 }}
                            >
                              No recent bookings found
                            </Typography>
                          )}
                        </div>
                        <div className="text-center mt-3">
                          <Typography
                            variant="body2"
                            sx={{ color: "#4299e1", cursor: "pointer" }}
                            onClick={() =>
                              navigate("/admin-dashboard/all-bookings")
                            }
                          >
                            View all bookings →
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col lg={4} md={6} className="mb-3">
                    <Card
                      sx={{
                        backgroundColor: "#1e213a",
                        color: "#fff",
                        borderRadius: "10px",
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Recent Reviews
                        </Typography>
                        {recentReviews.length > 0 ? (
                          recentReviews.map((review) => (
                            <ReviewItem key={review.id} review={review} />
                          ))
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "#aaa", textAlign: "center", py: 3 }}
                          >
                            No recent reviews found
                          </Typography>
                        )}
                        <div className="text-center mt-3">
                          <Typography
                            variant="body2"
                            sx={{ color: "#4299e1", cursor: "pointer" }}
                            onClick={() => navigate("/admin-dashboard/reviews")}
                          >
                            View all reviews →
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  </Col>
                  <Col lg={4} md={6} className="mb-3">
                    <Card
                      sx={{
                        backgroundColor: "#1e213a",
                        color: "#fff",
                        borderRadius: "10px",
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Recent Messages
                        </Typography>
                        <div
                          className="mb-3 pb-2"
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              Michael Brown
                            </Typography>
                            <span
                              style={{
                                backgroundColor: "#4299e1",
                                fontSize: "10px",
                                padding: "1px 6px",
                                borderRadius: "10px",
                                color: "white",
                              }}
                            >
                              New
                            </span>
                          </div>
                          <Typography
                            variant="caption"
                            sx={{ color: "#aaa", display: "block", mt: 1 }}
                          >
                            "I'd like to inquire about your video packages for
                            corporate events..."
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#888", display: "block", mt: 1 }}
                          >
                            Today, 10:45 AM
                          </Typography>
                        </div>
                        <div
                          className="mb-3 pb-2"
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              Sarah Miller
                            </Typography>
                          </div>
                          <Typography
                            variant="caption"
                            sx={{ color: "#aaa", display: "block", mt: 1 }}
                          >
                            "Do you offer discounts for multiple session
                            bookings? Looking for..."
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#888", display: "block", mt: 1 }}
                          >
                            Yesterday, 4:30 PM
                          </Typography>
                        </div>
                        <div className="text-center mt-3">
                          <Typography
                            variant="body2"
                            sx={{ color: "#4299e1", cursor: "pointer" }}
                          >
                            View all messages →
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  </Col>
                  <Col lg={4} md={6} className="mb-3">
                    <Card
                      sx={{
                        backgroundColor: "#1e213a",
                        color: "#fff",
                        borderRadius: "10px",
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Booking Analysis
                        </Typography>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              Completed Bookings
                            </Typography>
                            <div
                              className="progress mt-2"
                              style={{
                                height: "6px",
                                backgroundColor: "#2d3748",
                              }}
                            >
                              <div
                                className="progress-bar"
                                style={{
                                  width: "75%",
                                  backgroundColor: "#48bb78",
                                }}
                              ></div>
                            </div>
                          </div>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            75%
                          </Typography>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              Pending
                            </Typography>
                            <div
                              className="progress mt-2"
                              style={{
                                height: "6px",
                                backgroundColor: "#2d3748",
                              }}
                            >
                              <div
                                className="progress-bar"
                                style={{
                                  width: "60%",
                                  backgroundColor: "#f6ad55",
                                }}
                              ></div>
                            </div>
                          </div>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            60%
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : null
          ) : (
            <Outlet />
          )}

          <NewService
            show={showServiceModal}
            handleClose={() => setShowServiceModal(false)}
            refreshServices={() => {
              // Optional: add refresh logic here
            }}
          />

          <BookingModals
            createOpen={showBookingModal}
            onCreateClose={() => setShowBookingModal(false)} // Close the modal
            onCreateConfirm={(booking) => {
              // Handle booking creation logic
              console.log("New booking created:", booking);
              setShowBookingModal(false); // Close the modal after creation
            }}
            isLoading={false} // Adjust based on loading state
            users={[]} // List of users
            services={[]} // List of services
          />
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;
