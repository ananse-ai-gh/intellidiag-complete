import React, { useState } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  min-height: 100vh;
  color: #FFFFFF;
  width: 100%;
`;

const SettingsTitle = styled.h2`
  color: #FFFFFF;
  margin-bottom: 32px;
  font-size: 28px;
  font-weight: 600;
  font-family: var(--font-primary);
`;

const SettingsSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h3`
  color: #FFFFFF;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 500;
  font-family: var(--font-primary);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  color: #FFFFFF;
  font-weight: 500;
  font-family: var(--font-primary);
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: #9c9c9c;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px 12px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239c9c9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;

  & option {
    background: #1a1a3a;
    color: #ffffff;
    padding: 8px;
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 14px 16px 14px 45px;
    font-size: 15px;
    padding-right: 40px;
  }

  @media (min-width: 769px) {
    padding: 16px 16px 16px 45px;
    font-size: 16px;
    padding-right: 40px;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #0694FB, #0094ff);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(6, 148, 251, 0.3);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ToggleSwitch = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: #FFFFFF;
  font-family: var(--font-primary);
  font-size: 14px;
`;

const ToggleInput = styled.input`
  display: none;
`;

const ToggleSlider = styled.span<{ checked: boolean }>`
  position: relative;
  width: 50px;
  height: 24px;
  background: ${props => props.checked ? '#0694fb' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  margin-right: 12px;
  transition: all 0.3s ease;
  
  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.checked ? '28px' : '2px'};
    transition: left 0.3s ease;
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
