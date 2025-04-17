// PasswordModal.jsx
import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { TextField, InputAdornment, Typography, Box, LinearProgress } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faKey } from "@fortawesome/free-solid-svg-icons";

const PasswordModal = ({
  show,
  handleClose,
  title,
  onSubmit,
  fields,
  values,
  setValues,
}) => {
  const [showPassword, setShowPassword] = useState({});
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("");

  const toggleShowPassword = (fieldName) => {
    setShowPassword((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const calculateStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    switch (score) {
      case 0:
      case 1:
        setStrengthLabel("Weak");
        setStrength(25);
        break;
      case 2:
        setStrengthLabel("Fair");
        setStrength(50);
        break;
      case 3:
        setStrengthLabel("Good");
        setStrength(75);
        break;
      case 4:
        setStrengthLabel("Strong");
        setStrength(100);
        break;
      default:
        setStrengthLabel("");
        setStrength(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    if (name.toLowerCase().includes("password")) {
      calculateStrength(value);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faKey} className="me-2" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={onSubmit}>
        <Modal.Body>
          {fields.map((field, index) => (
            <Box key={index} mb={2}>
              <TextField
                fullWidth
                variant="outlined"
                type={
                  field.type === "password" && showPassword[field.name]
                    ? "text"
                    : field.type
                }
                label={field.label}
                name={field.name}
                value={values[field.name] || ""}
                onChange={handleChange}
                InputProps={{
                  endAdornment:
                    field.type === "password" ? (
                      <InputAdornment position="end">
                        <FontAwesomeIcon
                          icon={
                            showPassword[field.name] ? faEyeSlash : faEye
                          }
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleShowPassword(field.name)}
                        />
                      </InputAdornment>
                    ) : null,
                }}
              />
            </Box>
          ))}

          {/* Show password strength meter if there's a password field */}
          {fields.some((f) => f.type === "password") && (
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                Password Strength: {strengthLabel}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={strength}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      strength < 50
                        ? "#e53935"
                        : strength < 75
                        ? "#fbc02d"
                        : "#43a047",
                  },
                }}
              />
            </Box>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PasswordModal;
