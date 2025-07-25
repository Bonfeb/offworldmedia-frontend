import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Spinner,
  Badge,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { Alert, Snackbar } from "@mui/material";
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  Music,
  Camera,
  Palette,
  Radio,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../../api";

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    image: null,
    audio_category: "",
  });

  // Loading states for operations
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert states
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Category configurations
  const categoryConfig = {
    "photo-video": {
      icon: Camera,
      color: "primary",
      label: "Photo & Video",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    audio: {
      icon: Music,
      color: "success",
      label: "Music Production",
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    graphic: {
      icon: Palette,
      color: "warning",
      label: "Graphic Design",
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    broadcasting: {
      icon: Radio,
      color: "info",
      label: "Digital Broadcasting",
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  };

  const audioSubcategories = {
    beat_making: "Beat Making",
    sound_recording: "Sound Recording",
    mixing: "Mixing",
    mastering: "Mastering",
    music_video: "Music Video Production",
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Remove the automatic filtering on mount - only show all services initially
  useEffect(() => {
    if (services.length > 0) {
      setFilteredServices(services);
    }
  }, [services]);

  const fetchServices = async () => {
    try {
      const response = await API.get("/services/", {
        withCredentials: true,
      });

      // Ensure response.data is an array
      const servicesData = Array.isArray(response.data) ? response.data : [];
      setServices(servicesData);
      console.log(`📋 Fetched ${servicesData.length} services`);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load services:", {
        error: err.response?.data || err.message,
      });
      setError("Failed to load services. Please try again later.");
      setServices([]); // Ensure services is always an array
      setLoading(false);
    }
  };

  // New search function that only runs when explicitly called
  const handleSearch = () => {
    if (!Array.isArray(services)) {
      setFilteredServices([]);
      return;
    }

    let filtered = services;

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (service) => service.category === filterCategory
      );
    }

    // Filter by search term (only category, audio_category, or price)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((service) => {
        // Search by price
        const priceMatch =
          service.price &&
          service.price.toString().toLowerCase().includes(searchLower);

        // Search by category
        const categoryMatch =
          service.category &&
          service.category.toLowerCase().includes(searchLower);

        // Search by audio subcategory
        const audioMatch =
          service.audio_category &&
          audioSubcategories[service.audio_category]
            ?.toLowerCase()
            .includes(searchLower);

        return priceMatch || categoryMatch || audioMatch;
      });
    }

    setFilteredServices(filtered);
  };

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const showAlert = (message, severity) => {
    setAlertConfig({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertConfig({ ...alertConfig, open: false });
  };

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setFormData({
      description: service.description || "",
      price: service.price || "",
      image: service.image || null,
      audio_category: service.audio_category || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setIsUpdating(false);
  };

  const handleOpenDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedService(null);
    setIsDeleting(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);

      if (selectedService.category === "audio" && formData.audio_category) {
        formDataToSend.append("audio_category", formData.audio_category);
      }

      if (formData.image && formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      const response = await API.put(
        `/service/${selectedService.id}/`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Service Updated Successfully:", response.data);
      showAlert("Service updated successfully!", "success");
      handleCloseModal();
      fetchServices();
    } catch (err) {
      console.error(
        "❌ Error updating service:",
        err.response?.data || err.message
      );
      showAlert("Failed to update service. Please try again.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (selectedService) {
      setIsDeleting(true);

      try {
        await API.delete(`/service/${selectedService.id}/`, {
          withCredentials: true,
        });

        console.log("✅ Service Deleted Successfully");
        showAlert("Service deleted successfully!", "success");
        handleCloseDeleteModal();
        fetchServices();
      } catch (err) {
        console.error(
          "❌ Error deleting service:",
          err.response?.data || err.message
        );
        showAlert("Failed to delete service. Please try again.", "error");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getCategoryIcon = (category) => {
    const IconComponent = categoryConfig[category]?.icon || Camera;
    return <IconComponent size={24} />;
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard/");
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <div className="mt-3">
            <h5 className="text-muted">Loading services...</h5>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Alert severity="error" className="w-100 text-center">
          <h4>Oops! Something went wrong</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchServices} className="mt-2">
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-3">
      {/* Header Section */}
      <div className="text-center mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            variant="outline-primary"
            size="lg"
            onClick={handleBackToDashboard}
            className="d-flex align-items-center px-4 py-2"
            style={{
              borderRadius: "50px",
              fontWeight: "600",
              border: "2px solid #0d6efd",
            }}
          >
            <ArrowLeft size={20} className="me-2" />
            BACK TO DASHBOARD
          </Button>
          <div style={{ width: "200px" }}></div> {/* Spacer for centering */}
        </div>

        <h1 className="display-4 fw-bold text-primary mb-3">
          Service Management
        </h1>
        <p className="lead text-muted text-secondary">
          Manage all your creative services in one place
        </p>
      </div>

      {/* Global Alert */}
      <Snackbar
        open={alertConfig.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertConfig.severity}
          sx={{ width: "100%" }}
          variant="filled"
          elevation={6}
        >
          {alertConfig.message}
        </Alert>
      </Snackbar>

      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col lg={6} md={12} className="mb-3">
          <InputGroup size="lg">
            <FormControl
              placeholder="Search by category, audio subcategory, or price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ fontSize: "1rem" }}
            />
            <Button
              variant="primary"
              onClick={handleSearch}
              className="d-flex align-items-center px-3"
            >
              <Search size={20} className="me-1" />
              Search
            </Button>
          </InputGroup>
        </Col>
        <Col lg={6} md={12}>
          <InputGroup size="lg">
            <InputGroup.Text>
              <Filter size={20} />
            </InputGroup.Text>
            <Form.Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ fontSize: "1rem" }}
            >
              <option value="all">All Categories</option>
              <option value="photo-video">Photo & Video Shooting</option>
              <option value="audio">Music Production</option>
              <option value="graphic">Graphic Design</option>
              <option value="broadcasting">Digital Broadcasting</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* Services Grid */}
      {!Array.isArray(filteredServices) || filteredServices.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <Search size={64} className="text-muted" />
          </div>
          <h3 className="text-secondary">No services found</h3>
          <p className="text-secondary">
            {searchTerm || filterCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No services have been added yet"}
          </p>
        </div>
      ) : (
        <Row className="g-4">
          {filteredServices.map((service) => (
            <Col key={service.id} xl={6} lg={12} className="mb-4">
              <Card
                className="h-100 shadow-lg border-0 overflow-hidden"
                style={{
                  background: categoryConfig[service.category]?.bgGradient,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(0,0,0,0.1)";
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    margin: "8px",
                    borderRadius: "12px",
                  }}
                >
                  <Row className="g-0 align-items-center">
                    <Col md={5} className="text-center p-3">
                      <div className="position-relative">
                        <img
                          src={service.image}
                          alt={service.category}
                          className="img-fluid rounded-3 shadow"
                          style={{
                            maxHeight: "200px",
                            objectFit: "cover",
                            width: "100%",
                          }}
                        />
                        <Badge
                          bg={categoryConfig[service.category]?.color}
                          className="position-absolute top-0 start-0 m-2 p-2"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {getCategoryIcon(service.category)}
                          <span className="ms-2">
                            {categoryConfig[service.category]?.label}
                          </span>
                        </Badge>
                      </div>
                    </Col>
                    <Col md={7}>
                      <Card.Body className="p-4">
                        <div className="mb-3">
                          <h4 className="fw-bold text-dark mb-2">
                            {categoryConfig[service.category]?.label}
                          </h4>

                          {/* Audio Subcategory Display */}
                          {service.category === "audio" &&
                            service.audio_category && (
                              <div className="mb-3">
                                <Badge
                                  bg="success"
                                  className="p-2"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  <Music size={16} className="me-1" />
                                  {audioSubcategories[service.audio_category]}
                                </Badge>
                              </div>
                            )}

                          <div className="mb-3">
                            <h3 className="text-primary fw-bold mb-0">
                              KSH{" "}
                              {service.price
                                ? parseFloat(service.price).toLocaleString()
                                : "0"}
                            </h3>
                          </div>
                        </div>

                        <Card.Text
                          className="text-muted mb-4"
                          style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                        >
                          {service.description &&
                          service.description.length > 120
                            ? `${service.description.substring(0, 120)}...`
                            : service.description || "No description available"}
                        </Card.Text>

                        <div className="d-flex gap-2 flex-wrap">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleOpenModal(service)}
                            className="d-flex align-items-center"
                          >
                            <Edit3 size={16} className="me-1" />
                            Update
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(service)}
                            className="d-flex align-items-center"
                          >
                            <Trash2 size={16} className="me-1" />
                            Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Update Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Modal.Title className="d-flex align-items-center">
            <Edit3 size={24} className="me-2" />
            Update{" "}
            {selectedService &&
              categoryConfig[selectedService.category]?.label}{" "}
            Service
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Audio Subcategory Field */}
            {selectedService?.category === "audio" && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Audio Subcategory</Form.Label>
                <Form.Select
                  name="audio_category"
                  value={formData.audio_category}
                  onChange={handleInputChange}
                  required
                  disabled={isUpdating}
                  size="lg"
                >
                  <option value="">Select Subcategory</option>
                  {Object.entries(audioSubcategories).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isUpdating}
                size="lg"
                style={{ resize: "vertical" }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Price (KSH)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={isUpdating}
                size="lg"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUpdating}
                size="lg"
              />
              <Form.Text className="text-muted">
                Leave empty to keep current image
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={isUpdating}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={isUpdating}
                size="lg"
                className="px-4"
              >
                {isUpdating ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit3 size={16} className="me-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
            color: "white",
          }}
        >
          <Modal.Title className="d-flex align-items-center">
            <Trash2 size={24} className="me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <Trash2 size={48} className="text-danger" />
          </div>
          <h5>Are you sure you want to delete this service?</h5>
          {selectedService && (
            <div className="mt-3 p-3 bg-light rounded">
              <strong>{categoryConfig[selectedService.category]?.label}</strong>
              {selectedService.category === "audio" &&
                selectedService.audio_category && (
                  <div className="text-muted">
                    Subcategory:{" "}
                    {audioSubcategories[selectedService.audio_category]}
                  </div>
                )}
              <div className="text-muted mt-2">
                KSH{" "}
                {selectedService.price
                  ? parseFloat(selectedService.price).toLocaleString()
                  : "0"}
              </div>
            </div>
          )}
          <p className="text-danger mt-3 mb-0">
            <strong>This action cannot be undone!</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseDeleteModal}
            disabled={isDeleting}
            size="lg"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            size="lg"
            className="px-4"
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="me-2" />
                Delete Service
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminServices;
