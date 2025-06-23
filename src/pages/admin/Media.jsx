import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Slider from "react-slick";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Fullscreen as FullscreenIcon, AddCircleOutline as AddIcon } from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import API from "../../api";

// Constants
const MAX_RESULTS = 10;
const VIDEO_AUTOPLAY_DURATION = 180000; // 3 minutes in milliseconds

const Media = () => {
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showUpdateImageModal, setShowUpdateImageModal] = useState(false);
  const [showUpdateVideoModal, setShowUpdateVideoModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [addImageLoading, setAddImageLoading] = useState(false);
  const [addVideoLoading, setAddVideoLoading] = useState(false);
  const [updateImageLoading, setUpdateImageLoading] = useState(false);
  const [updateVideoLoading, setUpdateVideoLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);

  const videoRefs = useRef({});

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setVideoLoading(true);
      setVideoError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await API.get("/videos/", { signal: controller.signal });
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
          setVideoError(`Server error (${error.response.status}): ${error.response.data?.message || "Unknown error"}`);
        } else if (error.request) {
          setVideoError("Network error. Please check your connection and try again.");
        } else {
          setVideoError(`Error fetching videos: ${error.message}`);
        }
        console.error("Detailed videos API error:", error);
      }
    };
    fetchVideos();
  }, [retryCount]);

  useEffect(() => {
    const fetchImages = async () => {
      setImageLoading(true);
      setImageError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await API.get("/images/", { signal: controller.signal });
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
          setImageError(`Server error (${error.response.status}): ${error.response.data?.message || "Unknown error"}`);
        } else if (error.request) {
          setImageError("Network error. Please check your connection and try again.");
        } else {
          setImageError(`Error fetching images: ${error.message}`);
        }
        console.error("Detailed images API error:", error);
      }
    };
    fetchImages();
  }, [retryCount]);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

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
      setRetryCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error uploading image:", error);
      showSnackbar("Failed to upload image. Please try again.", "error");
    } finally {
      setAddImageLoading(false);
    }
  };

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
      setRetryCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error uploading video:", error);
      showSnackbar("Failed to upload video. Please try again.", "error");
    } finally {
      setAddVideoLoading(false);
    }
  };

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
      setImages(images.map((item) => (item.id === selectedImage.id ? response.data : item)));
      setShowUpdateImageModal(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setSelectedImage(null);
      showSnackbar("Image updated successfully!", "success");
      setRetryCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating image:", error);
      showSnackbar("Failed to update image. Please try again.", "error");
    } finally {
      setUpdateImageLoading(false);
    }
  };

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
      setVideos(videos.map((item) => (item.id === selectedVideo.id ? response.data : item)));
      setShowUpdateVideoModal(false);
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      setSelectedVideo(null);
      showSnackbar("Video updated successfully!", "success");
      setRetryCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating video:", error);
      showSnackbar("Failed to upload video. Please try again.", "error");
    } finally {
      setUpdateVideoLoading(false);
    }
  };

  const handleEditImageClick = (image) => {
    setSelectedImage(image);
    setShowUpdateImageModal(true);
  };

  const handleEditVideoClick = (video) => {
    setSelectedVideo(video);
    setShowUpdateVideoModal(true);
  };

  const handleViewFullImage = (image) => {
    setFullImageUrl(image.image);
    setZoomLevel(1);
    setShowFullImageModal(true);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleFullscreenVideo = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleCloseAllModals = () => {
    setShowAddImageModal(false);
    setShowAddVideoModal(false);
    setShowUpdateImageModal(false);
    setShowUpdateVideoModal(false);
    setShowFullImageModal(false);
    setSelectedImageFile(null);
    setSelectedVideoFile(null);
    setImagePreviewUrl(null);
    setVideoPreviewUrl(null);
    setSelectedImage(null);
    setSelectedVideo(null);
    setFullImageUrl(null);
    setZoomLevel(1);
  };

  const handleRetry = () => {
    setRetryCount((prevCount) => prevCount + 1);
  };

  const handleAddMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAnchorEl(null);
  };

  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    pauseOnHover: true,
    adaptiveHeight: true,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  const thumbnailSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    focusOnSelect: true,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 576, settings: { slidesToShow: 2 } },
    ],
  };

  const renderVideoSection = () => {
    if (videoLoading) {
      return (
        <Box sx={{ textAlign: "center", my: 5 }}>
          <CircularProgress color="primary" />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading videos...
          </Typography>
        </Box>
      );
    }

    if (videoError) {
      return (
        <Alert severity="error" sx={{ my: 3 }}>
          <Typography variant="h6">Video Loading Error</Typography>
          <Typography>{videoError}</Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" color="error" onClick={handleRetry}>
              Retry Loading Videos
            </Button>
          </Box>
        </Alert>
      );
    }

    if (videos.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 3 }}>
          <Typography>No videos found in the gallery.</Typography>
        </Alert>
      );
    }

    return (
      <Box className="carousel-container" sx={{ position: "relative" }}>
        <Slider {...carouselSettings}>
          {videos.map((video) => (
            <Box key={video.id} sx={{ position: "relative" }}>
              <Box className="video-slide-container" sx={{ position: "relative" }}>
                <video
                  ref={(el) => (videoRefs.current[video.id] = el)}
                  src={video.video}
                  className="w-100 rounded"
                  controls
                  style={{ maxHeight: "500px", objectFit: "contain", width: "100%" }}
                >
                  Your browser does not support the video tag.
                </video>
                <IconButton
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "50px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                  }}
                  onClick={() => handleFullscreenVideo(video.id)}
                  size="large"
                >
                  <FullscreenIcon color="primary" />
                </IconButton>
                <IconButton
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                  }}
                  onClick={() => handleEditVideoClick(video)}
                  size="large"
                >
                  <EditIcon color="primary" />
                </IconButton>
                <Box sx={{ textAlign: "center", mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Typography variant="h6">Video {video.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {new Date(video.uploaded_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>
    );
  };

  const renderImageSection = () => {
    if (imageLoading) {
      return (
        <Box sx={{ textAlign: "center", my: 5 }}>
          <CircularProgress color="primary" />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading images...
          </Typography>
        </Box>
      );
    }

    if (imageError) {
      return (
        <Alert severity="error" sx={{ my: 3 }}>
          <Typography variant="h6">Image Loading Error</Typography>
          <Typography>{imageError}</Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" color="error" onClick={handleRetry}>
              Retry Loading Images
            </Button>
          </Box>
        </Alert>
      );
    }

    if (images.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 3 }}>
          <Typography>No images found in the gallery.</Typography>
        </Alert>
      );
    }

    return (
      <Box className="carousel-container" sx={{ position: "relative" }}>
        <Slider {...carouselSettings} className="main-carousel">
          {images.map((image) => (
            <Box key={image.id} sx={{ position: "relative" }}>
              <Box className="image-slide-container" sx={{ position: "relative" }}>
                <img
                  src={image.image}
                  alt={`Gallery image ${image.id}`}
                  style={{ maxHeight: "500px", objectFit: "contain", width: "100%", borderRadius: 8, cursor: "pointer" }}
                  onClick={() => handleViewFullImage(image)}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                  }}
                  onClick={() => handleEditImageClick(image)}
                  size="large"
                >
                  <EditIcon color="primary" />
                </IconButton>
                <Box sx={{ textAlign: "center", mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Typography variant="h6">Image {image.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {new Date(image.uploaded_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
        <Box className="thumbnail-carousel" sx={{ mt: 2 }}>
          <Slider {...thumbnailSettings}>
            {images.map((image) => (
              <Box key={image.id} sx={{ px: 0.5 }}>
                <img
                  src={image.image}
                  alt={`Thumbnail ${image.id}`}
                  style={{ height: "60px", objectFit: "cover", width: "100%", borderRadius: 4, cursor: "pointer" }}
                  onClick={() => handleViewFullImage(image)}
                />
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: "100%", px: { xs: 2, md: 3 }, py: 5 }}>
      <style jsx>{`
        .carousel-container {
          max-width: 100%;
          margin: 0 auto;
        }
        .main-carousel :focus,
        .thumbnail-carousel :focus {
          outline: none;
        }
        .thumbnail-carousel .slick-slide {
          padding: 0 5px;
        }
        .full-image-container {
          overflow: auto;
          max-height: 80vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        @media (max-width: 576px) {
          .carousel-container {
            padding: 0;
          }
          .video-slide-container video,
          .image-slide-container img {
            max-height: 300px !important;
          }
        }
      `}</style>

      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" sx={{ mb: { xs: 2, md: 0 } }}>
          Our Media Gallery
        </Typography>
        <div>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleAddMenuClick}
            aria-controls={anchorEl ? "add-media-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? "true" : undefined}
          >
            Add Media
          </Button>
          <Menu
            id="add-media-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleAddMenuClose}
            MenuListProps={{ "aria-labelledby": "add-media-button" }}
          >
            <MenuItem onClick={() => { setShowAddImageModal(true); handleAddMenuClose(); }}>Add Image</MenuItem>
            <MenuItem onClick={() => { setShowAddVideoModal(true); handleAddMenuClose(); }}>Add Video</MenuItem>
          </Menu>
        </div>
      </Stack>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Videos
      </Typography>
      {renderVideoSection()}

      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        Images
      </Typography>
      {renderImageSection()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={showAddImageModal} onClose={handleCloseAllModals} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Image</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddImageSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Upload Image</FormLabel>
              <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ marginTop: 8 }} />
            </FormControl>
            {imagePreviewUrl && (
              <Box sx={{ mb: 3 }}>
                <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 4 }} />
              </Box>
            )}
            <Button
              variant="contained"
              type="submit"
              disabled={!selectedImageFile || addImageLoading}
              sx={{ mt: 2 }}
            >
              {addImageLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                "Upload Image"
              )}
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAllModals} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showAddVideoModal} onClose={handleCloseAllModals} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Video</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddVideoSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Upload Video</FormLabel>
              <input type="file" accept="video/*" onChange={handleVideoFileChange} style={{ marginTop: 8 }} />
            </FormControl>
            {videoPreviewUrl && (
              <Box sx={{ mb: 3 }}>
                <video src={videoPreviewUrl} controls style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 4 }} />
              </Box>
            )}
            <Button
              variant="contained"
              type="submit"
              disabled={!selectedVideoFile || addVideoLoading}
              sx={{ mt: 2 }}
            >
              {addVideoLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                "Upload Video"
              )}
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAllModals} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUpdateImageModal} onClose={handleCloseAllModals} maxWidth="sm" fullWidth>
        <DialogTitle>Update Image</DialogTitle>
        <DialogContent>
          <form onSubmit={handleUpdateImageSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Current Image</FormLabel>
              {selectedImage && (
                <Box sx={{ mb: 3, mt: 1 }}>
                  <img src={selectedImage.image} alt="Current" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 4 }} />
                </Box>
              )}
              <FormLabel>Upload New Image</FormLabel>
              <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ marginTop: 8 }} />
            </FormControl>
            {imagePreviewUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Preview New Image:
                </Typography>
                <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 4 }} />
              </Box>
            )}
            <Button
              variant="contained"
              type="submit"
              disabled={!selectedImageFile || updateImageLoading}
              sx={{ mt: 2 }}
            >
              {updateImageLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Updating...
                </>
              ) : (
                "Update Image"
              )}
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAllModals} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUpdateVideoModal} onClose={handleCloseAllModals} maxWidth="sm" fullWidth>
        <DialogTitle>Update Video</DialogTitle>
        <DialogContent>
          <form onSubmit={handleUpdateVideoSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Current Video</FormLabel>
              {selectedVideo && (
                <Box sx={{ mb: 3, mt: 1 }}>
                  <video src={selectedVideo.video} controls style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 4 }} />
                </Box>
              )}
              <FormLabel>Upload New Video</FormLabel>
              <input type="file" accept="video/*" onChange={handleVideoFileChange} style={{ marginTop: 8 }} />
            </FormControl>
            {videoPreviewUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Preview New Video:
                </Typography>
                <video src={videoPreviewUrl} controls style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 4 }} />
              </Box>
            )}
            <Button
              variant="contained"
              type="submit"
              disabled={!selectedVideoFile || updateVideoLoading}
              sx={{ mt: 2 }}
            >
              {updateVideoLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Updating...
                </>
              ) : (
                "Update Video"
              )}
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAllModals} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showFullImageModal} onClose={handleCloseAllModals} maxWidth="lg" fullWidth>
        <DialogTitle>View Image</DialogTitle>
        <DialogContent>
          <Box className="full-image-container">
            {fullImageUrl && (
              <img
                src={fullImageUrl}
                alt="Full view"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.2s",
                  maxWidth: "100%",
                  borderRadius: 4,
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleZoomOut}>
            Zoom Out
          </Button>
          <Button variant="outlined" onClick={handleZoomIn}>
            Zoom In
          </Button>
          <Button variant="contained" onClick={handleCloseAllModals}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {videoError && imageError && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Button variant="contained" onClick={handleRetry}>
            Retry Loading All Content
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Media;