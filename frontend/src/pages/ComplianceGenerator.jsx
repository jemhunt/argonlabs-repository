import React from 'react';
import Panel from '../components/Panel';

function ComplianceGenerator() {
  return (
    <div>
      <header className="page-header">
        <h1>Compliance Checklist Generator</h1>
        <p>Create a tailored compliance checklist for your legal matter.</p>
      </header>
      <Panel
        title="Select Compliance Areas"
        subtitle="Choose the relevant legal frameworks"
      >
        <label><input type="checkbox" /> Australian Consumer Law</label>
        <label><input type="checkbox" /> Privacy Act 1988 (Cth)</label>
        <button>Generate Checklist</button>
      </Panel>
      <Panel title="Generated Checklist">
        <p>Your generated checklist will appear here.</p>
      </Panel>
    </div>
  );
}

export default ComplianceGenerator;