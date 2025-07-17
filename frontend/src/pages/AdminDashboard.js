import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Table } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

function AdminDashboard() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    type: '',
    cipherType: '',
    difficulty: '',
    tags: '',
    expectedAnswer: '',
    testCases: [],
    source: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, aRes] = await Promise.all([
          axios.get('http://localhost:5000/api/questions', { withCredentials: true }),
          axios.get('http://localhost:5000/api/answers/user', { withCredentials: true })
        ]);
        setQuestions(qRes.data);
        setAnswers(aRes.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/questions', {
        ...newQuestion,
        tags: newQuestion.tags.split(',').map(tag => tag.trim())
      }, { withCredentials: true });
      alert('Question added');
      setNewQuestion({ questionText: '', type: '', cipherType: '', difficulty: '', tags: '', expectedAnswer: '', testCases: [], source: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleVerify = async (answerId, status, xpEarned) => {
    try {
      await axios.put(`http://localhost:5000/api/answers/${answerId}/verify`, { status, xpEarned }, { withCredentials: true });
      alert('Answer verified');
      setAnswers(answers.map(a => a._id === answerId ? { ...a, status, xpEarned } : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <Container className="mt-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>Admin Dashboard</h2>
        <h3>Add Question</h3>
        <Form onSubmit={handleQuestionSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Question Text</Form.Label>
            <Form.Control
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
              required
            >
              <option value="">Select Type</option>
              <option value="numeric">Numeric</option>
              <option value="ciphertext">Ciphertext</option>
              <option value="code">Code</option>
              <option value="formula">Formula</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select
              value={newQuestion.difficulty}
              onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              value={newQuestion.tags}
              onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Expected Answer</Form.Label>
            <Form.Control
              value={newQuestion.expectedAnswer}
              onChange={(e) => setNewQuestion({ ...newQuestion, expectedAnswer: e.target.value })}
            />
          </Form.Group>
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Button variant="primary" type="submit">
              Add Question
            </Button>
          </motion.div>
        </Form>
        <h3 className="mt-5">Pending Answers</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {answers.filter(a => a.status === 'pending').map(a => (
              <tr key={a._id}>
                <td>{a.questionId?.questionText || 'Unknown question'}</td>
                <td>{a.content}</td>
                <td>{a.status}</td>
                <td>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button variant="success" onClick={() => handleVerify(a._id, 'verified', 10)}>
                      Verify
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button variant="danger" onClick={() => handleVerify(a._id, 'rejected', 0)}>
                      Reject
                    </Button>
                  </motion.div>
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