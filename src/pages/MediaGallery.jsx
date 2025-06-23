import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Alert, Spinner, Row, Col } from "react-bootstrap";
import {
  Alert,
  Spinner,
  Button,
  IconButton,
  Row,
  Col,
  Image as BootstrapImage,
} from "react-bootstrap";
import { Alert, IconButton, Button, Dialog,
  DialogContent,
  DialogActions, } from "@mui/material";
import {
  Edit as EditIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import API from "../api";

// Constants
const MAX_RESULTS = 10;
const THUMBNAIL_SIZE = 80;

const MediaGallery = () => {
  // State declarations
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

  // Carousel settings for different screen sizes
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
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

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

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

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
          const status = error.response.status;
          setVideoError(
            `Server error (${status}): ${
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
          const status = error.response.status;
          setImageError(
            `Server error (${status}): ${
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
      }
    };

    fetchImages();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((prevCount) => prevCount + 1);
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
      <Row>
        <Col lg={6} xl={6} className="mb-5">
          <h2 className="mb-4">Video Gallery</h2>
          {renderVideoSection()}
        </Col>
        <Col lg={6} xl={6} className="mb-5">
          <h2 className="mb-4">Photo Gallery</h2>
          {renderImageSection()}
        </Col>
      </Row>

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
          <button className="btn btn-primary btn-lg" onClick={handleRetry}>
            Retry Loading All Content
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
