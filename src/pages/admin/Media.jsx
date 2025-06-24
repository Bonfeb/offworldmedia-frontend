import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Alert,
  Spinner,
  Modal,
  Button,
  Dropdown,
  Form,
  Row,
  Col,
  Image as BootstrapImage,
} from "react-bootstrap";
import Slider from "react-slick";
import {
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import API from "../../api";

// Constants
const MAX_RESULTS = 10;
const VIDEO_AUTOPLAY_DURATION = 180000; // 3 minutes in milliseconds
const THUMBNAIL_SIZE = 80; // Thumbnail size in pixels

const Media = () => {
  // State for videos, images, loading states, errors, and modals
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Carousel sync states
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

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

  // Selected media for updating/viewing
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Button loading states
  const [addImageLoading, setAddImageLoading] = useState(false);
  const [addVideoLoading, setAddVideoLoading] = useState(false);
  const [updateImageLoading, setUpdateImageLoading] = useState(false);
  const [updateVideoLoading, setUpdateVideoLoading] = useState(false);

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Initialize carousels
  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  // Main carousel settings
  const mainCarouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    asNavFor: nav2,
    ref: slider1,
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  // Thumbnail carousel settings
  const thumbnailSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(5, videos.length || images.length),
    slidesToScroll: 1,
    focusOnSelect: true,
    centerMode: true,
    centerPadding: "0px",
    asNavFor: nav1,
    ref: slider2,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(4, videos.length || images.length),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(3, videos.length || images.length),
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: Math.min(2, videos.length || images.length),
        },
      },
    ],
  };

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
    } catch (error) {
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
    } finally {
      setVideoLoading(false);
    }
  };

  // Fetch Images
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
    } catch (error) {
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
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
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
      await API.post("/images/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchImages(); // Refresh images after upload
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
      await API.post("/videos/", formData);
      await fetchVideos(); // Refresh videos after upload
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
      await API.put(`/image/${selectedImage.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchImages(); // Refresh images after update
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
      await API.put(`/video/${selectedVideo.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchVideos(); // Refresh videos after update
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

  // Open fullscreen image viewer
  const handleImageFullscreen = (image) => {
    setFullscreenImage(image);
  };

  // Open fullscreen video viewer
  const handleVideoFullscreen = (video) => {
    setFullscreenVideo(video);
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

  // Close fullscreen viewers
  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
    setFullscreenVideo(null);
    setIsFullscreen(false);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Retry fetching data
  const handleRetry = () => {
    setRetryCount((prevCount) => prevCount + 1);
  };

  // Render video section with synced carousels
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
      <>
        {/* Main Videos Carousel */}
        <Slider {...mainCarouselSettings}>
          {videos.map((video) => (
            <div key={video.id} className="video-slide-container">
              <div className="position-relative">
                <video
                  src={video.video}
                  className="w-100"
                  controls
                  style={{
                    maxHeight: "400px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="position-absolute top-0 end-0 p-2">
                  <IconButton
                    onClick={() => handleEditVideoClick(video)}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      marginRight: 1,
                    }}
                  >
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleVideoFullscreen(video)}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <FullscreenIcon fontSize="small" color="primary" />
                  </IconButton>
                </div>
              </div>
              <div className="text-center mt-3 p-3 bg-light rounded">
                <p className="mb-0 text-muted">
                  Uploaded: {new Date(video.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </>
    );
  };

  // Render image section with synced carousels
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
      <>
        {/* Main Images Carousel */}
        <Slider {...mainCarouselSettings}>
          {images.map((image) => (
            <div key={image.id} className="image-slide-container">
              <div className="position-relative">
                <BootstrapImage
                  src={image.image}
                  alt={`Gallery image ${image.id}`}
                  fluid
                  rounded
                  style={{
                    maxHeight: "400px",
                    width: "100%",
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                  onClick={() => handleImageFullscreen(image)}
                />
                <div className="position-absolute top-0 end-0 p-2">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditImageClick(image);
                    }}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                </div>
              </div>
              <div className="text-center mt-3 p-3 bg-light rounded">
                <p className="mb-0 text-muted">
                  Uploaded: {new Date(image.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </>
    );
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        {/* Left: Dropdown */}
        <div className="mb-2 mb-md-0">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-add">
              <i className="bi bi-plus-circle me-1"></i> Add Media
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

        {/* Center: Heading */}
        <div className="flex-grow-1 text-center">
          <h2 className="mb-0">Media Gallery Management</h2>
        </div>

        {/* Right: empty placeholder for spacing (optional) */}
        <div className="invisible" style={{ width: "170px" }}></div>
      </div>

      <Row className="justify-content-center">
        <Col
          xs={12}
          md={12}
          lg={6}
          xl={6}
          className="mb-5 d-flex flex-column align-items-center text-center"
        >
          <h3 className="mb-3 text-center">Videos</h3>
          <div className="video-carousel-container">{renderVideoSection()}</div>
        </Col>
        <Col
          xs={12}
          md={12}
          lg={6}
          xl={6}
          className="mb-5 d-flex flex-column align-items-center text-center"
        >
          <h3 className="mb-3 text-center">Images</h3>
          <div className="image-carousel-container">{renderImageSection()}</div>
        </Col>
      </Row>

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
      <Modal show={showAddImageModal} onHide={handleCloseAllModals} centered>
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
              <div className="mb-3 text-center">
                <BootstrapImage
                  src={imagePreviewUrl}
                  alt="Preview"
                  fluid
                  style={{ maxHeight: "300px" }}
                />
              </div>
            )}
            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={!selectedImageFile || addImageLoading}
                size="lg"
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
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Video Modal */}
      <Modal show={showAddVideoModal} onHide={handleCloseAllModals} centered>
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
                  style={{ width: "100%", maxHeight: "300px" }}
                />
              </div>
            )}
            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={!selectedVideoFile || addVideoLoading}
                size="lg"
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
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Image Modal */}
      <Modal show={showUpdateImageModal} onHide={handleCloseAllModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateImageSubmit}>
            <Form.Group controlId="formUpdateImageFile" className="mb-3">
              {selectedImage && (
                <div className="mb-3 text-center">
                  <BootstrapImage
                    src={selectedImage.image}
                    alt="Current"
                    fluid
                    style={{ maxHeight: "300px" }}
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
              <div className="mb-3 text-center">
                <p>Preview New Image:</p>
                <BootstrapImage
                  src={imagePreviewUrl}
                  alt="Preview"
                  fluid
                  style={{ maxHeight: "300px" }}
                />
              </div>
            )}
            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={!selectedImageFile || updateImageLoading}
                size="lg"
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
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Video Modal */}
      <Modal show={showUpdateVideoModal} onHide={handleCloseAllModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateVideoSubmit}>
            <Form.Group controlId="formUpdateVideoFile" className="mb-3">
              {selectedVideo && (
                <div className="mb-3">
                  <video
                    src={selectedVideo.video}
                    controls
                    style={{ width: "100%", maxHeight: "300px" }}
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
                  style={{ width: "100%", maxHeight: "300px" }}
                />
              </div>
            )}
            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={!selectedVideoFile || updateVideoLoading}
                size="lg"
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
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Fullscreen Image Viewer */}
      <Dialog
        open={!!fullscreenImage}
        onClose={handleCloseFullscreen}
        maxWidth="lg"
        fullScreen={isFullscreen}
        fullWidth
      >
        <DialogContent>
          {fullscreenImage && (
            <div className="text-center">
              <BootstrapImage
                src={fullscreenImage.image}
                alt="Fullscreen view"
                fluid
                style={{
                  maxHeight: "80vh",
                  width: "auto",
                  maxWidth: "100%",
                }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <IconButton onClick={toggleFullscreen} color="primary" sx={{ mr: 2 }}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <IconButton onClick={handleCloseFullscreen} color="primary">
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Video Viewer */}
      <Dialog
        open={!!fullscreenVideo}
        onClose={handleCloseFullscreen}
        maxWidth="lg"
        fullScreen={isFullscreen}
        fullWidth
      >
        <DialogContent>
          {fullscreenVideo && (
            <div className="text-center">
              <video
                src={fullscreenVideo.video}
                controls
                autoPlay
                style={{
                  maxHeight: "80vh",
                  width: "100%",
                }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <IconButton onClick={toggleFullscreen} color="primary" sx={{ mr: 2 }}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <IconButton onClick={handleCloseFullscreen} color="primary">
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

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
