import React from 'react';

// 1. We receive title, subtitle, and children as props
function Panel({ title, subtitle, children }) {
  return (
    <div className="panel">
      <h2>
        <div>
          {/* 2. We display the title and subtitle props here */}
          {title}
          <small>{subtitle}</small>
        </div>
      </h2>
      {/* 3. We display whatever content was passed inside the component tags here */}
      {children}
    </div>
  );
}

export default Panel;