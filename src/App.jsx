import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Service from "./pages/Service";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import "./assets/css/Home.css";
import "./assets/css/Login.css";
import "./assets/css/Register.css";
import "./assets/css/Service.css";
import "./assets/css/Reviews.css";
import "./assets/css/AdminReviews.css";
import "./assets/css/AdminTeam.css";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import ProfileUpdate from "./pages/ProfileUpdate";
import UserDashboard from "./pages/UserDashboard";
import FillEventDetails from "./pages/EventDetails";
import ContactUs from "./pages/ContactUs";
import Reviews from "./pages/Reviews";
import AdminServices from "./pages/admin/services/AdminServices";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "./assets/css/AdminDashboard.css";
import AdminUsers from "./pages/admin/AdminUsers";
import CancelledBookings from "./pages/admin/bookings/CancelledBookings";
import CompletedBookings from "./pages/admin/bookings/CompletedBookings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import ResetPassword from "./components/auth/ResetPassword";
import ForgotPassword from "./components/auth/ForgotPassword";
import AdminTeam from "./pages/admin/AdminTeam";
import AllBookings from "./pages/admin/bookings/AllBookings";
import MediaGallery from "./pages/MediaGallery";
import AllReviews from "./pages/AllReviews";
import Media from "./pages/admin/Media";
import UnpaidBookings from "./pages/admin/bookings/UnpaidBookings";
import PaidBookings from "./pages/admin/bookings/PaidBookings";

function App() {
  return (
    <Router>
      <Box
        sx={{
          background:
            "linear-gradient(to right,rgb(64, 70, 82),rgb(66, 76, 92))", // nice blue gradient
          minHeight: "100vh",
          width: "100%",
          color: "#fff", // optional: white text on dark bg
          [(theme) => theme.breakpoints.down("sm")]: {
            background:
              "linear-gradient(to bottom,rgb(81, 88, 100),rgb(63, 71, 85))", // mobile-friendly direction
          },
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh", // Ensures the app container takes at least the full viewport height
          }}
        >
          <NavBar />
          <div style={{ flex: "1 0 auto" }}>
            {" "}
            {/* This makes content area expand to push footer down */}
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/update" element={<ProfileUpdate />} />
              <Route path="/userdashboard" element={<UserDashboard />} />
              <Route path="/booking/:service_id" element={<Booking />} />
              <Route path="/" element={<Home />} />
              <Route path="/team" element={<Team />} />
              <Route path="/services" element={<Service />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/all-reviews" element={<AllReviews />} />
              <Route path="/media-gallery" element={<MediaGallery />} />
              <Route path="/review/:serviceId" element={<Reviews />} />
              <Route
                path="/event-details/:serviceId"
                element={<FillEventDetails />}
              />
              <Route
                path="/event-details/:serviceId/:bookingId?"
                element={<FillEventDetails />}
              />
              <Route
                path="/reset-password/:uidb64/:token"
                element={<ResetPassword />}
              />

              {/*Admin Dashboard with Nested Routes*/}
              <Route path="/admin-dashboard" element={<AdminDashboard />}>
                <Route index element={<></>} />
                <Route path="unpaid-bookings" element={<UnpaidBookings />} />
                <Route path="paid-bookings" element={<PaidBookings />} />
                <Route
                  path="completed-bookings"
                  element={<CompletedBookings />}
                />
                <Route
                  path="cancelled-bookings"
                  element={<CancelledBookings />}
                />
                <Route path="all-bookings" element={<AllBookings />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="media" element={<Media />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="team-members" element={<AdminTeam />} />
              </Route>
            </Routes>
          </div>
          <Footer />
        </div>
      </Box>
    </Router>
  );
}

export default App;
