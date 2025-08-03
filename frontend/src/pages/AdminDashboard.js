import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Table, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [pendingAnswers, setPendingAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchPendingAnswers();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/questions', { withCredentials: true });
      setQuestions(res.data);
    } catch (err) {
      setMessage('Failed to fetch questions');
      setAlertVariant('danger');
    }
  };

  const fetchPendingAnswers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/answers/pending', { withCredentials: true });
      setPendingAnswers(res.data);
    } catch (err) {
      setMessage('Failed to fetch pending answers');
      setAlertVariant('danger');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.border = '2px dashed var(--secondary)';
  };

  const handleDragLeave = () => {
    dropRef.current.style.border = '1px solid var(--border)';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setImageFile(e.dataTransfer.files[0]);
    dropRef.current.style.border = '1px solid var(--border)';
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
      console.log('Submitting question:', newQuestion); // Debug log for tags issue
      if (editingQuestion) {
        const res = await axios.put(
          `http://localhost:5000/api/questions/${editingQuestion._id}`,
          newQuestion,
          { withCredentials: true }
        );
        setQuestions(questions.map((q) => (q._id === editingQuestion._id ? res.data : q)));
        setEditingQuestion(null);
        setMessage('Question updated successfully');
      } else {
        const res = await axios.post('http://localhost:5000/api/questions', newQuestion, {
          withCredentials: true,
        });
        setQuestions([...questions, res.data]);
        setMessage('Question created successfully');
      }
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

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setNewQuestion({
      questionText: question.questionText,
      type: question.type,
      cipherType: question.cipherType,
      difficulty: question.difficulty,
      tags: question.tags.join(','),
      expectedAnswer: question.expectedAnswer || '',
      testCases: question.testCases,
      source: question.source,
      image: question.image,
    });
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

  const handleVerifyAnswer = async (answerId, status, comments = '') => {
    try {
      await axios.post(
        `http://localhost:5000/api/answers/${answerId}/verify`,
        { status, comments },
        { withCredentials: true }
      );
      setPendingAnswers(pendingAnswers.filter((a) => a._id !== answerId));
      setMessage(`Answer ${status} successfully`);
      setAlertVariant('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to verify answer');
      setAlertVariant('danger');
    }
  };

  const handleSuggestChanges = async (answerId, comments) => {
    try {
      await axios.post(
        `http://localhost:5000/api/answers/${answerId}/suggest`,
        { comments },
        { withCredentials: true }
      );
      setPendingAnswers(pendingAnswers.filter((a) => a._id !== answerId));
      setMessage('Suggestions sent successfully');
      setAlertVariant('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send suggestions');
      setAlertVariant('danger');
    }
  };

  return (
    <Container className="my-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2>Admin Dashboard</h2>
        {message && <Alert variant={alertVariant}>{message}</Alert>}
        <h3>{editingQuestion ? 'Edit Question' : 'Create Question'}</h3>
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
              style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '6px' }}
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
                />
              </div>
            )}
          </Form.Group>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Button variant="primary" type="submit">
              {editingQuestion ? 'Update Question' : 'Create Question'}
            </Button>
            {editingQuestion && (
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => {
                  setEditingQuestion(null);
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
                }}
              >
                Cancel
              </Button>
            )}
          </motion.div>
        </Form>
        <h3 className="mt-5">Questions</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Question</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q._id}>
                <td>{q.questionText}</td>
                <td>{q.type}</td>
                <td>{q.difficulty}</td>
                <td>{q.tags.join(', ')}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(q)}>
                    Edit
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(q._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <h3 className="mt-5">Pending Answers</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Username</th>
              <th>Question</th>
              <th>Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingAnswers.map((a) => (
              <tr key={a._id}>
                <td>{a.userId?.username || 'Unknown'}</td>
                <td>{a.questionId?.questionText || 'Unknown'}</td>
                <td>{a.content}</td>
                <td>
                  <Button variant="success" onClick={() => handleVerifyAnswer(a._id, 'verified')}>
                    Verify
                  </Button>{' '}
                  <Button
                    variant="warning"
                    onClick={() => {
                      const comments = prompt('Enter suggestions for resubmission:');
                      if (comments) handleSuggestChanges(a._id, comments);
                    }}
                  >
                    Suggest Changes
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleVerifyAnswer(a._id, 'rejected')}>
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </motion.div>
    </Container>
  );
}

export default AdminDashboard;