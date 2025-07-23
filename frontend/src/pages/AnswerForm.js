import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

function AnswerForm({ questionId, answerId, setMessage, setAlertVariant, initialContent = '', onSubmitSuccess }) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (answerId) {
        // Resubmission
        res = await axios.put(
          `http://localhost:5000/api/answers/${answerId}/resubmit`,
          { content },
          { withCredentials: true }
        );
        setMessage('Answer resubmitted successfully');
        setAlertVariant('success');
      } else {
        // New submission
        res = await axios.post(
          'http://localhost:5000/api/answers',
          { questionId, content },
          { withCredentials: true }
        );
        setMessage('Answer submitted successfully');
        setAlertVariant('success');
      }
      setContent('');
      if (onSubmitSuccess) onSubmitSuccess(res.data);
    } catch (err) {
      console.error('Error submitting answer:', err);
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
          {answerId ? 'Resubmit Answer' : 'Submit Answer'}
        </Button>
      </motion.div>
    </Form>
  );
}

export default AnswerForm;