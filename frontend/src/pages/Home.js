import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4 text-center"
      >
        Welcome to CyberQA
      </motion.h1>
      <motion.p
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-muted text-center mb-4"
        style={{ maxWidth: '600px' }}
      >
        Test your cybersecurity skills, solve challenging questions, and earn XP and rewards!
      </motion.p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Link to="/questions">
          <Button variant="primary" size="lg">
            Start Solving
          </Button>
        </Link>
      </motion.div>
    </Container>
  );
}

export default Home;