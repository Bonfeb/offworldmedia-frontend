import React, { useState, useEffect } from "react";
import { Star, User, Quote } from "lucide-react";
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
      const response = await API.get("/reviews/");
      setReviews(response.data);
    } catch (err) {
      setError(err.message);
      setReviews([]);
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
    if (!name) return "UU";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to format comment into multiple lines (like in the screenshot)
  const formatComment = (comment) => {
    if (!comment) return null;

    // Simple approach: split into lines of approximately 4-5 words each
    const words = comment.split(" ");
    const lines = [];

    for (let i = 0; i < words.length; i += 4) {
      lines.push(words.slice(i, i + 4).join(" "));
    }

    return lines.map((line, index) => (
      <p key={index} className="text-gray-700 leading-relaxed">
        {line}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-500 text-lg">
              Error loading reviews: {error}
            </p>
            <button
              onClick={fetchReviews}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            CLIENT REVIEWS
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See what our clients have to say about our services and experience
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 text-lg">No reviews available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 relative"
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Quote className="text-blue-600" size={20} />
                </div>

                {/* User Info */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 overflow-hidden">
                    {review.user?.profile_pic ? (
                      <img
                        src={review.user.profile_pic}
                        alt={review.user?.username || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {review.user?.username ? (
                            getInitials(review.user.username)
                          ) : (
                            <User size={16} />
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.user?.username || "Anonymous User"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {review.service?.username || "Service"} Client
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">{renderStars(review.rating)}</div>
                  <span className="text-gray-500 text-sm">
                    ({review.rating}/5)
                  </span>
                </div>

                {/* Comment - Now using actual data from the model */}
                <div className="mb-6">
                  {review.comment ? (
                    formatComment(review.comment)
                  ) : (
                    <p className="text-gray-500 italic">No comment provided</p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-4"></div>

                {/* Date */}
                <div className="text-gray-500 text-sm text-right">
                  {formatDate(review.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {reviews.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReviews;
