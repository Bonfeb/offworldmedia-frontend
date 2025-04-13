import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import API from '../../../api';

const NewService = ({ show, handleClose, refreshServices }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'video',
    description: '',
    price: '',
    image: null,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      await API.post('/service/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      setSuccess('Service added successfully!');
      refreshServices();
      setTimeout(() => {
        setSuccess('');
        handleClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to add service. Please try again.');
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
            <Form.Label>Service Name</Form.Label>
            <Form.Control type="text" name="name" required onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select name="category" onChange={handleChange}>
              <option value="video">Video Recording</option>
              <option value="audio">Audio Recording</option>
              <option value="photo">Photo Shooting</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" name="description" required onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price (KSH)</Form.Label>
            <Form.Control type="number" name="price" step="0.01" required onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit">Add Service</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NewService;
