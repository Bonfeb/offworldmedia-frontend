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
  faBars,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { Card, Box, Typography, CircularProgress, Badge } from "@mui/material";
import NewService from "./services/NewService";
import BookingModals from "./bookings/BookingModals";
import BookingNotification from "./bookings/BookingNotification";
import { set } from "lodash";

const AdminDashboard = () => {
  const { userProfilePic, firstName, lastName, logout, user } =
    useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_bookings: 0,
      unpaid_bookings: 0,
      paid_bookings: 0,
      completed_bookings: 0,
      cancelled_bookings: 0,
    },
    percentages: {
      paid: 0,
      unpaid: 0,
      completed: 0,
      cancelled: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Toggle sidebar based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobileView(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setShowMobileOverlay(false);
      } else {
        setSidebarOpen(true);
        setShowMobileOverlay(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking a nav item on mobile
  const handleNavItemClick = () => {
    if (isMobileView) {
      setSidebarOpen(false);
      setShowMobileOverlay(false);
    }
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
    setShowMobileOverlay(false);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out after 20 seconds"));
          }, 20000);
        });

        console.log("Fetching admin dashboard overview...");
        const response = await Promise.race([
          API.get("/admin-dashboard/", {
            withCredentials: true,
          }),
          timeoutPromise,
        ]);

        const {
          recent_bookings,
          recent_reviews,
          recent_messages,
          stats,
          percentages,
        } = response.data;

        console.log("Dashboard stats response:", stats, percentages);
        setDashboardData({ stats, percentages });

        console.log("Recent bookings:", recent_bookings);
        setRecentBookings(recent_bookings?.slice(0, 2) || []);

        console.log("Recent reviews:", recent_reviews);
        setRecentReviews(recent_reviews?.slice(0, 2) || []);

        console.log("Recent messages:", recent_messages);
        setRecentMessages(recent_messages?.slice(0, 2) || []);

        setError(null);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        if (err.response) {
          console.error("Server error response:", err.response.data);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Unknown error:", err.message);
        }
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (isMobileView) {
      setShowMobileOverlay(!sidebarOpen);
    }
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
        : booking.status === "unpaid"
        ? "Unpaid"
        : booking.status === "paid"
        ? "Paid"
        : booking.status === "cancelled"
        ? "Cancelled"
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
              {booking.service?.category || "Unknown Service"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#aaa" }}>
              {booking.user?.username || "Unknown User"} •{" "}
              {formatDate(booking.event_date)}
            </Typography>
          </div>
        </div>
        <div className="text-end">
          <span
            style={{
              backgroundColor:
                displayStatus === "Completed"
                  ? "#48bb78"
                  : displayStatus === "Unpaid"
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
          {review.user?.username || "Unknown User"}
          <i>{review.service?.category || "Unknown Service"}</i>
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
        "{review.comment || "No comment"}"
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "#888", display: "block", mt: 1 }}
      >
        {formatDate(review.created_at)}
      </Typography>
    </div>
  );

  // Message Item Component
  const MessageItem = ({ message }) => (
    <div
      className="mb-3 pb-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {message.name || "Unknown User"}
        </Typography>
        {message.is_new && (
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
        )}
      </div>
      <Typography
        variant="caption"
        sx={{ color: "#aaa", display: "block", mt: 1 }}
      >
        "{message.content || "No content"}"
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "#888", display: "block", mt: 1 }}
      >
        {message.created_at ? timeAgo(message.created_at) : "Unknown date"}
      </Typography>
    </div>
  );

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#1a1d2b" }}
    >
      {/* Mobile Overlay */}
      {isMobileView && (
        <div
          className={`mobile-sidebar-overlay ${
            showMobileOverlay ? "show" : ""
          }`}
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
        style={{
          width: isMobileView
            ? sidebarOpen
              ? "280px"
              : "0"
            : sidebarOpen
            ? "240px"
            : "0",
          minWidth: isMobileView
            ? sidebarOpen
              ? "280px"
              : "0"
            : sidebarOpen
            ? "240px"
            : "0",
          backgroundColor: "#12151f",
          color: "#fff",
          transition: "all 0.3s ease",
          overflow: sidebarOpen ? "auto" : "hidden",
          boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
          position: isMobileView ? "fixed" : "relative",
          zIndex: isMobileView ? 1040 : 1000,
          height: "100vh",
          transform: isMobileView
            ? sidebarOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "none",
        }}
      >
        <div className="sidebar-content">
          <div className="profile-section">
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
                  />
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
                <Dropdown.Item
                  as={NavLink}
                  to="/profile"
                  className="text-light"
                  onClick={handleNavItemClick}
                >
                  View Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout} className="text-light">
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Navigation Content */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: "1rem" }}>
            <div className="nav-header">DASHBOARD</div>
            <Nav className="flex-column">
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard"
                end
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faChartPie} className="icon" /> Dashboard
              </Nav.Link>
            </Nav>

            <div className="nav-header">SERVICES</div>
            <Nav className="flex-column">
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/services"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faClock} className="icon" /> Services
              </Nav.Link>
            </Nav>

            <div className="nav-header">BOOKINGS</div>
            <Nav className="flex-column">
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/unpaid-bookings"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faClock} className="icon" /> Unpaid
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/paid-bookings"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faClock} className="icon" /> Paid
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/completed-bookings"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faTimesCircle} className="icon" />{" "}
                Completed
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/cancelled-bookings"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="icon" />{" "}
                Cancelled
              </Nav.Link>
            </Nav>

            <div className="nav-header">MANAGEMENT</div>
            <Nav className="flex-column">
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/team-members"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faUserGroup} className="icon" /> Team
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/media"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faSliders} className="icon" /> Media
              </Nav.Link>
              <hr style={{ color: "yellowgreen", margin: "1rem 0.5rem" }} />
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/users"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faUser} className="icon" /> Users
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/reviews"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faStar} className="icon" /> Reviews
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/admin-dashboard/messages"
                className="text-light"
                onClick={handleNavItemClick}
              >
                <FontAwesomeIcon icon={faEnvelope} className="icon" /> Messages
              </Nav.Link>
            </Nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          flex: 1,
          overflow: "auto",
          width: isMobileView
            ? "100%"
            : `calc(100% - ${sidebarOpen ? "240px" : "0px"})`,
          transition: "width 0.3s ease",
          marginLeft: isMobileView ? "0" : "0",
        }}
      >
        <Navbar
          bg="dark"
          variant="dark"
          style={{
            backgroundColor: "#12151f",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <Container fluid className="d-flex justify-content-between">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-dark me-2 d-lg-none"
                onClick={toggleSidebar}
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
              <div className="input-group d-none d-md-flex">
                <input
                  type="text"
                  className="form-control bg-dark text-light border-dark"
                  placeholder="Search for booking..."
                  style={{ borderRadius: "20px", fontSize: "14px" }}
                />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <Dropdown className="me-2">
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
                <span
                  className="mx-2 text-light d-none d-sm-block"
                  style={{ cursor: "pointer" }}
                >
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
                  className="ms-3 d-none d-sm-block"
                  alt="User profile"
                />
                <FontAwesomeIcon
                  icon={faAngleDown}
                  className="d-none d-sm-block"
                />
              </div>
            </div>
          </Container>
        </Navbar>

        <Container fluid className="px-3 px-md-4 py-4">
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
                  <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
                    <StatsCard
                      icon={faCalendarAlt}
                      value={dashboardData?.total_bookings || 0}
                      label="Total Bookings"
                      color="#4299e1"
                    />
                  </Col>
                  <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
                    <StatsCard
                      icon={faClock}
                      value={dashboardData?.unpaid_bookings || 0}
                      label="Unpaid Bookings"
                      color="#f6ad55"
                    />
                  </Col>
                  <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
                    <StatsCard
                      icon={faClock}
                      value={dashboardData?.paid_bookings || 0}
                      label="Paid Bookings"
                      color="#48bb78"
                    />
                  </Col>
                  <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
                    <StatsCard
                      icon={faCheckCircle}
                      value={dashboardData?.completed_bookings || 0}
                      label="Completed Bookings"
                      color="#48bb78"
                    />
                  </Col>
                  <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
                    <StatsCard
                      icon={faTimesCircle}
                      value={dashboardData?.cancelled_bookings || 0}
                      label="Cancelled Bookings"
                      color="#f56565"
                    />
                  </Col>
                </Row>

                <Row>
                  <Col xl={4} lg={6} md={12} className="mb-4">
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
                              <Typography variant="body2">Paid</Typography>
                            </div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {dashboardData.percentages?.paid || 0}%
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
                              <Typography variant="body2">Unpaid</Typography>
                            </div>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {dashboardData.percentages?.unpaid || 0}%
                            </Typography>
                          </div>
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
                              {dashboardData.percentages?.completed || 0}%
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
                              {dashboardData.percentages?.cancelled || 0}%
                            </Typography>
                          </div>
                        </div>
                      </Box>
                    </Card>
                  </Col>

                  <Col xl={8} lg={6} md={12} className="mb-4">
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
                            onClick={() => {
                              handleNavItemClick();
                              navigate("/admin-dashboard/all-bookings");
                            }}
                          >
                            View all bookings →
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col xl={4} lg={6} md={12} className="mb-3">
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
                            onClick={() => {
                              handleNavItemClick();
                              navigate("/admin-dashboard/reviews");
                            }}
                          >
                            View all reviews →
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  </Col>
                  <Col xl={4} lg={6} md={12} className="mb-3">
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
                        {recentMessages.length > 0 ? (
                          recentMessages.map((message) => (
                            <MessageItem key={message.id} message={message} />
                          ))
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "#aaa", textAlign: "center", py: 3 }}
                          >
                            No recent messages found
                          </Typography>
                        )}
                        <div className="text-center mt-3">
                          <Typography
                            variant="body2"
                            sx={{ color: "#4299e1", cursor: "pointer" }}
                            onClick={() => {
                              handleNavItemClick();
                              navigate("/admin-dashboard/messages");
                            }}
                          >
                            View all messages →
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
