import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "axios";
import AnswerForm from "../components/AnswerForm";

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    difficulty: "",
    tags: "",
  });
  const [message, setMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      const query = new URLSearchParams({
        ...(filters.type && { type: filters.type }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.tags && { tags: filters.tags }),
      }).toString();
      const res = await axios.get(
        `http://localhost:5000/api/questions?${query}`,
        {
          withCredentials: true,
        }
      );
      // Prepend base URL to image paths
      const updatedQuestions = res.data.map((q) => ({
        ...q,
        image: q.image || "",
      }));

      setQuestions(updatedQuestions);
    } catch (err) {
      setMessage("Failed to fetch questions");
      setAlertVariant("danger");
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Questions</h2>
        {message && <Alert variant={alertVariant}>{message}</Alert>}
        <Form onSubmit={handleFilterSubmit}>
          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All</option>
              <option value="numeric">Numeric</option>
              <option value="ciphertext">Ciphertext</option>
              <option value="code">Code</option>
              <option value="formula">Formula</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="difficulty">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
            >
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="tags">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            />
          </Form.Group>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Button variant="primary" type="submit">
              Apply Filters
            </Button>
          </motion.div>
        </Form>
        <div className="mt-5">
          {questions.map((q) => (
            <Card key={q._id} className="mb-3">
              <Card.Body>
                <Card.Title>{q.questionText}</Card.Title>
                {q.image && (
                  <img
                    src={q.image}
                    alt={`Visual for question: ${q.questionText}`}
                    className="img-fluid mb-3"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "6px",
                    }}
                  />
                )}
                <Card.Text>Type: {q.type}</Card.Text>
                <Card.Text>Difficulty: {q.difficulty}</Card.Text>
                <Card.Text>Tags: {q.tags.join(", ")}</Card.Text>
                <AnswerForm
                  questionId={q._id}
                  setMessage={setMessage}
                  setAlertVariant={setAlertVariant}
                  onSubmitSuccess={fetchQuestions}
                />
              </Card.Body>
            </Card>
          ))}
        </div>
      </motion.div>
    </Container>
  );
}

export default Questions;
