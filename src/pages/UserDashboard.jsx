import React, { useState, useEffect } from "react";
import {
  Tab,
  Nav,
  Card,
  Button,
  Row,
  Col,
  Container,
  ListGroup,
  Table,
  Alert,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailjs from "@emailjs/browser";
import API from "../api";
import axios from "axios";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState({
    unpaid: [],
    paid: [],
    completed: [],
    cancelled: [],
  });
  const [cart, setCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateBookingId, setUpdateBookingId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeServiceId, setRemoveServiceId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const token = sessionStorage.getItem("accessToken")

  const [paymentData, setPaymentData] = useState({
    bookingId: null,
    phoneNumber: "",
    amount: "",
  });

  const [modalData, setModalData] = useState({});
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
    setSnackbar((prev) => ({ ...prev, show: false }));
  }, type === "success" ? 60000 : 5000);
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    fetchUserDashboard();
  }, []);

  useEffect(() => {
    console.log("Cart State Updated:", cart);
  }, [cart]);

  const fetchUserDashboard = async () => {
    try {
      const response = await API.get("/userdashboard/", {
        withCredentials: true,
      });
      console.log("Full API Response:", JSON.stringify(response.data, null, 2));

      const updatedCart = response.data.cart.map((item) => ({
        ...item,
        event_date: item.event_date || null,
        event_time: item.event_time || null,
        event_location: item.event_location || null,
      }));

      setUser(response.data.user);
      setBookings(response.data.bookings);
      setCart([...updatedCart]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleShowRemoveModal = (service) => {
    if (!service || !service.service) {
      console.error("❌ Error: Service ID is missing or invalid!", service);
      return;
    }
    setModalData({ service });
    setShowRemoveModal(true);
  };

  const handleShowCancelModal = (booking) => {
    setModalData({ booking });
    setShowCancelModal(true);
  };

  const handleShowPaymentModal = (booking) => {
    setPaymentData({
      bookingId: booking.id,
      phoneNumber: "",
      amount: booking.service.price || "", // Pre-fill with service price if available
    });
    setShowPaymentModal(true);
  };

  const handleConfirmRemove = async () => {
    console.log("🚀 Debug: modalData object:", modalData);
    console.log("🚀 Debug: modalData.service:", modalData?.service);
    console.log("🚀 Debug: modalData.service.id:", modalData?.service?.id);

    if (!modalData?.service?.id) {
      console.error("Error: service id is undefined");
      return;
    }

    setRemoveLoading(true);
    setRemoveServiceId(modalData.service.id);

    try {
      const serviceId = modalData.service.id;
      console.log(`Attempting to remove service ID: ${serviceId}`);
      const response = await API.delete(`/userdashboard/${serviceId}/`);
      setCart(response.data.cart);
      fetchUserDashboard();
      console.log("🚀 Updated Cart Data in State:", cart);
      setShowRemoveModal(false);
      toast.success("Item removed from cart successfully!");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart. Please try again.");
    } finally {
      setRemoveLoading(false);
      setRemoveServiceId(null);
    }
  };

  const handleConfirmCancel = async () => {
    console.log("🚀 Debug: modalData object:", modalData);
    console.log("🚀 Debug: modalData.booking:", modalData?.booking);
    console.log("🚀 Debug: modalData.booking.id:", modalData?.booking?.id);

    if (!modalData?.booking?.id) {
      console.error(
        "Error: booking id is undefined or modalData is not properly set"
      );
      toast.error("Unable to cancel booking. Please try again.");
      return;
    }

    setCancelLoading(true);
    setCancelBookingId(modalData.booking.id);

    try {
      const bookingId = modalData.booking.id;
      console.log(`Attempting to cancel booking ID: ${bookingId}`);

      const response = await API.delete(`/booking/${bookingId}/`, {
        withCredentials: true,
      });
      console.log("🚀 API Response after deletion:", response.data);

      toast.success("Booking cancelled successfully!");
      setShowCancelModal(false);
      await fetchUserDashboard();
    } catch (error) {
      console.error("Error canceling booking:", error);

      if (error.response && error.response.status === 403) {
        setShowPermissionError(true);
      } else if (error.response && error.response.status === 404) {
        toast.error("Booking not found. It may have already been cancelled.");
      } else {
        toast.error("Failed to cancel booking. Please try again.");
      }
    } finally {
      setCancelLoading(false);
      setCancelBookingId(null);
    }
  };

  const handleBookService = async (serviceId) => {
    console.log("Cart content:", cart);
    console.log("Looking for service_id:", serviceId);

    const cartItem = cart.find((item) => item.service === serviceId);
    console.log("🔍 Found Cart Item:", cartItem);

    if (!serviceId) {
      console.error("Invalid serviceId:", serviceId);
      setShowFailureModal(true);
      return;
    }

    setBookingLoading(true);
    setBookingServiceId(serviceId);

    try {
      const cartItem = cart.find((item) => item.service === serviceId);

      if (!cartItem) {
        console.error("Service not found in cart:", serviceId);
        throw new Error("SERVICE_NOT_IN_CART");
      }

      const { event_date, event_location, event_time } = cartItem;
      console.log("Cart item found:", {
        service_id: serviceId,
        event_date,
        event_location,
        event_time,
      });

      // Validate required fields
      if (!event_date || !event_time || !event_location) {
        console.error("Missing event details in cart item:", cartItem);
        throw new Error("MISSING_EVENT_DETAILS");
      }

      // Send booking data with unpaid status (matching model default)
      const response = await API.post(
        `/booking/${serviceId}/`,
        {
          status: "unpaid",
          event_date,
          event_time,
          event_location,
        },
        { withCredentials: true }
      );

      if (response.status !== 201) {
        throw new Error("UNEXPECTED_RESPONSE");
      }

      await fetchUserDashboard();

      // Handle success case
      const emailData = {
        service_name: cartItem.service_name || "Service",
        customer_name: user.name || "Customer",
        customer_email: user.email,
        booking_id: response.data.booking_id || "N/A",
        event_date: formatDate(event_date),
        event_time: event_time,
        event_location: event_location,
        booking_date: formatDate(new Date()),
        to_email: user.email,
        admin_email: response.data.admin_emails || ["bonfebdevs@gmail.com"],
      };

      // Note: EmailJS import is missing in original code - you'll need to import it
      // import emailjs from '@emailjs/browser';

      const toastId = toast.loading("Notifying admins...");
      showSnackbar("Booking successful! Notifying admins...", "success");

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          emailData,
          import.meta.env.VITE_EMAILJS_USER_ID
        );

        toast.update(toastId, {
          render: "Admins have been notified!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });

        setSuccessMessage(
          "Service booked successfully! A confirmation has been sent to your email."
        );
        setShowSuccessModal(true);
        fetchUserDashboard();
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        showSnackbar("Booking successful but admin notification failed", "danger");
        setSuccessMessage(
          "Service booked successfully, but email confirmation failed to send."
        );
        setShowSuccessModal(true);
        fetchUserDashboard();
      }
    } catch (error) {
      console.error("Booking error:", error.message, error.response?.data);

      const errorMessage =
        {
          SERVICE_NOT_IN_CART: "Service not found in your cart",
          MISSING_EVENT_DETAILS: "Incomplete event details",
          UNEXPECTED_RESPONSE: "Unexpected server response",
        }[error.message] || "Booking failed - please try again";

      showSnackbar(errorMessage, "danger");
      setShowFailureModal(true);
    } finally {
      setBookingLoading(false);
      setBookingServiceId(null);
    }
  };

  const handleToUpdateBooking = (booking, serviceId) => {
    console.log("Updating booking:", booking);
    setUpdateLoading(true);
    setUpdateBookingId(booking.id);
    navigate(`/event-details/${serviceId}/${booking.id}`);
  };

  const handlePayBooking = async () => {
    const { bookingId, phoneNumber, amount } = paymentData;
    console.log("📦 Pay button clicked");
    if (!phoneNumber || !amount) {
      console.log("❌ Validation failed: Missing phone number or amount");
      console.log("📱 Phone number:", phoneNumber || "MISSING");
      console.log("💰 Amount:", amount || "MISSING");
      toast.error("Please fill in all payment details");
      return;
    }
    console.log("Field Validation Passed");

    // Validate phone number format (basic validation)
    console.log("📞 Validating phone number:", phoneNumber);
    const phoneRegex = /^2547[0-9]{8}$/;
    console.log("📞 Phone regex:", phoneRegex);
    if (!phoneRegex.test(phoneNumber)) {
      showSnackbar(
        "Please enter a valid phone number (e.g., 254712345678)", "danger"
      );
      return;
    }
    console.log("📞 Phone number validation passed");

    // Validate amount
    console.log("💰 Validating amount:", amount);
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    console.log("💰 Amount validation passed");

    console.log("Setting payment loading state to true");
    setPaymentLoading(true);
    console.log("Initiating payment for booking ID:", bookingId);

    try {
      console.log("🌐 Making API call to /stkpush/...");
      console.log("📡 API request details:", {
        url: "/stk-push/",
        method: "POST",
        data: {
          booking: bookingId,
          phone_number: phoneNumber,
          amount: amount,
        },
        withCredentials: true,
      });
      const res = await API.post(
        "/stk-push/",
        {
          booking_id: bookingId,
          phone_number: phoneNumber,
          amount: parseFloat(amount),
        },
        {
          withCredentials: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("✅ API call successful!");
      console.log("📤 STK Push Response:", res.data);
      console.log("📊 Response status:", res.status);
      console.log("📋 Response headers:", res.headers);
      showSnackbar(
        "STK Push Sent! Please check your phone to complete the payment."
      );
      console.log("STK Push Response:", res.data);
      setShowPaymentModal(false);
      setPaymentData({ bookingId: null, phoneNumber: "", amount: "" });

      // Refresh dashboard to update booking status
      console.log("🔄 Refreshing user dashboard to update booking status");
      await fetchUserDashboard();
      console.log("✅ Dashboard refreshed successfully");
    } catch (error) {
      console.error("Error initiating payment:", error);
      console.error("🚨 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config,
      });
      showSnackbar("Failed to initiate payment. Please try again.", "danger");
    } finally {
      console.log("Setting payment loading state to false");
      setPaymentLoading(false);
      console.log("🏁 handlePayBooking function completed");
    }
  };

  const handlePaymentInputChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const CustomSnackbar = ({ show, message, type, onClose }) => {
    if (!show) return null;

    const bgColor = type === "success" ? "bg-success" : "bg-danger";
    const icon = type === "success" ? "✅" : "❌";

    return (
      <div
        className={`position-fixed top-0 start-50 translate-middle-x mt-3 ${bgColor} text-white px-4 py-3 rounded shadow-lg`}
        style={{
          zIndex: 9999,
          minWidth: "300px",
          maxWidth: "500px",
          animation: show ? "slideDown 0.3s ease-out" : "slideUp 0.3s ease-out",
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: "1.2rem" }}>
              {icon}
            </span>
            <span>{message}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
    );
  };

  return (
    <Container
      fluid
      className="mt-4 py-4"
      style={{
        background:
          "linear-gradient(to right,rgb(82, 68, 68),rgb(112, 106, 102), rgb(97, 58, 58))",
        minHeight: "100vh",
      }}
    >
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <Row className="mb-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="text-center mb-3">My Cart</h5>
            {cart.length === 0 ? (
              <p className="text-muted text-center">Your cart is empty.</p>
            ) : (
              <ListGroup>
                {cart.map((item, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex align-items-center"
                  >
                    <img
                      src={item.service_image}
                      alt={item.service_name}
                      width="50"
                      height="50"
                      className="me-3 rounded"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <strong>{item.service_name}</strong>
                      <p className="mb-0">KSH {item.service_price}</p>
                    </div>
                    <div className="flex-grow-1">
                      <strong>Added At</strong>
                      <p className="text-muted">
                        <i>{item.added_at}</i>
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleShowRemoveModal(item)}
                      disabled={
                        removeLoading && removeServiceId === item.service
                      }
                    >
                      {removeLoading && removeServiceId === item.service ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Removing...
                        </>
                      ) : (
                        "Remove"
                      )}
                    </Button>
                    <span className="mx-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          console.log("Item data:", item);
                          console.log("Service object:", item.service);
                          console.log("Booking service ID:", item.service);
                          handleBookService(item.service);
                        }}
                        disabled={
                          bookingLoading && bookingServiceId === item.service
                        }
                      >
                        {bookingLoading && bookingServiceId === item.service ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Booking...
                          </>
                        ) : (
                          "Book"
                        )}
                      </Button>
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container defaultActiveKey="unpaid">
                <Nav variant="tabs" className="d-flex justify-content-between">
                  <Nav.Item>
                    <Nav.Link eventKey="unpaid">Unpaid</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="paid">Paid</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="completed">Completed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="cancelled">Cancelled</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="mt-3">
                  {["unpaid", "paid", "completed", "cancelled"].map(
                    (status) => (
                      <Tab.Pane eventKey={status} key={status}>
                        <Card className="mb-2">
                          <Card.Body>
                            {bookings?.[status]?.length === 0 ? (
                              <p className="text-muted text-center">
                                No bookings found.
                              </p>
                            ) : (
                              <Table striped hover responsive>
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Service Name</th>
                                    <th>Event Date</th>
                                    <th>Event Time</th>
                                    <th>Event Location</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bookings[status].map((booking, index) => (
                                    <tr key={booking.id}>
                                      <td>{index + 1}</td>
                                      <td>{booking.service.name}</td>
                                      <td className="text-muted">
                                        <i>{booking.event_date}</i>
                                      </td>
                                      <td className="text-muted">
                                        <i>{booking.event_time}</i>
                                      </td>
                                      <td className="text-muted">
                                        <i>{booking.event_location}</i>
                                      </td>
                                      {status === "unpaid" ? (
                                        <td>
                                          <Button
                                            className="btn-sm btn-danger me-2"
                                            onClick={() =>
                                              handleShowCancelModal(booking)
                                            }
                                            disabled={
                                              cancelLoading &&
                                              cancelBookingId === booking.id
                                            }
                                          >
                                            {cancelLoading &&
                                            cancelBookingId === booking.id ? (
                                              <>
                                                <Spinner
                                                  as="span"
                                                  animation="border"
                                                  size="sm"
                                                  role="status"
                                                  aria-hidden="true"
                                                  className="me-1"
                                                />
                                                Cancelling...
                                              </>
                                            ) : (
                                              "Cancel"
                                            )}
                                          </Button>
                                          <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() =>
                                              handleShowPaymentModal(booking)
                                            }
                                          >
                                            Pay
                                          </Button>
                                          <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() =>
                                              handleToUpdateBooking(
                                                booking,
                                                booking.service.id
                                              )
                                            }
                                            disabled={
                                              updateLoading &&
                                              updateBookingId === booking.id
                                            }
                                          >
                                            {updateLoading &&
                                            updateBookingId === booking.id ? (
                                              <>
                                                <Spinner
                                                  as="span"
                                                  animation="border"
                                                  size="sm"
                                                  role="status"
                                                  aria-hidden="true"
                                                  className="me-1"
                                                />
                                                Updating...
                                              </>
                                            ) : (
                                              "Update"
                                            )}
                                          </Button>
                                        </td>
                                      ) : (
                                        <td>
                                          <Button
                                            className="btn-sm btn-success"
                                            onClick={() =>
                                              console.log(
                                                "View Details",
                                                booking.id
                                              )
                                            }
                                          >
                                            View Details
                                          </Button>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            )}
                          </Card.Body>
                        </Card>
                      </Tab.Pane>
                    )
                  )}
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Snackbar for notifications */}
      <CustomSnackbar
        show={snackbar.show}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />

      {/* Remove Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this item from your cart?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmRemove}
            disabled={removeLoading}
          >
            {removeLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Removing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancel</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this booking?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmCancel}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Cancelling...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number (e.g., +254712345678 or 0712345678)"
                value={paymentData.phoneNumber}
                onChange={(e) =>
                  handlePaymentInputChange("phoneNumber", e.target.value)
                }
                disabled={paymentLoading}
              />
              <Form.Text className="text-muted">
                Enter your M-Pesa phone number
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount (KSH)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={paymentData.amount}
                onChange={(e) =>
                  handlePaymentInputChange("amount", e.target.value)
                }
                min="1"
                disabled={paymentLoading}
              />
              <Form.Text className="text-muted">
                Enter the amount to pay
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPaymentModal(false)}
            disabled={paymentLoading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handlePayBooking}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Check your phone to enter Mpesa PIN...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Booking Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>Your service has been successfully booked!</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Failure Modal */}
      <Modal show={showFailureModal} onHide={() => setShowFailureModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Booking Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          There was an issue booking your service. Please try again.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowFailureModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permission Error Modal */}
      <Modal
        show={showPermissionError}
        onHide={() => setShowPermissionError(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Permission Denied</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            You do not have permission to delete this booking. Only the booking
            owner or an admin can delete it.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPermissionError(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserDashboard;
