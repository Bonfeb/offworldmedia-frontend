import React, { useState } from "react";
import axios from "axios";
import PasswordModal from "./PasswordModal";
import API from "../../api";

const ForgotPassword = ({ show, handleClose }) => {
  const [values, setValues] = useState({ email: "" });

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      ...values,
      frontend_url: window.location.origin,
    };

    console.log("Submitting forgot password request with payload:", payload);

    const response = await API.post("/forgot-password/", payload,{
      withCredentials: false,
    });

    console.log("Server response:", response.data); // ✅ Check server response

    alert("Password reset link sent!");
    handleClose();
  } catch (err) {
    console.error("Error sending reset link:", err); // ✅ Show full error
    if (err.response) {
      console.error("Error response data:", err.response.data);
    }
    alert("Error sending reset link");
  }
};

  return (
    <PasswordModal
      show={show}
      handleClose={handleClose}
      title="Forgot Password"
      onSubmit={handleSubmit}
      fields={[{ name: "email", label: "Email", type: "email" }]}
      values={values}
      setValues={setValues}
    />
  );
};

export default ForgotPassword;
