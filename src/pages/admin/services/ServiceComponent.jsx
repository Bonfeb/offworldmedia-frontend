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
  Alert,
} from "react-bootstrap";
import API from "../../../api";

const ServiceComponent = ({ category, title }) => {
  const [serviceDetails, setServiceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Add state for delete modal
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await API.get("/services/");

      // Ensure response data has expected structure
      const services = response.data.services[category] || [];
      console.log("Services:", response);

      if (services) {
        setServiceDetails(services);
      } else {
        // Handle cases where services are structured differently
        const filteredServices = response.data.filter(
          (service) => service.category === category
        );
        setServiceDetails(filteredServices);
      }

      setLoading(false);
    } catch (err) {
      setError(`Failed to load ${title} services. Please try again later.`);
      setLoading(false);
    }
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
  };

  const handleOpenDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedService(null);
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);

      if (formData.image && formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      await API.put(`/service/${selectedService.id}/`, formDataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("Service Updated Successfully!");
      handleCloseModal();
      fetchServices();

      setTimeout(() => {
        setSuccessMessage("");
        handleCloseModal();
      }, 2000);
    } catch (err) {
      console.error("Error updating service:", err);
      setUpdateError("Failed to Update service. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (selectedService) {
      try {
        await API.delete(`/service/${selectedService.id}/`, {
          withCredentials: true,
        });
        setSuccessMessage("Service deleted Successfully!");
        handleCloseDeleteModal(); // Close delete modal after deletion
        fetchServices();

        setTimeout(() => {
          setSuccessMessage("");
          handleCloseDeleteModal();
        }, 5000);
      } catch (err) {
        console.error("Error deleting service:", err);
        setDeleteError("Failed to Delete service. Please try again.");
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
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold text-center text-primary">{title} Service</h2>

      <Row className="g-4">
        {serviceDetails.map((service) => (
          <Col key={service.id} xs={12} className="mb-4">
            <Card className="shadow-lg border-0 p-3">
              <Row className="align-items-center">
                <Col md={5} className="text-center">
                  <Card.Img
                    src={`https://offworldmedia-backend.onrender.com/api${service.image}`}
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
          {updateError && (
            <Alert variant="danger" className="text-center">
              {updateError}
            </Alert>
          )}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button type="submit" variant="success">
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="ms-2"
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
          {deleteError && (
            <Alert variant="danger" className="text-center">
              {deleteError}
            </Alert>
          )}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          Are you sure you want to delete "{selectedService?.name}"? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServiceComponent;
