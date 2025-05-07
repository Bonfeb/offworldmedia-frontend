import { useContext, useEffect, useState } from "react";
import { Nav, Navbar, Offcanvas, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/images/Logo.ico";
import { AuthContext } from "../context/AuthContext";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function NavBar() {
  const { isAuthenticated, userProfilePic, userGroups, logout } = useContext(AuthContext);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAdmin = isAuthenticated && userGroups && userGroups.includes("admin");
    const isAdminPage = location.pathname.startsWith("/admin-dashboard");
    setShowNavbar(!(isAdmin && isAdminPage));
  }, [isAuthenticated, userGroups, location.pathname]);

  if (!showNavbar) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavItemClick = (path) => {
    setShowOffcanvas(false);
    setAnchorEl(null);
    navigate(path);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Antique blue color palette
  const colors = {
    antiqueBlue: "#4B5EAA",
    blue: "#4682B4",
    shadeBlue: "#6A8299",
  };

  // Gradient style for the offcanvas
  const offcanvasStyle = {
    background: `linear-gradient(to bottom, ${colors.antiqueBlue}, ${colors.blue}, ${colors.shadeBlue})`,
    color: "white",
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: colors.antiqueBlue,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Navbar Brand */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <img
              src={Logo}
              alt="OffWorldMedia Logo"
              style={{ height: 40, marginRight: 8 }}
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: "white",
                textDecoration: "none",
                "&:hover": { color: colors.shadeBlue },
              }}
            >
              OffWorldMedia
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center" }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: "white",
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: colors.shadeBlue },
              }}
              onClick={() => handleNavItemClick("/")}
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/team"
              sx={{
                color: "white",
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: colors.shadeBlue },
              }}
              onClick={() => handleNavItemClick("/team")}
            >
              Team
            </Button>
            <Button
              component={Link}
              to="/contactus"
              sx={{
                color: "white",
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: colors.shadeBlue },
              }}
              onClick={() => handleNavItemClick("/contactus")}
            >
              Contact Us
            </Button>
            <Button
              component={Link}
              to="/services"
              sx={{
                color: "white",
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: colors.shadeBlue },
              }}
              onClick={() => handleNavItemClick("/services")}
            >
              Services
            </Button>
            <Button
              component={Link}
              to="/media-gallery"
              sx={{
                color: "white",
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: colors.shadeBlue },
              }}
              onClick={() => handleNavItemClick("/media-gallery")}
            >
              Gallery
            </Button>
            <Button
              component={Link}
              to="/reviews"
              sx={{
                color: "white",
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: colors.shadeBlue },
              }}
              onClick={() => handleNavItemClick("/reviews")}
            >
              Reviews
            </Button>
            <Button
              component={Link}
              to="/new-home-ui"
              sx={{
                color: "white",
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: colors.shadeBlue },
              }}
              onClick={() => handleNavItemClick("/new-home-ui")}
            >
              NewHomeUI
            </Button>

            {!isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  to="/register"
                  sx={{
                    color: "white",
                    mx: 1,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": { backgroundColor: colors.shadeBlue },
                  }}
                  onClick={() => handleNavItemClick("/register")}
                >
                  Register
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    color: "white",
                    mx: 1,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": { backgroundColor: colors.shadeBlue },
                  }}
                  onClick={() => handleNavItemClick("/login")}
                >
                  Login
                </Button>
              </>
            ) : (
              <Box sx={{ ml: 2 }}>
                <IconButton onClick={handleMenuOpen}>
                  <Avatar
                    src={userProfilePic}
                    sx={{ width: 40, height: 40, border: `2px solid ${colors.shadeBlue}` }}
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      backgroundColor: colors.blue,
                      color: "white",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => handleNavItemClick("/profile")}
                    sx={{ "&:hover": { backgroundColor: colors.shadeBlue } }}
                  >
                    My Profile
                  </MenuItem>
                  {userGroups && userGroups.includes("admin") ? (
                    <MenuItem
                      onClick={() => handleNavItemClick("/admin-dashboard")}
                      sx={{ "&:hover": { backgroundColor: colors.shadeBlue } }}
                    >
                      Admin Dashboard
                    </MenuItem>
                  ) : (
                    <MenuItem
                      onClick={() => handleNavItemClick("/userdashboard")}
                      sx={{ "&:hover": { backgroundColor: colors.shadeBlue } }}
                    >
                      My Dashboard
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      color: "#ff4d4f",
                      "&:hover": { backgroundColor: colors.shadeBlue },
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>

          {/* Mobile Menu Toggle */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            sx={{ display: { xs: "flex", lg: "none" } }}
            onClick={() => setShowOffcanvas(!showOffcanvas)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Offcanvas Menu with Gradient Background */}
      <Navbar.Offcanvas
        id="offcanvasNavbar"
        placement="end"
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        style={offcanvasStyle}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="mx-auto text-white">
            OffWorldMedia
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column justify-content-start">
          <Nav className="flex-column text-center mt-3">
            <Nav.Link
              onClick={() => handleNavItemClick("/")}
              className="py-2 text-white"
              style={{ fontSize: "1.1rem" }}
            >
              Home
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavItemClick("/team")}
              className="py-2 text-white"
              style={{ fontSize: "1.1rem" }}
            >
              Team
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavItemClick("/contactus")}
              className="py-2 text-white"
              style={{ fontSize: "1.1rem" }}
            >
              Contact Us
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavItemClick("/reviews")}
              className="py-2 text-white"
              style={{ fontSize: "1.1rem" }}
            >
              Reviews
            </Nav.Link>

            {!isAuthenticated ? (
              <>
                <Nav.Link
                  onClick={() => handleNavItemClick("/register")}
                  className="py-2 text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  Register
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleNavItemClick("/login")}
                  className="py-2 text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  Login
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  onClick={() => handleNavItemClick("/profile")}
                  className="py-2 text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  My Profile
                </Nav.Link>
                {userGroups && userGroups.includes("admin") ? (
                  <Nav.Link
                    onClick={() => handleNavItemClick("/admin-dashboard")}
                    className="py-2 text-white"
                    style={{ fontSize: "1.1rem" }}
                  >
                    Admin Dashboard
                  </Nav.Link>
                ) : (
                  <Nav.Link
                    onClick={() => handleNavItemClick("/userdashboard")}
                    className="py-2 text-white"
                    style={{ fontSize: "1.1rem" }}
                  >
                    My Dashboard
                  </Nav.Link>
                )}
                <Nav.Link
                  onClick={handleLogout}
                  className="text-danger py-2"
                  style={{ fontSize: "1.1rem" }}
                >
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </AppBar>
  );
}

export default NavBar;