import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PasswordModal from "./PasswordModal";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ password: "" });
  const [show, setShow] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/reset-password/${uid}/${token}/`, values);
      alert("Password has been reset successfully!");
      setShow(false);
      navigate("/login");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Invalid or expired reset link.");
    }
  };

  return (
    <PasswordModal
      show={show}
      handleClose={() => navigate("/")}
      title="Reset Your Password"
      onSubmit={handleSubmit}
      fields={[{ name: "password", label: "New Password", type: "password" }]}
      values={values}
      setValues={setValues}
    />
  );
};

export default ResetPassword;
