import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Spinner, Modal, Button, Dropdown, Form } from 'react-bootstrap';
import Slider from 'react-slick';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import API from '../../api';

// Constants
const MAX_RESULTS = 10;
const VIDEO_AUTOPLAY_DURATION = 180000; // 3 minutes in milliseconds

const Media = () => {
  // State for videos, images, loading states, errors, and modals
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null); // For updating media

  // Fetch Videos
  useEffect(() => {
    const fetchVideos = async () => {
      setVideoLoading(true);
      setVideoError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await API.get('/videos/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format from videos API');
        }
        setVideos(response.data);
        setVideoLoading(false);
      } catch (error) {
        setVideoLoading(false);
        if (axios.isCancel(error)) {
          setVideoError('Request timed out. Please try again.');
        } else if (error.response) {
          setVideoError(`Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          setVideoError('Network error. Please check your connection and try again.');
        } else {
          setVideoError(`Error fetching videos: ${error.message}`);
        }
        console.error('Detailed videos API error:', error);
      }
    };
    fetchVideos();
  }, [retryCount]);

  // Fetch Images
  useEffect(() => {
    const fetchImages = async () => {
      setImageLoading(true);
      setImageError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await API.get('/images/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format from images API');
        }
        setImages(response.data);
        setImageLoading(false);
      } catch (error) {
        setImageLoading(false);
        if (axios.isCancel(error)) {
          setImageError('Request timed out. Please try again.');
        } else if (error.response) {
          setImageError(`Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          setImageError('Network error. Please check your connection and try again.');
        } else {
          setImageError(`Error fetching images: ${error.message}`);
        }
        console.error('Detailed images API error:', error);
      }
    };
    fetchImages();
  }, [retryCount]);

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle add media submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !mediaType) return;

    const formData = new FormData();
    formData.append(mediaType, selectedFile);

    try {
      const endpoint = mediaType === 'image' ? '/images/' : '/videos/';
      const response = await API.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (mediaType === 'image') {
        setImages([...images, response.data]);
      } else {
        setVideos([...videos, response.data]);
      }
      setShowAddModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaType(null);
    } catch (error) {
      console.error(`Error uploading ${mediaType}:`, error);
      alert(`Failed to upload ${mediaType}. Please try again.`);
    }
  };

  // Handle update media submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedMedia || !mediaType) return;

    const formData = new FormData();
    formData.append(mediaType, selectedFile);

    try {
      const endpoint = mediaType === 'image' ? `/images/${selectedMedia.id}/` : `/videos/${selectedMedia.id}/`;
      const response = await API.put(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (mediaType === 'image') {
        setImages(images.map(item => item.id === selectedMedia.id ? response.data : item));
      } else {
        setVideos(videos.map(item => item.id === selectedMedia.id ? response.data : item));
      }
      setShowUpdateModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedMedia(null);
      setMediaType(null);
    } catch (error) {
      console.error(`Error updating ${mediaType}:`, error);
      alert(`Failed to update ${mediaType}. Please try again.`);
    }
  };

  // Open update modal
  const handleEditClick = (media, type) => {
    setSelectedMedia(media);
    setMediaType(type);
    setPreviewUrl(type === 'image' ? media.image : media.video);
    setShowUpdateModal(true);
  };

  // Close modals and reset state
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowUpdateModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedMedia(null);
    setMediaType(null);
  };

  // Retry fetching data
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: VIDEO_AUTOPLAY_DURATION,
    pauseOnHover: true,
  };

  // Render video section
  const renderVideoSection = () => {
    if (videoLoading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading videos...</span>
          </Spinner>
          <p className="mt-2">Loading videos...</p>
        </div>
      );
    }

    if (videoError) {
      return (
        <Alert variant="danger" className="my-3">
          <Alert.Heading>Video Loading Error</Alert.Heading>
          <p>{videoError}</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={handleRetry}>
              Retry Loading Videos
            </Button>
          </div>
        </Alert>
      );
    }

    if (videos.length === 0) {
      return (
        <Alert variant="info" className="my-3">
          <p>No videos found in the gallery.</p>
        </Alert>
      );
    }

    return (
      <Slider {...carouselSettings}>
        {videos.map(video => (
          <div key={video.id} className="position-relative">
            <video
              src={video.video}
              className="w-100"
              controls
              autoPlay
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            >
              Your browser does not support the video tag.
            </video>
            <Button
              variant="outline-primary"
              className="position-absolute top-0 end-0 m-2"
              onClick={() => handleEditClick(video, 'video')}
            >
              <i className="bi bi-pencil-square"></i>
            </Button>
            <div className="text-center mt-2">
              <h5>Video {video.id}</h5>
              <p>Uploaded: {new Date(video.uploaded_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </Slider>
    );
  };

  // Render image section
  const renderImageSection = () => {
    if (imageLoading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading images...</span>
          </Spinner>
          <p className="mt-2">Loading images...</p>
        </div>
      );
    }

    if (imageError) {
      return (
        <Alert variant="danger" className="my-3">
          <Alert.Heading>Image Loading Error</Alert.Heading>
          <p>{imageError}</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={handleRetry}>
              Retry Loading Images
            </Button>
          </div>
        </Alert>
      );
    }

    if (images.length === 0) {
      return (
        <Alert variant="info" className="my-3">
          <p>No images found in the gallery.</p>
        </Alert>
      );
    }

    return (
      <Slider {...carouselSettings}>
        {images.map(image => (
          <div key={image.id} className="position-relative">
            <img
              src={image.image}
              alt={`Gallery image ${image.id}`}
              className="w-100"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            <Button
              variant="outline-primary"
              className="position-absolute top-0 end-0 m-2"
              onClick={() => handleEditClick(image, 'image')}
            >
              <i className="bi bi-pencil-square"></i>
            </Button>
            <div className="text-center mt-2">
              <h5>Image {image.id}</h5>
              <p>Uploaded: {new Date(image.uploaded_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </Slider>
    );
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Our Media Gallery</h2>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-add">
            <i className="bi bi-plus-circle"></i> Add Media
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => { setMediaType('image'); setShowAddModal(true); }}>
              Add Image
            </Dropdown.Item>
            <Dropdown.Item onClick={() => { setMediaType('video'); setShowAddModal(true); }}>
              Add Video
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <h3 className="mb-3">Videos</h3>
      {renderVideoSection()}

      <h3 className="mb-3 mt-5">Images</h3>
      {renderImageSection()}

      {/* Add Media Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New {mediaType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload {mediaType}</Form.Label>
              <Form.Control
                type="file"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
              />
            </Form.Group>
            {previewUrl && (
              <div className="mb-3">
                {mediaType === 'image' ? (
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                ) : (
                  <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
                )}
              </div>
            )}
            <Button variant="primary" type="submit" disabled={!selectedFile}>
              Upload
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Media Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update {mediaType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateSubmit}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Current {mediaType}</Form.Label>
              {selectedMedia && (
                <div className="mb-3">
                  {mediaType === 'image' ? (
                    <img src={selectedMedia.image} alt="Current" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  ) : (
                    <video src={selectedMedia.video} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  )}
                </div>
              )}
              <Form.Label>Upload New {mediaType}</Form.Label>
              <Form.Control
                type="file"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
              />
            </Form.Group>
            {previewUrl && (
              <div className="mb-3">
                <p>Preview New {mediaType}:</p>
                {mediaType === 'image' ? (
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                ) : (
                  <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
                )}
              </div>
            )}
            <Button variant="primary" type="submit" disabled={!selectedFile}>
              Update
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {videoError && imageError && (
        <div className="text-center my-4">
          <Button variant="primary" onClick={handleRetry}>
            Retry Loading All Content
          </Button>
        </div>
      )}
    </div>
  );
};

export default Media;