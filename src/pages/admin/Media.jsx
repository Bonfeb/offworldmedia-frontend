import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert, Spinner, Modal, Button, Dropdown, Form } from "react-bootstrap";
import Slider from "react-slick";
import { Snackbar, Alert as MuiAlert, IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import API from "../../api";

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

  // Modal states
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showUpdateImageModal, setShowUpdateImageModal] = useState(false);
  const [showUpdateVideoModal, setShowUpdateVideoModal] = useState(false);

  // File and preview states
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  // Selected media for updating
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Button loading states
  const [addImageLoading, setAddImageLoading] = useState(false);
  const [addVideoLoading, setAddVideoLoading] = useState(false);
  const [updateImageLoading, setUpdateImageLoading] = useState(false);
  const [updateVideoLoading, setUpdateVideoLoading] = useState(false);

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
  });

  // Show snackbar helper function
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch Videos
  useEffect(() => {
    const fetchVideos = async () => {
      setVideoLoading(true);
      setVideoError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await API.get("/videos/", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format from videos API");
        }
        setVideos(response.data);
        setVideoLoading(false);
      } catch (error) {
        setVideoLoading(false);
        if (axios.isCancel(error)) {
          setVideoError("Request timed out. Please try again.");
        } else if (error.response) {
          setVideoError(
            `Server error (${error.response.status}): ${
              error.response.data?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          setVideoError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setVideoError(`Error fetching videos: ${error.message}`);
        }
        console.error("Detailed videos API error:", error);
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
        const response = await API.get("/images/", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format from images API");
        }
        setImages(response.data);
        setImageLoading(false);
      } catch (error) {
        setImageLoading(false);
        if (axios.isCancel(error)) {
          setImageError("Request timed out. Please try again.");
        } else if (error.response) {
          setImageError(
            `Server error (${error.response.status}): ${
              error.response.data?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          setImageError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setImageError(`Error fetching images: ${error.message}`);
        }
        console.error("Detailed images API error:", error);
      }
    };
    fetchImages();
  }, [retryCount]);

  // Handle image file selection and preview
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  // Handle video file selection and preview
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  // Handle add image submission
  const handleAddImageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImageFile) return;

    setAddImageLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImageFile);

    try {
      const response = await API.post("/images/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages([...images, response.data]);
      setShowAddImageModal(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      showSnackbar("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showSnackbar("Failed to upload image. Please try again.", "error");
    } finally {
      setAddImageLoading(false);
    }
  };

  // Handle add video submission
  const handleAddVideoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVideoFile) return;

    setAddVideoLoading(true);
    const formData = new FormData();
    formData.append("video", selectedVideoFile);

    try {
      const response = await API.post("/videos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideos([...videos, response.data]);
      setShowAddVideoModal(false);
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      showSnackbar("Video uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading video:", error);
      showSnackbar("Failed to upload video. Please try again.", "error");
    } finally {
      setAddVideoLoading(false);
    }
  };

  // Handle update image submission
  const handleUpdateImageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImageFile || !selectedImage) return;

    setUpdateImageLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImageFile);

    try {
      const response = await API.put(`/image/${selectedImage.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages(
        images.map((item) =>
          item.id === selectedImage.id ? response.data : item
        )
      );
      setShowUpdateImageModal(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setSelectedImage(null);
      showSnackbar("Image updated successfully!", "success");
    } catch (error) {
      console.error("Error updating image:", error);
      showSnackbar("Failed to update image. Please try again.", "error");
    } finally {
      setUpdateImageLoading(false);
    }
  };

  // Handle update video submission
  const handleUpdateVideoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVideoFile || !selectedVideo) return;

    setUpdateVideoLoading(true);
    const formData = new FormData();
    formData.append("video", selectedVideoFile);

    try {
      const response = await API.put(`/video/${selectedVideo.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideos(
        videos.map((item) =>
          item.id === selectedVideo.id ? response.data : item
        )
      );
      setShowUpdateVideoModal(false);
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      setSelectedVideo(null);
      showSnackbar("Video updated successfully!", "success");
    } catch (error) {
      console.error("Error updating video:", error);
      showSnackbar("Failed to update video. Please try again.", "error");
    } finally {
      setUpdateVideoLoading(false);
    }
  };

  // Open update image modal
  const handleEditImageClick = (image) => {
    setSelectedImage(image);
    setShowUpdateImageModal(true);
  };

  // Open update video modal
  const handleEditVideoClick = (video) => {
    setSelectedVideo(video);
    setShowUpdateVideoModal(true);
  };

  // Close all modals and reset state
  const handleCloseAllModals = () => {
    setShowAddImageModal(false);
    setShowAddVideoModal(false);
    setShowUpdateImageModal(false);
    setShowUpdateVideoModal(false);
    setSelectedImageFile(null);
    setSelectedVideoFile(null);
    setImagePreviewUrl(null);
    setVideoPreviewUrl(null);
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  // Retry fetching data
  const handleRetry = () => {
    setRetryCount((prevCount) => prevCount + 1);
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
    adaptiveHeight: true,
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
      <div className="carousel-container position-relative">
        <Slider {...carouselSettings}>
          {videos.map((video) => (
            <div key={video.id} className="position-relative">
              <div className="video-slide-container position-relative">
                <video
                  src={video.video}
                  className="w-100"
                  controls
                  autoPlay
                  style={{ 
                    maxHeight: "500px", 
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                <IconButton
                  className="position-absolute"
                  style={{
                    top: "10px",
                    right: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={() => handleEditVideoClick(video)}
                  size="large"
                >
                  <EditIcon fontSize="medium" color="primary" />
                </IconButton>
                <div className="text-center mt-3 p-3 bg-light rounded">
                  <h5 className="mb-2">Video {video.id}</h5>
                  <p className="mb-0 text-muted">
                    Uploaded: {new Date(video.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
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
      <div className="carousel-container position-relative">
        <Slider {...carouselSettings}>
          {images.map((image) => (
            <div key={image.id} className="position-relative">
              <div className="image-slide-container position-relative">
                <img
                  src={image.image}
                  alt={`Gallery image ${image.id}`}
                  className="w-100"
                  style={{ 
                    maxHeight: "500px", 
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
                <IconButton
                  className="position-absolute"
                  style={{
                    top: "10px",
                    right: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={() => handleEditImageClick(image)}
                  size="large"
                >
                  <EditIcon fontSize="medium" color="primary" />
                </IconButton>
                <div className="text-center mt-3 p-3 bg-light rounded">
                  <h5 className="mb-2">Image {image.id}</h5>
                  <p className="mb-0 text-muted">
                    Uploaded: {new Date(image.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
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
            <Dropdown.Item onClick={() => setShowAddImageModal(true)}>
              Add Image
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setShowAddVideoModal(true)}>
              Add Video
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <h3 className="mb-3">Videos</h3>
      {renderVideoSection()}

      <h3 className="mb-3 mt-5">Images</h3>
      {renderImageSection()}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* Add Image Modal */}
      <Modal show={showAddImageModal} onHide={handleCloseAllModals}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddImageSubmit}>
            <Form.Group controlId="formImageFile" className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            </Form.Group>
            {imagePreviewUrl && (
              <div className="mb-3">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedImageFile || addImageLoading}
            >
              {addImageLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                "Upload Image"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Video Modal */}
      <Modal show={showAddVideoModal} onHide={handleCloseAllModals}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddVideoSubmit}>
            <Form.Group controlId="formVideoFile" className="mb-3">
              <Form.Label>Upload Video</Form.Label>
              <Form.Control
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
              />
            </Form.Group>
            {videoPreviewUrl && (
              <div className="mb-3">
                <video
                  src={videoPreviewUrl}
                  controls
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedVideoFile || addVideoLoading}
            >
              {addVideoLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                "Upload Video"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Image Modal */}
      <Modal show={showUpdateImageModal} onHide={handleCloseAllModals}>
        <Modal.Header closeButton>
          <Modal.Title>Update Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateImageSubmit}>
            <Form.Group controlId="formUpdateImageFile" className="mb-3">
              <Form.Label>Current Image</Form.Label>
              {selectedImage && (
                <div className="mb-3">
                  <img
                    src={selectedImage.image}
                    alt="Current"
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                </div>
              )}
              <Form.Label>Upload New Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            </Form.Group>
            {imagePreviewUrl && (
              <div className="mb-3">
                <p>Preview New Image:</p>
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedImageFile || updateImageLoading}
            >
              {updateImageLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                "Update Image"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Video Modal */}
      <Modal show={showUpdateVideoModal} onHide={handleCloseAllModals}>
        <Modal.Header closeButton>
          <Modal.Title>Update Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateVideoSubmit}>
            <Form.Group controlId="formUpdateVideoFile" className="mb-3">
              <Form.Label>Current Video</Form.Label>
              {selectedVideo && (
                <div className="mb-3">
                  <video
                    src={selectedVideo.video}
                    controls
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                </div>
              )}
              <Form.Label>Upload New Video</Form.Label>
              <Form.Control
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
              />
            </Form.Group>
            {videoPreviewUrl && (
              <div className="mb-3">
                <p>Preview New Video:</p>
                <video
                  src={videoPreviewUrl}
                  controls
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedVideoFile || updateVideoLoading}
            >
              {updateVideoLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                "Update Video"
              )}
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