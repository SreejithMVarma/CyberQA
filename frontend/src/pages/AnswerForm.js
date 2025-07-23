import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

function AnswerForm({ questionId, setMessage, setAlertVariant, initialContent = '', onSubmitSuccess }) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/answers', { questionId, content }, { withCredentials: true });
      setMessage('Answer submitted successfully');
      setAlertVariant('success');
      setContent('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed');
      setAlertVariant('danger');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId={`answer-${questionId}`}>
        <Form.Label>Answer</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Enter your answer"
        />
      </Form.Group>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Button variant="primary" type="submit">
          {initialContent ? 'Resubmit Answer' : 'Submit Answer'}
        </Button>
      </motion.div>
    </Form>
  );
}

export default AnswerForm;