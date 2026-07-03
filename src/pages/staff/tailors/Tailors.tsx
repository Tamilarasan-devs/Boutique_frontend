import React from 'react';
import Employees from '../employees/Employees';

// Tailors are employees with role=Tailor.
// This page renders the unified Employees component (same view, same data).
const Tailors: React.FC = () => {
  return <Employees />;
};

export default Tailors;
