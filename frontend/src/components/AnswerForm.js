import React, { useState, useRef } from "react";
import { Form, Button, Alert, Image } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "axios";

const base = process.env.REACT_APP_API_URL;

function AnswerForm({ questionId, answerId, setMessage, setAlertVariant, initialContent = "", onSubmitSuccess }) {
  const [content, setContent] = useState(initialContent);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const dropRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.border = "2px dashed #6c757d";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropRef.current.style.border = "2px solid #ced4da";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
    dropRef.current.style.border = "2px solid #ced4da";
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newImageFiles = [];
    const newImagePreviews = [];
    let hasInvalidFile = false;

    files.forEach(file => {
      if (file && file.type.startsWith("image/")) {
        newImageFiles.push(file);
        newImagePreviews.push(URL.createObjectURL(file));
      } else {
        hasInvalidFile = true;
      }
    });

    if (hasInvalidFile) {
      setMessage("Please upload only image files");
      setAlertVariant("danger");
    }

    setImageFiles(prev => [...prev, ...newImageFiles]);
    setImagePreviews(prev => [...prev, ...newImagePreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);
    formData.append("questionId", questionId);
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append("images", file);
      });
    }

    try {
      let res;
      if (answerId) {
        formData.delete("questionId");
        res = await axios.put(`${base}/api/answers/${answerId}/resubmit`, formData, { withCredentials: true });
        setMessage("Answer resubmitted successfully");
        setAlertVariant("success");
      } else {
        res = await axios.post(`${base}/api/answers/${questionId}`, formData, { withCredentials: true });
        setMessage("Answer submitted successfully");
        setAlertVariant("success");
      }
      setContent("");
      setImageFiles([]);
      setImagePreviews([]);
      if (onSubmitSuccess) onSubmitSuccess(res.data);
    } catch (err) {
      console.error("Error submitting answer:", err);
      setMessage(err.response?.data?.message || "Submission failed");
      setAlertVariant("danger");
    }
  };

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
        <Form.Label>Answer Images (Optional)</Form.Label>
        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: "2px solid #ced4da",
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "#f8f9fa",
          }}
        >
          {imageFiles.length > 0 ? (
            <p>Selected: {imageFiles.length} file(s)</p>
          ) : (
            <p>Drop images here or click to upload</p>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
            id={fileInputId}
          />
          <Form.Label
            htmlFor={fileInputId}
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            Choose Images
          </Form.Label>
        </div>
        {imagePreviews.length > 0 && (
          <div className="mt-3 d-flex flex-wrap justify-content-center">
            {imagePreviews.map((preview, index) => (
              <Image
                key={index}
                src={preview}
                alt={`Uploaded answer preview ${index + 1}`}
                thumbnail
                style={{
                  maxWidth: "100px",
                  maxHeight: "100px",
                  margin: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>
        )}
      </Form.Group>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{ display: "inline-block", transformOrigin: "center" }}
      >
        <Button variant="primary" type="submit">
          {answerId ? "Resubmit Answer" : "Submit Answer"}
        </Button>
      </motion.div>
    </Form>
  );
}

export default AnswerForm;