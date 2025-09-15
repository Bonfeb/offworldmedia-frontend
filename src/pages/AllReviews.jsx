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
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
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
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
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
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            CLIENT REVIEWS
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            See what our clients have to say about our services and experience
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 text-lg">No reviews available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm mx-auto lg:max-w-none"
              >
                {/* User Avatar - Centered at top */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-gray-600">
                    {review.user?.profile_pic ? (
                      <img
                        src={review.user.profile_pic}
                        alt={review.user?.username || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {review.user?.username ? (
                            getInitials(review.user.username)
                          ) : (
                            <User size={20} />
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div className="text-center mb-6">
                  {review.comment ? (
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      No comment provided
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* User Name */}
                <div className="text-center">
                  <p className="text-white font-medium text-sm">
                    - {review.user?.username || "Anonymous User"} -
                  </p>
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
