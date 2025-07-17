import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

function AnswerForm({ questionId, setMessage, setAlertVariant }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/answers', { questionId, content }, { withCredentials: true });
      setMessage('Answer submitted successfully');
      setAlertVariant('success'); // ✅ green
      setContent('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed');
      setAlertVariant('danger'); // ❌ red
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Answer</Form.Label>
        <Form.Control
          as="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </Form.Group>
      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Button variant="primary" type="submit">
          Submit Answer
        </Button>
      </motion.div>
    </Form>
  );
}

export default AnswerForm;
