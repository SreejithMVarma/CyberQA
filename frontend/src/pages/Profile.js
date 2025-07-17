import React, { useContext, useEffect, useState } from 'react';
import { Container, Card, Table } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Profile() {
  const { user } = useContext(AuthContext);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/answers/user', { withCredentials: true });
        setAnswers(res.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch answers');
      }
    };
    if (user) fetchAnswers();
  }, [user]);

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4">Profile</h2>
        {user && (
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{user.username}</Card.Title>
              <Card.Text>
                <strong>Email:</strong> {user.email}<br />
                <strong>XP:</strong> {user.xp}<br />
                <strong>Wallet:</strong> ₹{user.wallet}<br />
                <strong>Role:</strong> {user.role}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
        <h3 className="mb-3">Your Answers</h3>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Status</th>
              <th>XP Earned</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((answer) => (
              <motion.tr
                key={answer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * answers.indexOf(answer) }}
              >
                <td>{answer.questionId?.questionText || 'N/A'}</td>
                <td>{answer.content}</td>
                <td>{answer.status}</td>
                <td>{answer.xpEarned}</td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
      </motion.div>
    </Container>
  );
}

export default Profile;