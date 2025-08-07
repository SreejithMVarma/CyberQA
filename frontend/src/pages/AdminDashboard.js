import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Form, Button, ListGroup, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';

function AdminDashboard() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    type: 'numeric',
    cipherType: '',
    difficulty: 'easy',
    tags: '',
    expectedAnswer: '',
    testCases: [],
    source: '',
    image: '',
  });
  const [pendingAnswers, setPendingAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [questionPage, setQuestionPage] = useState(1);
  const [answerPage, setAnswerPage] = useState(1);
  const [totalQuestionPages, setTotalQuestionPages] = useState(1);
  const [totalAnswerPages, setTotalAnswerPages] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const limit = 10;
  const dropRef = useRef(null);
  const navigate = useNavigate();

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/questions?page=${questionPage}&limit=${limit}`, {
        withCredentials: true,
      });
      setQuestions(res.data.questions || []);
      setTotalQuestionPages(res.data.totalPages || 1);
    } catch (err) {
      setMessage('Failed to fetch questions');
      setAlertVariant('danger');
    }
  }, [questionPage]);

  const fetchPendingAnswers = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/answers/pending?page=${answerPage}&limit=${limit}`, {
        withCredentials: true,
      });
      const answers = (res.data.answers || []).map((answer) => ({
        ...answer,
        image: answer.image ? `http://localhost:5000${answer.image}` : '',
      }));
      setPendingAnswers(answers);
      setTotalAnswerPages(res.data.totalPages || 1);
    } catch (err) {
      setMessage('Failed to fetch pending answers');
      setAlertVariant('danger');
    }
  }, [answerPage]);

  useEffect(() => {
    fetchQuestions();
    fetchPendingAnswers();
  }, [questionPage, answerPage, fetchQuestions, fetchPendingAnswers]);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.border = '2px dashed #6c757d';
  };

  const handleDragLeave = () => {
    dropRef.current.style.border = '1px solid #ced4da';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setImageFile(e.dataTransfer.files[0]);
    dropRef.current.style.border = '1px solid #ced4da';
  };

  const handleImageSubmit = async () => {
    try {
      if (!imageFile) {
        setMessage('Please select an image');
        setAlertVariant('danger');
        return;
      }
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await axios.post('http://localhost:5000/api/questions/upload-image', formData, {
        withCredentials: true,
      });
      const fullImageUrl = `http://localhost:5000${res.data.imageUrl}`;
      setNewQuestion({ ...newQuestion, image: fullImageUrl });
      setImageFile(null);
      setMessage('Image uploaded successfully');
      setAlertVariant('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Image upload failed');
      setAlertVariant('danger');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/questions', newQuestion, {
        withCredentials: true,
      });
      setQuestions([...questions, res.data]);
      setMessage('Question created successfully');
      setAlertVariant('success');
      setNewQuestion({
        questionText: '',
        type: 'numeric',
        cipherType: '',
        difficulty: 'easy',
        tags: '',
        expectedAnswer: '',
        testCases: [],
        source: '',
        image: '',
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save question');
      setAlertVariant('danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`, { withCredentials: true });
      setQuestions(questions.filter((q) => q._id !== id));
      setMessage('Question deleted successfully');
      setAlertVariant('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete question');
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

  return (
    <Container className="my-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2>Admin Dashboard</h2>
        {message && <Alert variant={alertVariant}>{message}</Alert>}
        <Tabs defaultActiveKey="create" id="admin-tabs" className="mb-3">
          <Tab eventKey="create" title="Create Question">
            <Form onSubmit={handleQuestionSubmit}>
              <Form.Group className="mb-3" controlId="questionText">
                <Form.Label>Question Text</Form.Label>
                <Form.Control
                  as="textarea"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="type">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                >
                  <option value="numeric">Numeric</option>
                  <option value="ciphertext">Ciphertext</option>
                  <option value="code">Code</option>
                  <option value="formula">Formula</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="cipherType">
                <Form.Label>Cipher Type (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={newQuestion.cipherType}
                  onChange={(e) => setNewQuestion({ ...newQuestion, cipherType: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="difficulty">
                <Form.Label>Difficulty</Form.Label>
                <Form.Select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="tags">
                <Form.Label>Tags (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="expectedAnswer">
                <Form.Label>Expected Answer (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  value={newQuestion.expectedAnswer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, expectedAnswer: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="testCases">
                <Form.Label>Test Cases (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  value={JSON.stringify(newQuestion.testCases)}
                  onChange={(e) => {
                    try {
                      setNewQuestion({ ...newQuestion, testCases: JSON.parse(e.target.value) || [] });
                    } catch {
                      setMessage('Invalid test cases format');
                      setAlertVariant('danger');
                    }
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="source">
                <Form.Label>Source (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={newQuestion.source}
                  onChange={(e) => setNewQuestion({ ...newQuestion, source: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="image">
                <Form.Label>Question Image (Optional)</Form.Label>
                <div
                  ref={dropRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ border: '1px solid #ced4da', padding: '1rem', borderRadius: '6px' }}
                >
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/png"
                    capture="environment"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    aria-label="Upload or capture question image"
                  />
                  <p className="text-muted">Drag and drop or click to upload/capture image (JPEG/PNG only)</p>
                </div>
                {imageFile && (
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button onClick={handleImageSubmit} className="mt-2">
                      Upload Image
                    </Button>
                  </motion.div>
                )}
                {newQuestion.image && (
                  <div className="mt-2">
                    <img
                      src={newQuestion.image}
                      alt="Preview of uploaded question"
                      style={{ maxWidth: '200px', height: 'auto', borderRadius: '6px' }}
                      onClick={() => handleImageClick(newQuestion.image)}
                    />
                  </div>
                )}
              </Form.Group>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button variant="primary" type="submit">
                  Create Question
                </Button>
              </motion.div>
            </Form>
          </Tab>
          <Tab eventKey="questions" title="Questions">
            <ListGroup>
              {questions.map((q) => (
                <ListGroup.Item key={q._id} action onClick={() => navigate(`/questions/${q._id}`)}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5>{q.questionText}</h5>
                      <p className="mb-0">Type: {q.type} | Difficulty: {q.difficulty} | Tags: {q.tags.join(", ")}</p>
                    </div>
                    <div>
                      <Button
                        variant="warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-question/${q._id}`);
                        }}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(q._id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Pagination
              currentPage={questionPage}
              totalPages={totalQuestionPages}
              onPageChange={setQuestionPage}
            />
          </Tab>
          <Tab eventKey="answers" title="Pending Answers">
            <ListGroup>
              {pendingAnswers.map((a) => (
                <ListGroup.Item key={a._id} action onClick={() => navigate(`/questions/${a.questionId._id}`)}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5>{a.questionId?.questionText || 'Unknown'}</h5>
                      <p className="mb-0">Username: {a.userId?.username || 'Unknown'}</p>
                      <p className="mb-0">Answer: {a.content}</p>
                      {a.image && (
                        <img
                          src={a.image}
                          alt={`Answer for ${a.questionId?.questionText || 'question'}`}
                          className="img-fluid mt-2 cursor-pointer"
                          style={{ maxWidth: '200px', height: 'auto', borderRadius: '6px' }}
                          onClick={() => handleImageClick(a.image)}
                        />
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Pagination
              currentPage={answerPage}
              totalPages={totalAnswerPages}
              onPageChange={setAnswerPage}
            />
          </Tab>
        </Tabs>
        <Modal show={showImageModal} onHide={handleCloseModal} centered>
          <Modal.Body>
            <img
              src={selectedImage}
              alt="Enlarged answer"
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

export default AdminDashboard;