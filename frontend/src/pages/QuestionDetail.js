import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Card, Button, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import AnswerForm from '../components/AnswerForm';
import { AuthContext } from '../context/AuthContext';

function QuestionDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const BASE_URL = 'http://localhost:5000';

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

  const handleSuggestChanges = async (answerId, comments) => {
    try {
      await axios.post(
        `${BASE_URL}/api/answers/${answerId}/suggest`,
        { comments },
        { withCredentials: true }
      );
      setMessage('Suggestions sent successfully');
      setAlertVariant('success');
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

        {user?.role === 'admin' ? (
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
                        onClick={() => {
                          const comments = prompt('Enter suggestions for resubmission:');
                          if (comments) handleSuggestChanges(a._id, comments);
                        }}
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
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No answers submitted yet.</p>
            )}
          </>
        ) : (
          <>
            {verifiedAnswer ? (
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
            ) : (
              <>
                <h4>Submit Your Answer</h4>
                <AnswerForm
                  questionId={id}
                  setMessage={setMessage}
                  setAlertVariant={setAlertVariant}
                  onSubmitSuccess={() => setMessage('Answer submitted!')}
                />
              </>
            )}
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
