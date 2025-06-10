import React, { useState } from 'react'; // 1. Import useState
import Panel from '../components/Panel';

function AnalysisTool() {
  // 2. Create state to hold the uploaded file object. It starts as null.
  const [file, setFile] = useState(null);

  // This is the function we will call when a file is selected.
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  // This is the function to remove the file.
  const handleFileRemove = () => {
    setFile(null);
  };

  return (
    <div>
      <header className="page-header">
        <h1>A.I. Document Analysis</h1>
        <p>An intelligent workspace to review, analyze, and understand legal documents.</p>
      </header>

      <Panel
        title="Step 1: Upload a Document"
        subtitle="Begin by selecting a file for analysis"
      >
        {/* We will replace this with a dedicated component soon */}
        <div className="file-drop-area">
          <input type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />
          {/* 3. CONDITIONAL RENDERING: Show different UI based on state */}
          {!file ? (
            <div id="initial-prompt">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" /></svg>
              <p><strong>Drag & Drop Your File Here</strong></p>
              <p style={{fontSize: '0.9em', color: 'var(--argon-text-secondary)'}}>or click to browse</p>
            </div>
          ) : (
            <div id="file-preview" style={{display: 'flex'}}>
              <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              <div className="file-details">
                <div id="fileName" className="file-name">{file.name}</div>
                <div id="fileSize" className="file-size">{ (file.size / 1024).toFixed(1) } KB</div>
              </div>
              <button id="removeFileBtn" title="Remove file" onClick={handleFileRemove}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>
      </Panel>
      
      {/* We will conditionally show this panel later */}
      <Panel
        title="Step 2: Configure Analysis"
        subtitle="Select an A.I. model tailored for your document type"
      >
        <div>
          <label htmlFor="analysisModel">Select Analysis Model</label>
          <select id="analysisModel">
            <option value="contract_review_v1.2">Contract Review Model (v1.2)</option>
            <option value="discovery_summary_v0.9">Discovery Summary Model (v0.9-beta)</option>
            <option value="compliance_check_v2.0">Compliance Check Model (v2.0)</option>
          </select>
        </div>
      </Panel>
      
      <Panel>
        {/* 4. The button's disabled status now depends on the file state */}
        <button id="runAnalysisBtn" disabled={!file}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L4.047 3.339 8 7.293l3.953-3.954L9.05.435ZM3.339 4.047 7.293 8 4.047 11.953 1.144 9.05c-.58-.58-.58-1.52 0-2.1l2.195-2.195Z"/><path d="M11.953 4.047 8 7.293l3.953 3.954 2.903-2.903c.58-.58.58-1.52 0-2.1L11.953 4.047Zm-3.954 8.242L8 8.001 4.047 11.954 7.001 15c.58.58 1.519.58 2.099 0l2.904-2.904Z"/></svg>
          Run Analysis
        </button>
      </Panel>
    </div>
  );
}

export default AnalysisTool;