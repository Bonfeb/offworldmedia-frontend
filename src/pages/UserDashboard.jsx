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
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../api";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState({
    pending: [],
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
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState(null);

  const [modalData, setModalData] = useState({});
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      //console.log("Full API Response:", JSON.stringify(response.data, null, 2)); // Debugging

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

  const handleConfirmRemove = async () => {
    setShowRemoveModal(false);

    console.log("🚀 Debug: modalData object:", modalData);
    console.log("🚀 Debug: modalData.id:", modalData?.service);
    console.log("🚀 Debug: modalData.service.id:", modalData?.service?.id);

    if (!modalData?.service?.id) {
      console.error("Error: service id is undefined");
      return;
    }

    try {
      const serviceId = modalData.service.id;
      console.log(`Attempting to remove service ID: ${serviceId}`);
      const response = await API.delete(`/userdashboard/${serviceId}/`);
      setCart(response.data.cart);
      fetchUserDashboard();
      console.log("🚀 Updated Cart Data in State:", cart);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false); // Close the modal

    // Debugging: Log the modalData object and its properties
    console.log("🚀 Debug: modalData object:", modalData);
    console.log("🚀 Debug: modalData.id:", modalData?.id);
    console.log("🚀 Debug: modalData.booking.id:", modalData?.booking?.id);

    // Check if the booking ID is valid
    if (!modalData?.booking?.id) {
      console.error("Error: booking id is undefined");
      return;
    }

    try {
      const bookingId = modalData.booking.id;
      console.log(`Attempting to cancel booking ID: ${bookingId}`);

      // Make a DELETE request to the backend to cancel the booking
      const response = await API.delete(`/booking/${bookingId}/`, {
        withCredentials: true,
      });
      console.log("🚀 API Response after deletion:", response.data);

      // Update the state with the updated data (if applicable)
      setBookings(response.data.bookings); // Assuming the response contains updated bookings
      fetchUserDashboard(); // Refresh the dashboard or bookings list

      console.log("🚀 Updated Bookings Data in State:", bookings);
    } catch (error) {
      console.error("Error canceling booking:", error);
      // If error is 403, show permission error modal
      if (error.response && error.response.status === 403) {
        setShowPermissionError(true);
      }
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
    try {
      console.log("Looking for service_id:", serviceId);
      const cartItem = cart.find((item) => item.service === serviceId);

      if (!cartItem) {
        console.error("Service not found in cart:", serviceId);
        throw new Error("SERVICE_NOT_IN_CART");
      }

      const { event_date, event_location, event_time, service_id } = cartItem;
      console.log("Cart item found:", {
        service_id,
        event_date,
        event_location,
        event_time,
      });

      // Validate required fields
      if (!event_date || !event_time || !event_location) {
        console.error("Missing event details in cart item:", cartItem);
        throw new Error("MISSING_EVENT_DETAILS");
      }

      // Send minimal data - backend should get the rest from cart
      const response = await API.post(
        `/booking/${serviceId}/`,
        { status: "pending" }, // Only send what's not in cart
        { withCredentials: true }
      );

      if (response.status !== 201) {
        throw new Error("UNEXPECTED_RESPONSE");
      }

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

      const toastId = toast.loading("Notifying admins...");

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
        toast.error("Booking successful but admin notification failed");
        setSuccessMessage(
          "Service booked successfully, but email confirmation failed to send."
        );
      }
    } catch (error) {
      console.error("Booking error:", error.message, error.response?.data);

      const errorMessage =
        {
          SERVICE_NOT_IN_CART: "Service not found in your cart",
          MISSING_EVENT_DETAILS: "Incomplete event details",
          UNEXPECTED_RESPONSE: "Unexpected server response",
        }[error.message] || "Booking failed - please try again";

      toast.error(errorMessage);
      setShowFailureModal(true);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleToUpdateBooking = (booking, serviceId) => {
    console.log("Updating booking:", booking);
    navigate(`/event-details/${serviceId}/${booking.id}`);
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
                    >
                      Remove
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
                          <span>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Booking...
                          </span>
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
              <Tab.Container defaultActiveKey="pending">
                <Nav variant="tabs" className="d-flex justify-content-between">
                  <Nav.Item>
                    <Nav.Link eventKey="pending">Pending</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="completed">Completed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="cancelled">Cancelled</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="mt-3">
                  {["pending", "completed", "cancelled"].map((status) => (
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
                                      <i>{booking.event_location}</i>
                                    </td>
                                    {status === "pending" ? (
                                      <td>
                                        <Button
                                          className="btn-sm btn-danger"
                                          onClick={() =>
                                            handleShowCancelModal(booking)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                        <span className="mx-3">
                                          <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() =>
                                              handleToUpdateBooking(
                                                booking,
                                                booking.service.id
                                              )
                                            }
                                          >
                                            Update
                                          </Button>
                                        </span>
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
                  ))}
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
          <Button variant="danger" onClick={handleConfirmRemove}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancel</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this booking?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
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
