import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Alert, Card, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import AnswerForm from '../components/AnswerForm';
import { AuthContext } from '../context/AuthContext';

function QuestionDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [suggestAnswerId, setSuggestAnswerId] = useState(null);
  const [comments, setComments] = useState('');

  const BASE_URL = process.env.REACT_APP_API_URL;
  const queryParams = new URLSearchParams(location.search);
  const isFromUnsolved = queryParams.get('from') === 'unsolved';
  const focusAnswerId = queryParams.get('answerId');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/questions/${id}`, {
          withCredentials: true,
        });
        setQuestion(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load question');
        setAlertVariant('danger');
      }
    };
    const fetchAnswers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/answers/question/${id}`, {
          withCredentials: true,
        });
        setAnswers(res.data || []);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load answers');
        setAlertVariant('danger');
      }
    };
    fetchQuestion();
    fetchAnswers();
  }, [id]);

  const handleVerifyAnswer = async (answerId, status, comments = '') => {
    try {
      await axios.post(
        `${BASE_URL}/api/answers/${answerId}/verify`,
        { status, comments, xpEarned: status === 'verified' ? 10 : 0 },
        { withCredentials: true }
      );
      setMessage(`Answer ${status} successfully`);
      setAlertVariant('success');
      const res = await axios.get(`${BASE_URL}/api/answers/question/${id}`, {
        withCredentials: true,
      });
      setAnswers(res.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to verify answer');
      setAlertVariant('danger');
    }
  };

  const handleSuggestChanges = async (answerId) => {
    if (!comments.trim()) {
      setMessage('Please enter suggestions before submitting');
      setAlertVariant('danger');
      return;
    }
    try {
      await axios.post(
        `${BASE_URL}/api/answers/${answerId}/suggest`,
        { comments },
        { withCredentials: true }
      );
      setMessage('Suggestions sent successfully');
      setAlertVariant('success');
      setSuggestAnswerId(null);
      setComments('');
      const res = await axios.get(`${BASE_URL}/api/answers/question/${id}`, {
        withCredentials: true,
      });
      setAnswers(res.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send suggestions');
      setAlertVariant('danger');
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  if (!question) return <div>Loading...</div>;

  const verifiedAnswer = answers.find((a) => a.status === 'verified');
  const pendingAnswers = answers.filter((a) => a.status === 'pending');
  const focusAnswer = focusAnswerId ? answers.find((a) => a._id === focusAnswerId && a.status === 'pending') : null;

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {message && <Alert variant={alertVariant}>{message}</Alert>}
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>{question.questionText}</Card.Title>
            <Card.Text>{question.content}</Card.Text>
            {question.image && (
              <img
                src={`${BASE_URL}${question.image}`}
                alt={`Visual for question: ${question.questionText}`}
                className="img-fluid mb-3 cursor-pointer"
                style={{ maxWidth: '200px', height: 'auto', borderRadius: '6px' }}
                onClick={() => handleImageClick(`${BASE_URL}${question.image}`)}
              />
            )}
            <Card.Text>Type: {question.type}</Card.Text>
            <Card.Text>Difficulty: {question.difficulty}</Card.Text>
            <Card.Text>Tags: {question.tags.join(', ')}</Card.Text>
          </Card.Body>
        </Card>

        {/* Admin: Reviewing a specific pending answer (from Pending Answers section) */}
        {user?.role === 'admin' && focusAnswerId && focusAnswer && (
          <>
            <h4>Pending Answer</h4>
            <Card className="mb-3">
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                  Username: {focusAnswer.userId?.username || 'Unknown'}
                </Card.Subtitle>
                <Card.Text>{focusAnswer.content}</Card.Text>
                {focusAnswer.image && (
                  <img
                    src={`${BASE_URL}${focusAnswer.image}`}
                    alt="Pending answer"
                    className="img-fluid mb-3 cursor-pointer"
                    style={{ maxWidth: '200px', height: 'auto', borderRadius: '6px' }}
                    onClick={() => handleImageClick(`${BASE_URL}${focusAnswer.image}`)}
                  />
                )}
                <div className="mt-2">
                  <Button
                    variant="success"
                    onClick={() => handleVerifyAnswer(focusAnswer._id, 'verified')}
                    className="me-2"
                  >
                    Verify
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => setSuggestAnswerId(focusAnswer._id)}
                    className="me-2"
                  >
                    Suggest Changes
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleVerifyAnswer(focusAnswer._id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
                {suggestAnswerId === focusAnswer._id && (
                  <Form className="mt-3">
                    <Form.Group controlId={`comments-${focusAnswer._id}`}>
                      <Form.Label>Suggestions for Resubmission</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Enter suggestions for resubmission"
                      />
                    </Form.Group>
                    <div className="mt-2">
                      <Button
                        variant="primary"
                        onClick={() => handleSuggestChanges(focusAnswer._id)}
                        className="me-2"
                      >
                        Send
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSuggestAnswerId(null);
                          setComments('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Admin: General context (not from Unsolved or specific answer) */}
        {user?.role === 'admin' && !isFromUnsolved && !focusAnswerId && (
          <>
            <h4>Answers</h4>
            {verifiedAnswer ? (
              <Card className="mb-3">
                <Card.Body>
                  <Card.Subtitle className="mb-2 text-muted">
                    Username: {verifiedAnswer.userId?.username || 'Unknown'}
                  </Card.Subtitle>
                  <Card.Text>{verifiedAnswer.content}</Card.Text>
                  {verifiedAnswer.image && (
                    <img
                      src={`${BASE_URL}${verifiedAnswer.image}`}
                      alt="Verified answer"
                      className="img-fluid mb-3 cursor-pointer"
                      style={{ maxWidth: '200px', height: 'auto', borderRadius: '6px' }}
                      onClick={() => handleImageClick(`${BASE_URL}${verifiedAnswer.image}`)}
                    />
                  )}
                </Card.Body>
              </Card>
            ) : pendingAnswers.length > 0 ? (
              pendingAnswers.map((a) => (
                <Card key={a._id} className="mb-3">
                  <Card.Body>
                    <Card.Subtitle className="mb-2 text-muted">
                      Username: {a.userId?.username || 'Unknown'}
                    </Card.Subtitle>
                    <Card.Text>{a.content}</Card.Text>
                    {a.image && (
                      <img
                        src={`${BASE_URL}${a.image}`}
                        alt="Answer"
                        className="img-fluid mb-3 cursor-pointer"
                        style={{ maxWidth: '200px', height: 'auto', borderRadius: '6px' }}
                        onClick={() => handleImageClick(`${BASE_URL}${a.image}`)}
                      />
                    )}
                    <div className="mt-2">
                      <Button
                        variant="success"
                        onClick={() => handleVerifyAnswer(a._id, 'verified')}
                        className="me-2"
                      >
                        Verify
                      </Button>
                      <Button
                        variant="warning"
                        onClick={() => setSuggestAnswerId(a._id)}
                        className="me-2"
                      >
                        Suggest Changes
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleVerifyAnswer(a._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                    {suggestAnswerId === a._id && (
                      <Form className="mt-3">
                        <Form.Group controlId={`comments-${a._id}`}>
                          <Form.Label>Suggestions for Resubmission</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Enter suggestions for resubmission"
                          />
                        </Form.Group>
                        <div className="mt-2">
                          <Button
                            variant="primary"
                            onClick={() => handleSuggestChanges(a._id)}
                            className="me-2"
                          >
                            Send
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSuggestAnswerId(null);
                              setComments('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No answers submitted yet.</p>
            )}
          </>
        )}

        {/* Show AnswerForm for unsolved questions (no verified answer) for admins (from Unsolved) or users, but not when reviewing a specific answer */}
        {!verifiedAnswer && !focusAnswerId && (
          <>
            <h4>Submit Your Answer</h4>
            <AnswerForm
              questionId={id}
              setMessage={setMessage}
              setAlertVariant={setAlertVariant}
              onSubmitSuccess={() => {
                setMessage('Answer submitted successfully!');
                // Refresh answers to reflect the new submission
                axios
                  .get(`${BASE_URL}/api/answers/question/${id}`, {
                    withCredentials: true,
                  })
                  .then((res) => setAnswers(res.data || []))
                  .catch((err) => {
                    setMessage(err.response?.data?.message || 'Failed to load answers');
                    setAlertVariant('danger');
                  });
              }}
            />
          </>
        )}

        {/* Non-admin users: Show verified answer if it exists */}
        {user?.role !== 'admin' && verifiedAnswer && (
          <>
            <h4>Verified Answer</h4>
            <Card>
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                  Username: {verifiedAnswer.userId?.username || 'Unknown'}
                </Card.Subtitle>
                <Card.Text>{verifiedAnswer.content}</Card.Text>
                {verifiedAnswer.image && (
                  <img
                    src={`${BASE_URL}${verifiedAnswer.image}`}
                    alt="Verified answer"
                    className="img-fluid mb-3 cursor-pointer"
                    style={{ maxWidth: '200px', height: 'auto', borderRadius: '6px' }}
                    onClick={() => handleImageClick(`${BASE_URL}${verifiedAnswer.image}`)}
                  />
                )}
              </Card.Body>
            </Card>
          </>
        )}

        <Modal show={showImageModal} onHide={handleCloseModal} centered>
          <Modal.Body>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="img-fluid"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </motion.div>
    </Container>
  );
}

export default QuestionDetail;