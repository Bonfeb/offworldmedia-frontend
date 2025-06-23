import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Spinner, Row, Col } from 'react-bootstrap';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import API from '../api';

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

  // Carousel settings for different screen sizes
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 992, // lg and below
        settings: {
          slidesToShow: 1,
        }
      },
      {
        breakpoint: 1200, // xl and above
        settings: {
          slidesToShow: 3,
        }
      }
    ]
  };

  // Fetch Videos
  useEffect(() => {
    const fetchVideos = async () => {
      setVideoLoading(true);
      setVideoError(null);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await API.get('/videos/', {
          signal: controller.signal
        });
        
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
          const status = error.response.status;
          setVideoError(`Server error (${status}): ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          setVideoError('Network error. Please check your connection and try again.');
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
        
        const response = await API.get('/images/', {
          signal: controller.signal
        });
        
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
          const status = error.response.status;
          setImageError(`Server error (${status}): ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          setImageError('Network error. Please check your connection and try again.');
        } else {
          setImageError(`Error fetching images: ${error.message}`);
        }
      }
    };
    
    fetchImages();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  // Render video carousel
  const renderVideoCarousel = () => {
    return (
      <Slider {...carouselSettings}>
        {videos.map(video => (
          <div key={video.id} className="px-2">
            <div className="card h-100">
              <video 
                src={video.video} 
                className="card-img-top"
                controls
                style={{ height: '200px', objectFit: 'cover' }}
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
      </Slider>
    );
  };

  // Render image carousel
  const renderImageCarousel = () => {
    return (
      <Slider {...carouselSettings}>
        {images.map(image => (
          <div key={image.id} className="px-2">
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
      </Slider>
    );
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
    
    return (
      <Row>
        <Col xs={12}>
          {renderVideoCarousel()}
        </Col>
      </Row>
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
    
    return (
      <Row>
        <Col xs={12}>
          {renderImageCarousel()}
        </Col>
      </Row>
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