import React, { useState } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`;

const SettingsTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
`;

const SettingsSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 500;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ToggleSwitch = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  display: none;
`;

const ToggleSlider = styled.span<{ checked: boolean }>`
  position: relative;
  width: 50px;
  height: 24px;
  background: ${props => props.checked ? '#007bff' : '#ccc'};
  border-radius: 12px;
  margin-right: 12px;
  transition: background 0.3s;
  
  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.checked ? '28px' : '2px'};
    transition: left 0.3s;
  }
`;

const SettingsContent: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC'
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Settings saved:', settings);
  };

  return (
    <SettingsContainer>
      <SettingsTitle>Settings</SettingsTitle>
      
      <SettingsSection>
        <SectionTitle>Notifications</SectionTitle>
        <FormGroup>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
            <ToggleSlider checked={settings.notifications} />
            Push Notifications
          </ToggleSwitch>
        </FormGroup>
        <FormGroup>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={() => handleToggle('emailAlerts')}
            />
            <ToggleSlider checked={settings.emailAlerts} />
            Email Alerts
          </ToggleSwitch>
        </FormGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Appearance</SectionTitle>
        <FormGroup>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
            <ToggleSlider checked={settings.darkMode} />
            Dark Mode
          </ToggleSwitch>
        </FormGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Preferences</SectionTitle>
        <FormGroup>
          <Label>Language</Label>
          <Select
            value={settings.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Timezone</Label>
          <Select
            value={settings.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">GMT</option>
          </Select>
        </FormGroup>
      </SettingsSection>

      <Button onClick={handleSave}>Save Settings</Button>
    </SettingsContainer>
  );
};

export default SettingsContent;
