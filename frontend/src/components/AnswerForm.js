import React, { useState, useRef } from 'react';
import { Form, Button, Alert, Image } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

function AnswerForm({ questionId, answerId, setMessage, setAlertVariant, initialContent = '', onSubmitSuccess }) {
  const [content, setContent] = useState(initialContent);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const dropRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.border = '2px dashed #6c757d';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropRef.current.style.border = '2px solid #ced4da';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      dropRef.current.style.border = '2px solid #ced4da';
    } else {
      setMessage('Please upload an image file');
      setAlertVariant('danger');
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setMessage('Please upload an image file');
      setAlertVariant('danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting answer for questionId:', questionId); // Debug
    const formData = new FormData();
    formData.append('content', content);
    formData.append('questionId', questionId);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let res;
      if (answerId) {
        // Resubmission
        formData.delete('questionId');
        res = await axios.put(
          `http://localhost:5000/api/answers/${answerId}/resubmit`,
          formData,
          { withCredentials: true }
        );
        setMessage('Answer resubmitted successfully');
        setAlertVariant('success');
      } else {
        // New submission
        res = await axios.post(
          'http://localhost:5000/api/answers',
          formData,
          { withCredentials: true }
        );
        setMessage('Answer submitted successfully');
        setAlertVariant('success');
      }
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      if (onSubmitSuccess) onSubmitSuccess(res.data);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setMessage(err.response?.data?.message || 'Submission failed');
      setAlertVariant('danger');
    }
  };

  // Unique ID for file input
  const fileInputId = `imageUpload-${questionId}`;

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
      <Form.Group className="mb-3">
        <Form.Label>Answer Image (Optional)</Form.Label>
        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: '2px solid #ced4da',
            borderRadius: '6px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f8f9fa',
          }}
        >
          {imageFile ? (
            <p>Selected: {imageFile.name}</p>
          ) : (
            <p>Drop image here or click to upload</p>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            style={{ display: 'none' }}
            id={fileInputId}
          />
          <Form.Label htmlFor={fileInputId} style={{ cursor: 'pointer', color: '#007bff' }}>
            Choose Image
          </Form.Label>
        </div>
        {imagePreview && (
          <div className="mt-3" style={{ textAlign: 'center' }}>
            <Image
              src={imagePreview}
              alt="Uploaded answer preview"
              thumbnail
              style={{
                maxWidth: '150px',
                maxHeight: '150px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
          </div>
        )}
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