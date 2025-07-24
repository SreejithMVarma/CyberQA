import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('');
  const { setUser, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData, {
        withCredentials: true,
      });
      console.log('Registration response:', res.data);
      setMessage(res.data.message);
      setAlertVariant('success');
      setUser(res.data.user);
      await refreshUser(); // Refresh user state after registration
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Error registering:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Registration failed');
      setAlertVariant('danger');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mx-auto my-5" style={{ maxWidth: '400px' }}>
        <Card.Body>
          <Card.Title>Register</Card.Title>
          {message && (
            <Alert variant={alertVariant}>
              {message}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                placeholder="Enter username"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter email"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter password"
              />
            </Form.Group>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Button variant="primary" type="submit">
                Register
              </Button>
            </motion.div>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  );
}

export default Register;