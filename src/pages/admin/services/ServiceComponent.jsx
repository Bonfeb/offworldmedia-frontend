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
} from "react-bootstrap";
import { Alert, Snackbar } from "@mui/material";
import API from "../../../api";

const ServiceComponent = ({ category, title }) => {
  const [serviceDetails, setServiceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  
  // Loading states for update and delete operations
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Alert states
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await API.get(`/admin-dashboard/?action=services&category=${category}`);
      setServiceDetails(response.data);
      console.log(`📋 Fetched ${response.data.length} services for category: ${category}`);
      setLoading(false);
    } catch (err) {
      console.error(`❌ Failed to load services:`, {
        category,
        error: err.response?.data || err.message
      });
      setError(`Failed to load ${title} service. Please try again later.`);
      setLoading(false);
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
    if (reason === 'clickaway') {
      return;
    }
    setAlertConfig({...alertConfig, open: false});
  };

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      image: service.image,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setIsUpdating(false); // Reset updating state when closing modal
  };

  const handleOpenDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedService(null);
    setIsDeleting(false); // Reset deleting state when closing modal
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
    setIsUpdating(true); // Start loading state

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);

      if (formData.image && formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      const response = await API.put(`/service/${selectedService.id}/`, formDataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Service Updated Successfully:", {
        service: selectedService.name,
        id: selectedService.id,
        response: response.data
      });
      
      showAlert("Service Updated Successfully!", "success");
      handleCloseModal();
      fetchServices();
    } catch (err) {
      console.error("❌ Error updating service:", {
        service: selectedService?.name,
        id: selectedService?.id,
        error: err.response?.data || err.message
      });
      showAlert("Failed to Update service. Please try again.", "error");
    } finally {
      setIsUpdating(false); // End loading state
    }
  };

  const handleDelete = async () => {
    if (selectedService) {
      setIsDeleting(true); // Start loading state
      
      try {
        const response = await API.delete(`/service/${selectedService.id}/`, {
          withCredentials: true,
        });
        
        console.log("✅ Service Deleted Successfully:", {
          service: selectedService.name,
          id: selectedService.id,
          response: response.data
        });
        
        showAlert("Service deleted Successfully!", "success");
        handleCloseDeleteModal();
        fetchServices();
      } catch (err) {
        console.error("❌ Error deleting service:", {
          service: selectedService?.name,
          id: selectedService?.id,
          error: err.response?.data || err.message
        });
        showAlert("Failed to Delete service. Please try again.", "error");
      } finally {
        setIsDeleting(false); // End loading state
      }
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold text-center text-primary">{title} Service</h2>

      {/* Global MUI Alert/Snackbar */}
      <Snackbar 
        open={alertConfig.open} 
        autoHideDuration={5000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertConfig.severity} 
          sx={{ width: '100%' }}
          variant="filled"
          elevation={6}
        >
          {alertConfig.message}
        </Alert>
      </Snackbar>

      <Row className="g-4">
        {serviceDetails.map((service) => (
          <Col key={service.id} xs={12} className="mb-4">
            <Card className="shadow-lg border-0 p-3">
              <Row className="align-items-center">
                <Col md={5} className="text-center">
                  <Card.Img
                    src={service.image}
                    alt={service.name}
                    style={{ maxHeight: "250px", objectFit: "cover" }}
                  />
                </Col>
                <Col md={7}>
                  <Card.Body>
                    <Card.Title className="fw-bold">{service.name}</Card.Title>
                    <hr />
                    <h5 className="text-primary">
                      KSH {parseFloat(service.price).toFixed(2)}
                    </h5>
                    <hr />
                    <Card.Text className="text-muted">
                      {service.description}
                    </Card.Text>
                    <hr />
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        onClick={() => handleOpenModal(service)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleOpenDeleteModal(service)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Update Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update {title} Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                readOnly
                disabled={isUpdating}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isUpdating}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price (KSH)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={isUpdating}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUpdating}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button 
                type="submit" 
                variant="success"
                disabled={isUpdating}
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
                  'Save Changes'
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="ms-2"
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedService?.name}"? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseDeleteModal}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
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
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServiceComponent;