import React from 'react';
import { motion } from 'framer-motion';
import './PageContainer.css';

const PageContainer = ({ children, title }) => {
  return (
    <motion.div
      className="page-container animate-fade-in"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {title && <h1 className="page-title text-heading">{title}</h1>}
      <div className="page-content">
        {children}
      </div>
    </motion.div>
  );
};

export default PageContainer;
