import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import RefillTable from './RefillTable';
import StudentFacing from './StudentFacing.tsx';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/refill-table" element={<RefillTable />} /> 
          <Route path="/student-facing" element={<StudentFacing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
