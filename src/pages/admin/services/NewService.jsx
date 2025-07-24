import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import API from "../../../api";

const NewService = ({ show, handleClose, refreshServices }) => {
  const [formData, setFormData] = useState({
    category: "video",
    audio_category: "",
    description: "",
    price: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const audioSubcategories = [
    { value: "beat_making", label: "Beat Making" },
    { value: "sound_recording", label: "Sound Recording" },
    { value: "mixing", label: "Mixing" },
    { value: "mastering", label: "Mastering" },
    { value: "music_video", label: "Music Video Production" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        audio_category: value === "audio" ? prev.audio_category : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    console.log("File selected:", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("File preview:", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        // Skip appending audio_category if category is not audio
        if (key === "audio_category" && formData.category !== "audio") return;
        formDataToSend.append(key, formData[key]);
      });

      const accessToken = sessionStorage.getItem("accessToken");
      console.log("Access Token being sent:", accessToken);
      console.log("Form Data being sent:", formData);

      await API.post("/service/", formDataToSend, {
        withCredentials: true,
      });

      setSuccess("Service added successfully!");
      refreshServices();
      setTimeout(() => {
        setSuccess("");
        handleClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to add service. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Service</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="phot-video">Photo & Video Shooting</option>
              <option value="audio">Music Production</option>
              <option value="graphic">Graphic Designing</option>
              <option value="broadcasting">Digital Broadcasting</option>
            </Form.Select>
          </Form.Group>

          {formData.category === "audio" && (
            <Form.Group className="mb-3">
              <Form.Label>Audio Subcategory</Form.Label>
              <Form.Select
                name="audio_category"
                value={formData.audio_category}
                onChange={handleChange}
                required
              >
                <option value="">Select Subcategory</option>
                {audioSubcategories.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              required
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price (KSH)</Form.Label>
            <Form.Control
              type="number"
              name="price"
              step="0.01"
              required
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              Add Service
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NewService;