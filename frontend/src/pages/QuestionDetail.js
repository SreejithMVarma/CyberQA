import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import AnswerForm from '../components/AnswerForm';

function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/questions/${id}`, {
          withCredentials: true,
        });
        setQuestion(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load question');
        setAlertVariant('danger');
      }
    };
    fetchQuestion();
  }, [id]);

  if (!question) return <div>Loading...</div>;

  return (
    <Container className="my-5">
      {message && <Alert variant={alertVariant}>{message}</Alert>}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{question.title}</Card.Title>
          <Card.Text>{question.content}</Card.Text>
        </Card.Body>
      </Card>
      <h4>Submit Your Answer</h4>
      <AnswerForm
        questionId={id}
        setMessage={setMessage}
        setAlertVariant={setAlertVariant}
        onSubmitSuccess={() => setMessage('Answer submitted!')}
      />
    </Container>
  );
}

export default QuestionDetail;