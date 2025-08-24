import { useState, useEffect, useRef } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const base = process.env.REACT_APP_API_URL;

function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    questionText: "",
    type: "numeric",
    cipherType: "",
    difficulty: "easy",
    tags: "",
    expectedAnswer: "",
    testCases: [],
    source: "",
    image: "",
  });
  const [message, setMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(
          `${base}/api/questions/${id}`,
          {
            withCredentials: true,
          }
        );
        setQuestion({
          questionText: res.data.questionText,
          type: res.data.type,
          cipherType: res.data.cipherType || "",
          difficulty: res.data.difficulty,
          tags: res.data.tags.join(","),
          expectedAnswer: res.data.expectedAnswer || "",
          testCases: res.data.testCases || [],
          source: res.data.source || "",
          image: res.data.image || "",
        });
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load question");
        setAlertVariant("danger");
      }
    };
    fetchQuestion();
  }, [id]);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.border = "2px dashed var(--secondary)";
  };

  const handleDragLeave = () => {
    dropRef.current.style.border = "1px solid var(--border)";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setImageFile(e.dataTransfer.files[0]);
    dropRef.current.style.border = "1px solid var(--border)";
  };

  const handleImageSubmit = async () => {
    try {
      if (!imageFile) {
        setMessage("Please select an image");
        setAlertVariant("danger");
        return;
      }
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await axios.post(`${base}/api/questions/upload-image`,
        formData,
        {
          withCredentials: true,
        }
      );
      const fullImageUrl = `${base}${res.data.imageUrl}`;
      setQuestion({ ...question, image: fullImageUrl });
      setImageFile(null);
      setMessage("Image uploaded successfully");
      setAlertVariant("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Image upload failed");
      setAlertVariant("danger");
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${base}/api/questions/${id}`, question, {
        withCredentials: true,
      });
      setMessage("Question updated successfully");
      setAlertVariant("success");
      navigate("/admin");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update question");
      setAlertVariant("danger");
    }
  };

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Edit Question</h2>
        {message && <Alert variant={alertVariant}>{message}</Alert>}
        <Form onSubmit={handleQuestionSubmit}>
          <Form.Group className="mb-3" controlId="questionText">
            <Form.Label>Question Text</Form.Label>
            <Form.Control
              as="textarea"
              value={question.questionText}
              onChange={(e) =>
                setQuestion({ ...question, questionText: e.target.value })
              }
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={question.type}
              onChange={(e) =>
                setQuestion({ ...question, type: e.target.value })
              }
            >
              <option value="numeric">Numeric</option>
              <option value="ciphertext">Ciphertext</option>
              <option value="code">Code</option>
              <option value="formula">Formula</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="cipherType">
            <Form.Label>Cipher Type (Optional)</Form.Label>
            <Form.Control
              type="text"
              value={question.cipherType}
              onChange={(e) =>
                setQuestion({ ...question, cipherType: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="difficulty">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select
              value={question.difficulty}
              onChange={(e) =>
                setQuestion({ ...question, difficulty: e.target.value })
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="tags">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              value={question.tags}
              onChange={(e) =>
                setQuestion({ ...question, tags: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="expectedAnswer">
            <Form.Label>Expected Answer (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              value={question.expectedAnswer}
              onChange={(e) =>
                setQuestion({ ...question, expectedAnswer: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="testCases">
            <Form.Label>Test Cases (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              value={JSON.stringify(question.testCases)}
              onChange={(e) => {
                try {
                  setQuestion({
                    ...question,
                    testCases: JSON.parse(e.target.value) || [],
                  });
                } catch {
                  setMessage("Invalid test cases format");
                  setAlertVariant("danger");
                }
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="source">
            <Form.Label>Source (Optional)</Form.Label>
            <Form.Control
              type="text"
              value={question.source}
              onChange={(e) =>
                setQuestion({ ...question, source: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Question Image (Optional)</Form.Label>
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: "1px solid var(--border)",
                padding: "1rem",
                borderRadius: "6px",
              }}
            >
              <Form.Control
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                onChange={(e) => setImageFile(e.target.files[0])}
                aria-label="Upload or capture question image"
              />
              <p className="text-muted">
                Drag and drop or click to upload/capture image (JPEG/PNG only)
              </p>
            </div>
            {imageFile && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button onClick={handleImageSubmit} className="mt-2">
                  Upload Image
                </Button>
              </motion.div>
            )}
            {question.image && (
              <div className="mt-2">
                <img
                  src={question.image}
                  alt="Preview of uploaded question"
                  style={{
                    maxWidth: "200px",
                    height: "auto",
                    borderRadius: "6px",
                  }}
                />
              </div>
            )}
          </Form.Group>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ display: "inline-block", transformOrigin: "center" }}
          >
            <Button variant="primary" type="submit" className="me-2">
              Update Question
            </Button>
            <Button variant="secondary" onClick={() => navigate("/admin")}>
              Cancel
            </Button>
          </motion.div>
        </Form>
      </motion.div>
    </Container>
  );
}

export default EditQuestion;
