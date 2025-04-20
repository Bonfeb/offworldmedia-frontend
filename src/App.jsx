import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import ProfileUpdate from "./pages/ProfileUpdate";
import UserDashboard from "./pages/UserDashboard";
import FillEventDetails from "./pages/EventDetails";
import ContactUs from "./pages/ContactUs";
import Reviews from "./pages/Reviews";
import AdminServices from "./pages/admin/AdminServices";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "./assets/css/AdminDashboard.css";
import AdminUsers from "./pages/admin/AdminUsers";
import PendingBookings from "./pages/admin/bookings/PendingBookings";
import CancelledBookings from "./pages/admin/bookings/CancelledBookings";
import CompletedBookings from "./pages/admin/bookings/CompletedBookings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import VideoRecording from "./pages/admin/services/VideoRecording";
import AudioRecording from "./pages/admin/services/AudioRecording";
import PhotoShooting from "./pages/admin/services/PhotoShooting";
import ResetPassword from "./components/auth/ResetPassword";
import ForgotPassword from "./components/auth/ForgotPassword";

function App() {
  return (
    <Router>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh" // Ensures the app container takes at least the full viewport height
      }}>
        <NavBar />
        <div style={{ flex: "1 0 auto" }}> {/* This makes content area expand to push footer down */}
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
            <Route path="/review/:serviceId" element={<Reviews />} />
            <Route
              path="/event-details/:serviceId"
              element={<FillEventDetails />}
            />
            <Route
              path="/event-details/:serviceId/:bookingId?"
              element={<FillEventDetails />}
            />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/forgot-password/" element={<ForgotPassword />} />


            {/*Admin Dashboard with Nested Routes*/}
            <Route path="/admin-dashboard" element={<AdminDashboard />}>
              <Route
                index
                element={<AdminDashboard/>}
              />
              <Route path="pending-bookings" element={ <PendingBookings /> } />
              <Route path="completed-bookings" element={ <CompletedBookings /> } />
              <Route path="cancelled-bookings" element={ <CancelledBookings /> } />
              <Route path="services" element={ <AdminServices /> } />
              <Route path="video-recording" element={ <VideoRecording /> } />
              <Route path="audio-recording" element={ <AudioRecording /> } />
              <Route path="photo-shooting" element={ <PhotoShooting /> } />
              <Route path="users" element={ <AdminUsers /> } />
              <Route path="reviews" element={<AdminReviews/>} />
              <Route path="messages" element={<AdminMessages/>} />
            </Route>
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;