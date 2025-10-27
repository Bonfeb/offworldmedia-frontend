import { useContext, useEffect, useState } from "react";
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
import { Offcanvas, Nav } from "react-bootstrap";
import MenuIcon from "@mui/icons-material/Menu";

function NavBar() {
  const { isAuthenticated, userProfilePic, userGroups, logout } =
    useContext(AuthContext);

  const [showNavbar, setShowNavbar] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAdmin =
      isAuthenticated && userGroups && userGroups.includes("admin");
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

  const handleOffcanvasToggle = () => {
    console.log("Toggling offcanvas, current state:", showOffcanvas);
    setShowOffcanvas(!showOffcanvas);
  };

  const handleOffcanvasClose = () => {
    console.log("Closing offcanvas");
    setShowOffcanvas(false);
  };

  const colors = {
    antiqueBlue: "#021d33ff",
    shadeBlue: "#043a66ff",
  };

  const menuItems = [
    { text: "Home", path: "/" },
    { text: "Contact Us", path: "/contactus" },
    { text: "Services", path: "/services" },
    { text: "Gallery", path: "/media-gallery" },
    { text: "Reviews", path: "/reviews" },
  ];

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: colors.antiqueBlue,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          // FIXED: Ensure navbar has highest z-index
          zIndex: 1300,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Brand */}
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
                  // FIXED: Ensure clickable text links work
                  cursor: "pointer",
                  zIndex: 1301,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("/");
                }}
              >
                Offworld Media
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Nav */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                // FIXED: Ensure nav items container has proper z-index
                zIndex: 1301,
              }}
            >
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                  sx={{
                    color: "white",
                    mx: 1,
                    textTransform: "none",
                    fontSize: "1rem",
                    cursor: "pointer",
                    zIndex: 1301,
                    "&:hover": { backgroundColor: colors.shadeBlue },
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {!isAuthenticated ? (
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate("/register");
                    }}
                    sx={{
                      color: "white",
                      mx: 1,
                      textTransform: "none",
                      fontSize: "1rem",
                      cursor: "pointer",
                      zIndex: 1301,
                      "&:hover": { backgroundColor: colors.shadeBlue },
                    }}
                  >
                    Register
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate("/login");
                    }}
                    sx={{
                      color: "white",
                      mx: 1,
                      textTransform: "none",
                      fontSize: "1rem",
                      cursor: "pointer",
                      zIndex: 1301,
                      "&:hover": { backgroundColor: colors.shadeBlue },
                    }}
                  >
                    Login
                  </Button>
                </>
              ) : (
                <Box sx={{ ml: 2, zIndex: 1301 }}>
                  <IconButton onClick={handleMenuOpen} sx={{ zIndex: 1301 }}>
                    <Avatar
                      src={userProfilePic}
                      sx={{
                        width: 40,
                        height: 40,
                        border: `2px solid ${colors.shadeBlue}`,
                      }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        backgroundColor: colors.antiqueBlue,
                        color: "white",
                        // FIXED: Ensure dropdown menu has higher z-index
                        zIndex: 1302,
                      },
                    }}
                    // FIXED: Ensure menu has higher z-index
                    sx={{ zIndex: 1302 }}
                  >
                    <MenuItem
                      onClick={() => handleNavItemClick("/profile")}
                      sx={{
                        "&:hover": { backgroundColor: colors.shadeBlue },
                        zIndex: 1302,
                      }}
                    >
                      My Profile
                    </MenuItem>
                    {userGroups && userGroups.includes("admin") ? (
                      <MenuItem
                        onClick={() => handleNavItemClick("/admin-dashboard")}
                        sx={{
                          "&:hover": { backgroundColor: colors.shadeBlue },
                          zIndex: 1302,
                        }}
                      >
                        Admin Dashboard
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={() => handleNavItemClick("/userdashboard")}
                        sx={{
                          "&:hover": { backgroundColor: colors.shadeBlue },
                          zIndex: 1302,
                        }}
                      >
                        My Dashboard
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        color: "#ff4d4f",
                        "&:hover": { backgroundColor: colors.shadeBlue },
                        zIndex: 1302,
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              sx={{
                display: { xs: "flex", lg: "none" },
                zIndex: 1301,
              }}
              onClick={handleOffcanvasToggle}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Offcanvas */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleOffcanvasClose}
        placement="end"
        backdrop={true}
        style={{
          backgroundColor: colors.antiqueBlue,
          color: "white",
          // FIXED: Ensure offcanvas has highest z-index
          zIndex: 1400,
        }}
      >
        <Offcanvas.Header
          closeButton
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            zIndex: 1401,
          }}
        >
          <Offcanvas.Title
            className="justify-content-center align-items-center"
            style={{ color: "white", fontWeight: "bold" }}
          >
            OffWorld Media
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ zIndex: 1401 }}>
          <Nav className="flex-column justify-content-center align-items-center">
            {menuItems.map((item, index) => (
              <div key={item.text} style={{ width: "100%" }}>
                <Nav.Link
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavItemClick(item.path);
                  }}
                  style={{
                    color: "white",
                    padding: "12px 0",
                    fontSize: "1.1rem",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    textDecoration: "none",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "center",
                    zIndex: 1401,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.shadeBlue;
                    e.target.style.paddingLeft = "10px";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.paddingLeft = "0px";
                  }}
                >
                  {item.text}
                </Nav.Link>
                <div
                  className="mx-auto mb-2"
                  style={{
                    width: "50%",
                    height: "2px",
                    backgroundColor: "#45463bff",
                  }}
                ></div>
              </div>
            ))}

            {!isAuthenticated ? (
              <>
                <div style={{ width: "100%" }}>
                  <Nav.Link
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavItemClick("/register");
                    }}
                    style={{
                      color: "white",
                      padding: "12px 0",
                      fontSize: "1.1rem",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      textDecoration: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                      zIndex: 1401,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.shadeBlue;
                      e.target.style.paddingLeft = "10px";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.paddingLeft = "0px";
                    }}
                  >
                    Register
                  </Nav.Link>
                  <div
                    className="mx-auto mb-2"
                    style={{
                      width: "50%",
                      height: "2px",
                      backgroundColor: "#45463bff",
                    }}
                  ></div>
                </div>
                <div style={{ width: "100%" }}>
                  <Nav.Link
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavItemClick("/login");
                    }}
                    style={{
                      color: "white",
                      padding: "12px 0",
                      fontSize: "1.1rem",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      textDecoration: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                      zIndex: 1401,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.shadeBlue;
                      e.target.style.paddingLeft = "10px";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.paddingLeft = "0px";
                    }}
                  >
                    Login
                  </Nav.Link>
                  <div
                    className="mx-auto mb-2"
                    style={{
                      width: "50%",
                      height: "2px",
                      backgroundColor: "#45463bff",
                    }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: "100%" }}>
                  <Nav.Link
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavItemClick("/profile");
                    }}
                    style={{
                      color: "white",
                      padding: "12px 0",
                      fontSize: "1.1rem",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      textDecoration: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                      zIndex: 1401,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.shadeBlue;
                      e.target.style.paddingLeft = "10px";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.paddingLeft = "0px";
                    }}
                  >
                    My Profile
                  </Nav.Link>
                  <div
                    className="mx-auto mb-2"
                    style={{
                      width: "50%",
                      height: "2px",
                      backgroundColor: "#45463bff",
                    }}
                  ></div>
                </div>
                {userGroups && userGroups.includes("admin") ? (
                  <div style={{ width: "100%" }}>
                    <Nav.Link
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavItemClick("/admin-dashboard");
                      }}
                      style={{
                        color: "white",
                        padding: "12px 0",
                        fontSize: "1.1rem",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        textDecoration: "none",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                        zIndex: 1401,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.shadeBlue;
                        e.target.style.paddingLeft = "10px";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.paddingLeft = "0px";
                      }}
                    >
                      Admin Dashboard
                    </Nav.Link>
                    <div
                      className="mx-auto mb-2"
                      style={{
                        width: "50%",
                        height: "2px",
                        backgroundColor: "#45463bff",
                      }}
                    ></div>
                  </div>
                ) : (
                  <div style={{ width: "100%" }}>
                    <Nav.Link
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavItemClick("/userdashboard");
                      }}
                      style={{
                        color: "white",
                        padding: "12px 0",
                        fontSize: "1.1rem",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        textDecoration: "none",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                        zIndex: 1401,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.shadeBlue;
                        e.target.style.paddingLeft = "10px";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.paddingLeft = "0px";
                      }}
                    >
                      My Dashboard
                    </Nav.Link>
                    <div
                      className="mx-auto mb-2"
                      style={{
                        width: "50%",
                        height: "2px",
                        backgroundColor: "#45463bff",
                      }}
                    ></div>
                  </div>
                )}
                <div style={{ width: "100%" }}>
                  <Nav.Link
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogout();
                    }}
                    style={{
                      color: "#ff4d4f",
                      padding: "12px 0",
                      fontSize: "1.1rem",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      textDecoration: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                      zIndex: 1401,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.shadeBlue;
                      e.target.style.paddingLeft = "10px";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.paddingLeft = "0px";
                    }}
                  >
                    Logout
                  </Nav.Link>
                </div>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default NavBar;
