import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container className="mt-5 text-center">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to CyberQA
      </motion.h1>
      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Link to="/questions">
          <Button variant="primary">Browse Questions</Button>
        </Link>
      </motion.div>
    </Container>
  );
}

export default Home;