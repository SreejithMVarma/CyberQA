import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Table, InputGroup } from 'react-bootstrap';
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
  const [editQuestion, setEditQuestion] = useState(null);
  const [xpInputs, setXpInputs] = useState({});

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
      const questionData = { ...newQuestion, tags: newQuestion.tags.split(',').map(tag => tag.trim()) };
      if (editQuestion) {
        await axios.put(`http://localhost:5000/api/questions/${editQuestion._id}`, questionData, { withCredentials: true });
        setQuestions(questions.map(q => q._id === editQuestion._id ? { ...q, ...questionData } : q));
        setEditQuestion(null);
      } else {
        const res = await axios.post('http://localhost:5000/api/questions', questionData, { withCredentials: true });
        setQuestions([...questions, res.data]);
      }
      setNewQuestion({ questionText: '', type: '', cipherType: '', difficulty: '', tags: '', expectedAnswer: '', testCases: [], source: '' });
      alert(editQuestion ? 'Question updated' : 'Question added');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setEditQuestion(question);
    setNewQuestion({
      questionText: question.questionText,
      type: question.type,
      cipherType: question.cipherType,
      difficulty: question.difficulty,
      tags: question.tags.join(','),
      expectedAnswer: question.expectedAnswer,
      testCases: question.testCases,
      source: question.source
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`, { withCredentials: true });
      setQuestions(questions.filter(q => q._id !== id));
      alert('Question deleted');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleVerify = async (answerId, status) => {
    try {
      const xpEarned = status === 'verified' ? (xpInputs[answerId] || 10) : 0;
      await axios.put(`http://localhost:5000/api/answers/${answerId}/verify`, { status, xpEarned }, { withCredentials: true });
      setAnswers(answers.map(a => a._id === answerId ? { ...a, status, xpEarned } : a));
      alert('Answer verified');
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <Container className="mt-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>Admin Dashboard</h2>
        <h3>{editQuestion ? 'Edit Question' : 'Add Question'}</h3>
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
            <Form.Label>Cipher Type</Form.Label>
            <Form.Control
              value={newQuestion.cipherType}
              onChange={(e) => setNewQuestion({ ...newQuestion, cipherType: e.target.value })}
            />
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
          <Form.Group className="mb-3">
            <Form.Label>Source</Form.Label>
            <Form.Control
              value={newQuestion.source}
              onChange={(e) => setNewQuestion({ ...newQuestion, source: e.target.value })}
            />
          </Form.Group>
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Button variant="primary" type="submit">
              {editQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </motion.div>
          {editQuestion && (
            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Button variant="secondary" onClick={() => setEditQuestion(null)} className="ms-2">
                Cancel Edit
              </Button>
            </motion.div>
          )}
        </Form>
        <h3 className="mt-5">Questions</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Question</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <motion.tr key={q._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                <td>{q.questionText}</td>
                <td>{q.type}</td>
                <td>{q.difficulty}</td>
                <td>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button variant="warning" onClick={() => handleEdit(q)} className="me-2">
                      Edit
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button variant="danger" onClick={() => handleDelete(q._id)}>
                      Delete
                    </Button>
                  </motion.div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
        <h3 className="mt-5">Pending Answers</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Status</th>
              <th>XP</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {answers.filter(a => a.status === 'pending').map(a => (
              <motion.tr key={a._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                <td>{a.questionId?.questionText || 'N/A'}</td>
                <td>{a.content}</td>
                <td>{a.status}</td>
                <td>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      value={xpInputs[a._id] || ''}
                      onChange={(e) => setXpInputs({ ...xpInputs, [a._id]: parseInt(e.target.value) || 0 })}
                      placeholder="Enter XP"
                    />
                  </InputGroup>
                </td>
                <td>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button variant="success" onClick={() => handleVerify(a._id, 'verified')} className="me-2">
                      Verify
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button variant="danger" onClick={() => handleVerify(a._id, 'rejected')}>
                      Reject
                    </Button>
                  </motion.div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
      </motion.div>
    </Container>
  );
}

export default AdminDashboard;