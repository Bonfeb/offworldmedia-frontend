import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { Badge } from "@mui/material";
import { Plus } from "lucide-react";
import API from "../../../api";

const NewService = ({ show, handleClose, refreshServices, showAlert }) => {
  const [formData, setFormData] = useState({
    category: "photo-video",
    audio_category: "",
    description: "",
    price: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioSubcategories = [
    { value: "beat_making", label: "Beat Making" },
    { value: "sound_recording", label: "Sound Recording" },
    { value: "mixing", label: "Mixing" },
    { value: "mastering", label: "Mastering" },
    { value: "music_video", label: "Music Video Production" },
  ];

  const categoryLabels = {
    "photo-video": "Photo & Video Shooting",
    "audio": "Music Production",
    "graphic": "Graphic Designing",
    "broadcasting": "Digital Broadcasting"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear any existing errors when user starts typing
    if (error) setError("");
    
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
    // Clear any existing errors when user selects a file
    if (error) setError("");
    
    setFormData((prev) => ({ ...prev, image: file }));
    console.log("File selected:", file);
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        e.target.value = ""; // Clear the input
        setFormData((prev) => ({ ...prev, image: null }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        e.target.value = ""; // Clear the input
        setFormData((prev) => ({ ...prev, image: null }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("File preview:", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "photo-video",
      audio_category: "",
      description: "",
      price: "",
      image: null,
    });
    setError("");
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      resetForm();
      handleClose();
    }
  };

  const validateForm = () => {
    if (!formData.category) {
      setError("Please select a category");
      return false;
    }
    
    if (formData.category === "audio" && !formData.audio_category) {
      setError("Please select an audio subcategory");
      return false;
    }
    
    if (!formData.description.trim()) {
      setError("Please enter a description");
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Please enter a valid price greater than 0");
      return false;
    }
    
    if (!formData.image) {
      setError("Please select an image");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", formData.price);
      formDataToSend.append("image", formData.image);
      
      // Only append audio_category if category is audio
      if (formData.category === "audio" && formData.audio_category) {
        formDataToSend.append("audio_category", formData.audio_category);
      }

      // Debug logging
      console.log("Form Data being sent:", {
        category: formData.category,
        audio_category: formData.audio_category,
        description: formData.description,
        price: formData.price,
        image: formData.image ? formData.image.name : null,
      });

      const response = await API.post("/service/", formDataToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("✅ Service added successfully:", response.data);
      
      // Show success snackbar if showAlert function is provided
      if (showAlert) {
        showAlert(
          `${categoryLabels[formData.category]} service added successfully! 🎉`, 
          "success"
        );
      }
      
      // Refresh services list
      if (refreshServices) {
        refreshServices();
      }
      
      // Reset form and close modal
      resetForm();
      handleClose();
      
    } catch (err) {
      console.error("❌ Error adding service:", err.response?.data || err.message);
      
      // Handle different types of errors
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const firstError = Object.values(errorData)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError(errorData.message || "Invalid data. Please check your inputs.");
        }
      } else if (err.response?.status === 401) {
        setError("You are not authorized. Please log in again.");
      } else if (err.response?.status === 413) {
        setError("Image file is too large. Please select a smaller image.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.message || 
          err.message ||
          "Failed to add service. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleModalClose} 
      centered
      size="lg"
      backdrop={isSubmitting ? "static" : true}
      keyboard={!isSubmitting}
    >
      <Modal.Header 
        closeButton={!isSubmitting}
        style={{
          background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
          color: "white",
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <Plus size={24} className="me-2" />
          Add New Service
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-4">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Category *</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              size="lg"
            >
              <option value="photo-video">Photo & Video Shooting</option>
              <option value="audio">Music Production</option>
              <option value="graphic">Graphic Designing</option>
              <option value="broadcasting">Digital Broadcasting</option>
            </Form.Select>
          </Form.Group>

          {formData.category === "audio" && (
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Audio Subcategory *</Form.Label>
              <Form.Select
                name="audio_category"
                value={formData.audio_category}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                size="lg"
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

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Description *</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              rows={4}
              size="lg"
              placeholder="Enter a detailed description of your service..."
              style={{ resize: "vertical" }}
            />
            <Form.Text className="text-muted">
              Provide a clear and engaging description of what your service offers.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Price (KSH) *</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              step="0.01"
              min="0.01"
              onChange={handleChange}
              disabled={isSubmitting}
              required
              size="lg"
              placeholder="0.00"
            />
            <Form.Text className="text-muted">
              Enter the price in Kenyan Shillings (KSH).
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Service Image *</Form.Label>
            <Form.Control
              type="file"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={isSubmitting}
              required
              size="lg"
            />
            <Form.Text className="text-muted">
              Upload a high-quality image to showcase your service. 
              Supported formats: JPEG, PNG, GIF, WebP. Maximum size: 5MB.
            </Form.Text>
            
            {/* Image preview */}
            {formData.image && (
              <div className="mt-3">
                <small className="text-muted">Selected file:</small>
                <div className="d-flex align-items-center mt-1">
                  <Badge bg="success" className="me-2">
                    {formData.image.name}
                  </Badge>
                  <small className="text-muted">
                    ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                </div>
              </div>
            )}
          </Form.Group>
          
          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={handleModalClose}
              disabled={isSubmitting}
              size="lg"
              className="px-4"
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="px-4"
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Adding Service...
                </>
              ) : (
                <>
                  <Plus size={16} className="me-2" />
                  Add Service
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NewService;