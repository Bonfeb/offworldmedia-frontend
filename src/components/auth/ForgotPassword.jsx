import React, { useState } from "react";
import axios from "axios";
import PasswordModal from "./PasswordModal";

const ForgotPassword = ({ show, handleClose }) => {
  const [values, setValues] = useState({ email: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/forgot-password/", {
        ...values,
        frontend_url: window.location.origin,
      });
      alert("Password reset link sent!");
      handleClose();
    } catch (err) {
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
