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
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function NavBar() {
  const { isAuthenticated, userProfilePic, userGroups, logout } =
    useContext(AuthContext);

  const [showNavbar, setShowNavbar] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setDrawerOpen(false);
    setAnchorEl(null);
    navigate(path);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const colors = {
    antiqueBlue: "#021d33ff",
    shadeBlue: "#043a66ff",
  };

  const menuItems = [
    { text: "Home", path: "/" },
    { text: "Team", path: "/team" },
    { text: "Contact Us", path: "/contactus" },
    { text: "Services", path: "/services" },
    { text: "Gallery", path: "/media-gallery" },
    { text: "Reviews", path: "/reviews" },
  ];

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
              }}
            >
              OffWorld Media
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Nav */}
          <Box
            sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center" }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  color: "white",
                  mx: 1,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": { backgroundColor: colors.shadeBlue },
                }}
                onClick={() => handleNavItemClick(item.path)}
              >
                {item.text}
              </Button>
            ))}

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
                    sx: { backgroundColor: colors.antiqueBlue, color: "white" },
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

          {/* Mobile Menu Icon */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            sx={{ display: { xs: "flex", lg: "none" } }}
            onClick={() => {
              console.log("Menu Icon clicked");
              setDrawerOpen(true);}}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.antiqueBlue,
            color: "white",
            width: 250,
          },
        }}
      >
        <Box sx={{ textAlign: "center", p: 2 }}>
          <Typography variant="h6">OffWorld Media</Typography>
        </Box>
        <Divider sx={{ backgroundColor: "white" }} />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavItemClick(item.path)}
            >
              <ListItemText primary={item.text} />
            </ListItem>
          ))}

          {!isAuthenticated ? (
            <>
              <ListItem button onClick={() => handleNavItemClick("/register")}>
                <ListItemText primary="Register" />
              </ListItem>
              <ListItem button onClick={() => handleNavItemClick("/login")}>
                <ListItemText primary="Login" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => handleNavItemClick("/profile")}>
                <ListItemText primary="My Profile" />
              </ListItem>
              {userGroups && userGroups.includes("admin") ? (
                <ListItem
                  button
                  onClick={() => handleNavItemClick("/admin-dashboard")}
                >
                  <ListItemText primary="Admin Dashboard" />
                </ListItem>
              ) : (
                <ListItem
                  button
                  onClick={() => handleNavItemClick("/userdashboard")}
                >
                  <ListItemText primary="My Dashboard" />
                </ListItem>
              )}
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" sx={{ color: "#ff4d4f" }} />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}

export default NavBar;
