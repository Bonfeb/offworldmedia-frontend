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

  // Determine whether to show navbar based on auth status and user groups
  useEffect(() => {
    // Check if user is authenticated and is an admin
    const isAdmin = isAuthenticated && userGroups && userGroups.includes("admin");
    
    // Hide navbar if user is an admin and on an admin page
    const isAdminPage = location.pathname.startsWith("/admin-dashboard");
    setShowNavbar(!(isAdmin && isAdminPage));
  }, [isAuthenticated, userGroups, location.pathname]);

  // If navbar should be hidden, return null
  if (!showNavbar) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Function to close the offcanvas when clicking a menu item
  const handleNavItemClick = (path) => {
    setShowOffcanvas(false);
    navigate(path);
  };

  return (
    <AppBar position="static" color="primary" className="mb-3">
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
            
            {/* Mobile Navigation Toggle */}
            <Navbar.Toggle 
              aria-controls="offcanvasNavbar" 
              onClick={() => setShowOffcanvas(!showOffcanvas)}
              className="d-lg-none"
            />
          </Toolbar>
        </Navbar>
        
        {/* Offcanvas Menu */}
        <Navbar.Offcanvas 
          id="offcanvasNavbar" 
          placement="end" 
          show={showOffcanvas} 
          onHide={() => setShowOffcanvas(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="mx-auto">OffWorldMedia</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              <Nav.Link onClick={() => handleNavItemClick("/")}>
                Home
              </Nav.Link>
              <Nav.Link onClick={() => handleNavItemClick("/team")}>
                Team
              </Nav.Link>
              <Nav.Link onClick={() => handleNavItemClick("/contactus")}>
                Contact Us
              </Nav.Link>
              <Nav.Link onClick={() => handleNavItemClick("/reviews")}>
                Reviews
              </Nav.Link>
              
              {!isAuthenticated ? (
                <>
                  <Nav.Link onClick={() => handleNavItemClick("/register")}>
                    Register
                  </Nav.Link>
                  <Nav.Link onClick={() => handleNavItemClick("/login")}>
                    Login
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link onClick={() => handleNavItemClick("/profile")}>
                    My Profile
                  </Nav.Link>
                  {userGroups && userGroups.includes("admin") ? (
                    <Nav
                      .Link onClick={() => handleNavItemClick("/admin-dashboard")}>
                      Admin Dashboard
                    </Nav.Link>
                  ) : (
                    <Nav.Link onClick={() => handleNavItemClick("/userdashboard")}>
                      My Dashboard
                    </Nav.Link>
                  )}
                  <Nav.Link onClick={handleLogout} className="text-danger">
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