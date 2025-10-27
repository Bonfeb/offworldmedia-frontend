import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/images/Logo.ico";
import { AuthContext } from "../context/AuthContext";
import { IconButton } from "@mui/material";
import { Offcanvas, Nav } from "react-bootstrap";
import MenuIcon from "@mui/icons-material/Menu";

function NavBar() {
  const { isAuthenticated, userProfilePic, userGroups, logout } =
    useContext(AuthContext);

  const [showNavbar, setShowNavbar] = useState(true);
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
    navigate(path);
  };

  const handleOffcanvasToggle = () => {
    setShowOffcanvas(!showOffcanvas);
  };

  const handleOffcanvasClose = () => {
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
    {/* Fixed Header with Brand and Menu */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          backgroundColor: colors.antiqueBlue,
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        {/* Brand Logo and Name */}
        <div
          onClick={handleBrandClick}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "8px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.shadeBlue;
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <img
            src={Logo}
            alt="OffWorldMedia Logo"
            style={{
              height: "40px",
              marginRight: "12px",
            }}
          />
          <span
            style={{
              color: "white",
              fontSize: "clamp(16px, 4vw, 20px)",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            Offworld Media
          </span>
        </div>

        {/* Floating Hamburger Menu Button */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleOffcanvasToggle}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1300,
            backgroundColor: colors.antiqueBlue,
            color: "white",
            width: 56,
            height: 56,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            "&:hover": {
              backgroundColor: colors.shadeBlue,
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <MenuIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </div>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleOffcanvasClose}
        placement="end"
        backdrop={true}
        style={{
          backgroundColor: colors.antiqueBlue,
          color: "white",
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
            className="d-flex justify-content-center align-items-center"
            style={{ color: "white", fontWeight: "bold", width: "100%" }}
          >
            <img
              src={Logo}
              alt="OffWorldMedia Logo"
              style={{ height: 40, marginRight: 8 }}
            />
            Offworld Media
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ zIndex: 1401 }}>
          <Nav className="flex-column justify-content-center align-items-center">
            {menuItems.map((item) => (
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
