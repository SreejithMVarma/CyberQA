import React, { useState, useEffect } from 'react';
import { Container, Form, Card, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import AnswerForm from './AnswerForm';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ type: '', difficulty: '', tags: '' });
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/questions', {
          params: debouncedFilters,
          withCredentials: true
        });
        setQuestions(res.data);
        setMessage('');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to fetch questions');
        setAlertVariant('danger');
      }
    };
    fetchQuestions();
  }, [debouncedFilters]);

  return (
    <Container className="mt-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>Questions</h2>
        {message && <Alert variant={alertVariant}>{message}</Alert>}
        <Form className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All</option>
              <option value="numeric">Numeric</option>
              <option value="ciphertext">Ciphertext</option>
              <option value="code">Code</option>
              <option value="formula">Formula</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select name="difficulty" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              name="tags"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            />
          </Form.Group>
        </Form>
        {questions.map((q) => (
          <motion.div key={q._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{q.questionText}</Card.Title>
                <Card.Text>Type: {q.type}, Difficulty: {q.difficulty}, Tags: {q.tags.join(', ')}</Card.Text>
                <AnswerForm questionId={q._id} setMessage={setMessage} setAlertVariant={setAlertVariant} />
              </Card.Body>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
}

export default Questions;
