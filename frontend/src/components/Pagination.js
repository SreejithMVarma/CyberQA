import { Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-4 space-x-2">
      {pages.map((page) => (
        <motion.div
          key={page}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Button
            variant={page === currentPage ? 'primary' : 'outline-primary'}
            onClick={() => onPageChange(page)}
            className="px-3 py-1"
          >
            {page}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export default Pagination;