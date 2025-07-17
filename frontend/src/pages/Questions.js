import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import AnswerForm from '../components/AnswerForm';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ type: '', difficulty: '', tags: '' });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/questions', {
          params: filters,
          withCredentials: true
        });
        setQuestions(res.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch questions');
      }
    };
    fetchQuestions();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Container className="mt-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>Questions</h2>
        <Form className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="numeric">Numeric</option>
              <option value="ciphertext">Ciphertext</option>
              <option value="code">Code</option>
              <option value="formula">Formula</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select name="difficulty" onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control name="tags" onChange={handleFilterChange} />
          </Form.Group>
        </Form>
        {questions.map((q) => (
          <motion.div key={q.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{q.questionText}</Card.Title>
                <Card.Text>Type: {q.type}, Difficulty: {q.difficulty}, Tags: {q.tags.join(', ')}</Card.Text>
                <AnswerForm questionId={q.id} />
              </Card.Body>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
}

export default Questions;