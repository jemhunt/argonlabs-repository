import React from 'react';
import Panel from '../components/Panel';

function Settings() {
  return (
    <div>
      <header className="page-header">
        <h1>Team & Settings</h1>
        <p>Manage your user profile, team members, and notification preferences.</p>
      </header>
      <Panel title="User Profile">
        <label htmlFor="userName">Full Name</label>
        <input type="text" id="userName" defaultValue="Jane Doe" />
      </Panel>
      <Panel title="Notification Preferences">
        <p>Notification options will go here.</p>
      </Panel>
      <button>Save Changes</button>
    </div>
  );
}

export default Settings;