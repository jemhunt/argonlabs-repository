import React from 'react';
import Panel from '../components/Panel';

function FeeEstimator() {
  return (
    <div>
      <header className="page-header">
        <h1>Fee Estimator</h1>
        <p>Calculate estimated legal fees based on matter type and complexity.</p>
      </header>
      <Panel
        title="Configuration"
        subtitle="Enter the parameters for the fee estimate"
      >
        <label htmlFor="matterType">Matter Type</label>
        <select id="matterType">
          <option>Conveyancing (Standard)</option>
          <option>Leasing (Commercial)</option>
        </select>
        <button>Calculate Fees</button>
      </Panel>
      <Panel title="Estimated Cost">
        <p>Your cost estimate will appear here.</p>
      </Panel>
    </div>
  );
}

export default FeeEstimator;