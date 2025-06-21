import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';
import API from '../api';

// Constants
const MAX_RESULTS = 10;

const MediaGallery = () => {
  // State for videos, images, loading states and errors
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  
  // Fetch Videos from /videos/ endpoint
  useEffect(() => {
    const fetchVideos = async () => {
      setVideoLoading(true);
      setVideoError(null);
      
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await API.get('/videos/', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Validate response data
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format from videos API');
        }
        
        setVideos(response.data);
        setVideoLoading(false);
      } catch (error) {
        setVideoLoading(false);
        
        // Handle specific error types
        if (axios.isCancel(error)) {
          setVideoError('Request timed out. Please try again.');
        } else if (error.response) {
          // Server responded with an error status code
          const status = error.response.status;
          setVideoError(`Server error (${status}): ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          // Request made but no response received
          setVideoError('Network error. Please check your connection and try again.');
        } else {
          // Other errors
          setVideoError(`Error fetching videos: ${error.message}`);
        }
        
        console.error('Detailed videos API error:', error);
      }
    };
    
    fetchVideos();
  }, [retryCount]); // Add retryCount to dependencies for retry functionality
  
  // Fetch Images from /images/ endpoint
  useEffect(() => {
    const fetchImages = async () => {
      setImageLoading(true);
      setImageError(null);
      
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await API.get('/images/', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Validate response data
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format from images API');
        }
        
        setImages(response.data);
        setImageLoading(false);
      } catch (error) {
        setImageLoading(false);
        
        // Handle specific error types
        if (axios.isCancel(error)) {
          setImageError('Request timed out. Please try again.');
        } else if (error.response) {
          // Server responded with an error status code
          const status = error.response.status;
          setImageError(`Server error (${status}): ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          // Request made but no response received
          setImageError('Network error. Please check your connection and try again.');
        } else {
          // Other errors
          setImageError(`Error fetching images: ${error.message}`);
        }
        
        console.error('Detailed images API error:', error);
      }
    };
    
    fetchImages();
    
    // Clean up function
    return () => {
      // Cancel any pending requests if component unmounts
    };
  }, [retryCount]); // Add retryCount to dependencies for retry functionality
  
  // Function to retry fetching data
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };
  
  // Render loading, error states or content
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
            <button 
              className="btn btn-outline-danger" 
              onClick={handleRetry}
            >
              Retry Loading Videos
            </button>
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
    
    // Render video content here
    return (
      <div className="row">
        {videos.map(video => (
          <div key={video.id} className="col-md-4 mb-4">
            {/* Video card content */}
            <div className="card h-100">
              <video 
                src={video.video} 
                className="card-img-top"
                controls
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              >
                Your browser does not support the video tag.
              </video>
              <div className="card-body">
                <h5 className="card-title">Video {video.id}</h5>
                <p className="card-text">
                  Uploaded: {new Date(video.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
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
            <button 
              className="btn btn-outline-danger" 
              onClick={handleRetry}
            >
              Retry Loading Images
            </button>
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
    
    // Render image content here
    return (
      <div className="row">
        {images.map(image => (
          <div key={image.id} className="col-md-4 mb-4">
            {/* Image card content */}
            <div className="card h-100">
              <img 
                src={image.image} 
                alt={`Gallery image ${image.id}`}
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">Image {image.id}</h5>
                <p className="card-text">
                  Uploaded: {new Date(image.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container my-5">
      <h2 className="mb-4">Our Video Gallery</h2>
      {renderVideoSection()}
      
      <h2 className="mb-4 mt-5">Our Photo Gallery</h2>
      {renderImageSection()}
      
      {/* Show overall retry button if both have errors */}
      {videoError && imageError && (
        <div className="text-center my-4">
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleRetry}
          >
            Retry Loading All Content
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;