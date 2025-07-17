import { useContext } from 'react';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">CyberQA</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="mx-2">Home</Nav.Link>
            {user && <Nav.Link as={Link} to="/questions" className="mx-2">Questions</Nav.Link>}
            {user && <Nav.Link as={Link} to="/profile" className="mx-2">Profile</Nav.Link>}
            {user && user.role === 'admin' && <Nav.Link as={Link} to="/admin" className="mx-2">Admin</Nav.Link>}
          </Nav>
          <Nav>
            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button variant="outline-light" onClick={logout} className="mx-2">
                  Logout
                </Button>
              </motion.div>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="mx-2">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="mx-2">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;