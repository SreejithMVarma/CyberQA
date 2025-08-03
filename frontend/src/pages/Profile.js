import React, { useContext, useEffect, useState } from 'react';
import { Container, Card, Table, Alert, Badge, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AnswerForm from '../components/AnswerForm';

function Profile() {
  const { user } = useContext(AuthContext);
  const [answers, setAnswers] = useState([]);
  const [resubmitAnswerId, setResubmitAnswerId] = useState(null);

  const fetchAnswers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/answers/user', { withCredentials: true });
      setAnswers(res.data);
    } catch (err) {
      console.error('Error fetching answers:', err);
      alert(err.response?.data?.message || 'Failed to fetch answers');
    }
  };

  useEffect(() => {
    if (user) fetchAnswers();
  }, [user]);

  const handleResubmit = (answerId) => {
    setResubmitAnswerId(answerId);
  };

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
        {answers.some((a) => a.status === 'rejected' && a.adminComments) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="warning">
              <Badge bg="warning" text="dark" className="me-2">
                Action Required
              </Badge>
              You have answers with suggested changes. Review and resubmit below.
            </Alert>
          </motion.div>
        )}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Status</th>
              <th>XP Earned</th>
              <th>Admin Comments</th>
              <th>Action</th>
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
                <td>{answer.adminComments || 'None'}</td>
                <td>
                  {answer.status === 'rejected' && answer.adminComments && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResubmit(answer._id)}
                      >
                        Resubmit
                      </Button>
                    </motion.div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
        {resubmitAnswerId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mt-4">
              <Card.Body>
                <Card.Title>Resubmit Answer</Card.Title>
                <AnswerForm
                  questionId={answers.find((a) => a._id === resubmitAnswerId)?.questionId?._id}
                  answerId={resubmitAnswerId}
                  setMessage={(msg) => alert(msg)}
                  setAlertVariant={(variant) => console.log(variant)}
                  initialContent={answers.find((a) => a._id === resubmitAnswerId)?.content}
                  onSubmitSuccess={() => {
                    fetchAnswers(); // Refresh answers from server
                    setResubmitAnswerId(null);
                  }}
                />
              </Card.Body>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
}

export default Profile;