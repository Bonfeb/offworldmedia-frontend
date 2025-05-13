import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PasswordModal from "./PasswordModal";
import API from "../../api";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ password: "" });
  const [show, setShow] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.password || !values.confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (values.password !== values.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      await API.post(
        `/reset-password/${uid}/${token}/`,
        {
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Password has been reset successfully!");
      setShow(false);
      navigate("/login");
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Invalid or expired reset link.";
      console.error("Reset error:", errorMsg);
      alert(errorMsg);
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
