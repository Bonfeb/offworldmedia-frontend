import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Pagination, Modal, Form } from 'react-bootstrap';
import { Avatar, Badge, CircularProgress, Snackbar, Alert } from '@mui/material';
import emailjs from '@emailjs/browser';
import API from '../../api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(5);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin-dashboard/?action=messages');
      setMessages(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch messages. Please try again later.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await API.put(`/admin-dashboard/messages/${messageId}/mark-read/`);
      setMessages(messages.map(message =>
        message.id === messageId ? { ...message, read: true } : message
      ));
      showNotification('Message marked as read', 'success');
    } catch (err) {
      console.error('Error marking message as read:', err);
      showNotification('Failed to mark message as read', 'error');
    }
  };

  const handleReplyClick = (message) => {
    setSelectedMessage(message);
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedMessage(null);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      showNotification('Reply cannot be empty', 'error');
      return;
    }

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_REPLY_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_REPLY_TEMPLATE_ID,
        {
          to_name: selectedMessage.name,
          to_email: selectedMessage.email,
          reply_message: replyText,
          subject: `Re: ${selectedMessage.subject}`,
        },
        import.meta.env.VITE_EMAILJS_REPLY_USER_ID
      );

      if (!selectedMessage.read) {
        await handleMarkAsRead(selectedMessage.id);
      }

      showNotification('Reply sent successfully', 'success');
      handleCloseReplyModal();
    } catch (err) {
      console.error('Error sending reply:', err);
      showNotification('Failed to send reply', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">User Messages</h2>

      {(error || messages.length === 0) ? (
        <Card className="mb-3 p-3 text-center" style={{ borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <Card.Body>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Alert severity="info">No messages found.</Alert>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          {currentMessages.map((message) => (
            <Card key={message.id} className="mb-3" style={{ borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Card.Body>
                <Row>
                  <Col xs={12} md={1} className="text-center mb-3 mb-md-0">
                    <Avatar
                      src={message.user.profile_pic || '/default-avatar.png'}
                      alt={message.name}
                      sx={{ width: 60, height: 60, border: '2px solid #e0e0e0' }}
                    />
                  </Col>
                  <Col xs={12} md={11}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <h5 className="mb-0">{message.name}</h5>
                        <small className="text-muted">{message.email}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <span
                          className={`me-3 ${message.read ? 'text-muted' : 'text-primary fw-bold'}`}
                          style={{ fontSize: '0.875rem' }}
                        >
                          {message.read ? 'Read' : 'Unread'}
                        </span>
                        <small className="text-muted">
                          {formatDate(message.sent_at)}
                        </small>
                      </div>
                    </div>
                    <Card.Title>{message.subject}</Card.Title>
                    <Card.Text>{message.message}</Card.Text>
                    <div className="d-flex justify-content-end mt-3">
                      {!message.read && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleMarkAsRead(message.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReplyClick(message)}
                      >
                        Reply
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </div>
        </>
      )}

      <Modal show={replyModalOpen} onHide={handleCloseReplyModal}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to {selectedMessage?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Recipient</Form.Label>
              <Form.Control
                type="text"
                value={selectedMessage?.email || ''}
                disabled
                className="bg-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                value={`Re: ${selectedMessage?.subject || ''}`}
                disabled
                className="bg-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Original Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedMessage?.message || ''}
                disabled
                className="bg-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Your Reply</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReplyModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendReply}>
            Send Reply
          </Button>
        </Modal.Footer>
      </Modal>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminMessages;
