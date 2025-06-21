import React, { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import API from "../api";

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = API.get("/reviews/");
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
      // Mock data for demonstration
      setReviews();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#2C4A47" }}>
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#2C4A47" }}>
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-300 text-lg">
              Error loading reviews: {error}
            </p>
            <button
              onClick={fetchReviews}
              className="mt-4 bg-white text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#2C4A47" }}>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            CLIENT REVIEWS
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            See what our clients have to say about our services and experience
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center">
            <p className="text-white/60 text-lg">No reviews available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-lg font-bold">"</span>
                </div>

                {/* User Info */}
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4 overflow-hidden">
                    {review.user?.profile_pic ? (
                      <img
                        src={review.user.profile_pic}
                        alt={review.user?.username || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {review.user?.username ? (
                            getInitials(review.user.username)
                          ) : (
                            <User size={20} />
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {review.user?.username || "Anonymous User"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {review.service?.username || "Service"} Client
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">{renderStars(review.rating)}</div>
                  <span className="text-gray-600 text-sm">
                    ({review.rating}/5)
                  </span>
                </div>

                {/* Comment */}
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{review.comment}"
                </p>

                {/* Date */}
                <div className="text-gray-500 text-sm">
                  {formatDate(review.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {reviews.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReviews;
