import { useContext, useEffect, useState } from "react";
import {
  Container,
  Nav,
  Navbar,
  Offcanvas,
  Dropdown,
  Image,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AppBar, Box, Toolbar } from "@mui/material";

function NavBar() {
  const { isAuthenticated, userProfilePic, userGroups, logout } = useContext(AuthContext);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
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
    navigate(path);
  };

  // Gradient style for the offcanvas
  const offcanvasStyle = {
    background: "linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460, #533483)",
    color: "white"
  };

  return (
    <AppBar position="static" color="primary" className="m-0 p-0">
      <Container fluid>
        <Navbar expand="lg" variant="dark" className="p-0 w-100">
          <Toolbar className="w-100 p-0">
            <Navbar.Brand as={Link} to="/">
              OffWorldMedia
            </Navbar.Brand>
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
              <Nav className="align-items-center me-3">
                <Nav.Link as={Link} to="/" onClick={() => handleNavItemClick("/")}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/team" onClick={() => handleNavItemClick("/team")}>
                  Team
                </Nav.Link>
                <Nav.Link as={Link} to="/contactus" onClick={() => handleNavItemClick("/contactus")}>
                  Contact Us
                </Nav.Link>
                <Nav.Link as={Link} to="/reviews" onClick={() => handleNavItemClick("/reviews")}>
                  Reviews
                </Nav.Link>
              </Nav>

              <Nav className="d-flex align-items-center">
                {!isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/register" onClick={() => handleNavItemClick("/register")}>
                      Register
                    </Nav.Link>
                    <Nav.Link as={Link} to="/login" onClick={() => handleNavItemClick("/login")}>
                      Login
                    </Nav.Link>
                  </>
                ) : (
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      as="div"
                      className="d-flex align-items-center"
                    >
                      <Image
                        src={userProfilePic}
                        roundedCircle
                        width="45"
                        height="45"
                        className="me-2"
                        style={{ cursor: "pointer" }}
                      />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to="/profile" onClick={() => handleNavItemClick("/profile")}>
                        My Profile
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      {userGroups && userGroups.includes("admin") ? (
                        <Dropdown.Item as={Link} to="/admin-dashboard" onClick={() => handleNavItemClick("/admin-dashboard")}>
                          Admin Dashboard
                        </Dropdown.Item>
                      ) : (
                        <Dropdown.Item as={Link} to="/userdashboard" onClick={() => handleNavItemClick("/userdashboard")}>
                          My Dashboard
                        </Dropdown.Item>
                      )}
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={handleLogout}
                        className="text-danger"
                      >
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </Nav>
            </Box>
            
            <Navbar.Toggle 
              aria-controls="offcanvasNavbar" 
              onClick={() => setShowOffcanvas(!showOffcanvas)}
              className="d-lg-none"
            />
          </Toolbar>
        </Navbar>
        
        {/* Offcanvas Menu with Gradient Background */}
        <Navbar.Offcanvas 
          id="offcanvasNavbar" 
          placement="end" 
          show={showOffcanvas} 
          onHide={() => setShowOffcanvas(false)}
          style={offcanvasStyle}
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title className="mx-auto text-white">OffWorldMedia</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column justify-content-start">
            <Nav className="flex-column text-center mt-3">
              <Nav.Link onClick={() => handleNavItemClick("/")} className="py-2 text-white">
                Home
              </Nav.Link>
              <Nav.Link onClick={() => handleNavItemClick("/team")} className="py-2 text-white">
                Team
              </Nav.Link>
              <Nav.Link onClick={() => handleNavItemClick("/contactus")} className="py-2 text-white">
                Contact Us
              </Nav.Link>
              <Nav.Link onClick={() => handleNavItemClick("/reviews")} className="py-2 text-white">
                Reviews
              </Nav.Link>
              
              {!isAuthenticated ? (
                <>
                  <Nav.Link onClick={() => handleNavItemClick("/register")} className="py-2 text-white">
                    Register
                  </Nav.Link>
                  <Nav.Link onClick={() => handleNavItemClick("/login")} className="py-2 text-white">
                    Login
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link onClick={() => handleNavItemClick("/profile")} className="py-2 text-white">
                    My Profile
                  </Nav.Link>
                  {userGroups && userGroups.includes("admin") ? (
                    <Nav.Link onClick={() => handleNavItemClick("/admin-dashboard")} className="py-2 text-white">
                      Admin Dashboard
                    </Nav.Link>
                  ) : (
                    <Nav.Link onClick={() => handleNavItemClick("/userdashboard")} className="py-2 text-white">
                      My Dashboard
                    </Nav.Link>
                  )}
                  <Nav.Link onClick={handleLogout} className="text-danger py-2">
                    Logout
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </AppBar>
  );
}

export default NavBar;