import React, { useState, useEffect, useCallback } from "react";
import { Container, Form, Button, ListGroup, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    difficulty: "",
    tags: "",
    solved: "unsolved",
  });
  const [message, setMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchQuestions = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        ...(filters.type && { type: filters.type }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.tags && { tags: filters.tags }),
        solved: filters.solved,
        page: currentPage,
        limit,
      }).toString();
      const base = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${base}/api/questions?${query}`, {
        withCredentials: true,
      });

      const updatedQuestions = res.data.questions.map((q) => ({
        ...q,
        images: q.images ? q.images.map(img => `${base}/${img.replace(/^\/+/, "")}`) : [],
      }));

      setQuestions(updatedQuestions);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setMessage("Failed to fetch questions");
      setAlertVariant("danger");
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuestions();
  };

  const handleToggle = (solved) => {
    setFilters({ ...filters, solved });
    setCurrentPage(1);
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
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handleToggle("unsolved")}
              className={`px-4 py-2 text-sm font-semibold border rounded-l-lg focus:outline-none transition ${
                filters.solved === "unsolved"
                  ? "bg-blue-600 text-white shadow-md border-blue-700"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Unsolved
            </button>
            <button
              onClick={() => handleToggle("solved")}
              className={`px-4 py-2 text-sm font-semibold border rounded-r-lg focus:outline-none transition ${
                filters.solved === "solved"
                  ? "bg-blue-600 text-white shadow-md border-blue-700"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Solved
            </button>
          </div>
        </div>
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
            style={{ display: "inline-block", transformOrigin: "center" }}
          >
            <Button variant="primary" type="submit" className="px-4 py-2">
              Apply Filters
            </Button>
          </motion.div>
        </Form>
        <ListGroup className="mt-5">
          {questions.map((q) => (
            <ListGroup.Item key={q._id}>
              <div className="d-flex justify-content-between">
                <div>
                  <h5>
                    <Link
                      to={`/questions/${q._id}${
                        filters.solved === "unsolved" ? "?from=unsolved" : ""
                      }`}
                    >
                      {q.questionText}
                    </Link>
                  </h5>
                  <p className="mb-0">
                    Type: {q.type} | Difficulty: {q.difficulty} | Tags:{" "}
                    {q.tags.join(", ")}
                  </p>
                </div>
                {q.images && q.images.length > 0 && (
                  <img
                    src={q.images[0]}
                    alt={`Thumbnail for ${q.questionText}`}
                    style={{
                      maxWidth: "50px",
                      height: "auto",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </motion.div>
    </Container>
  );

}

export default Questions;
