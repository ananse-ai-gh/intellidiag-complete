'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { FaUser, FaBell, FaLock, FaPalette, FaCog, FaSave, FaEye, FaEyeSlash, FaUpload } from 'react-icons/fa';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  newCases: boolean;
  completedScans: boolean;
  systemUpdates: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  timezone: string;
  language: string;
  notifications: NotificationSettings;
}

const PageContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  min-height: 100vh;
  color: #FFFFFF;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
`;

const SaveButton = styled.button`
  background-color: #0694FB;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0578d1;
  }
`;

const SettingsContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
`;

const Sidebar = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
`;

const SidebarTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
`;

const SidebarItem = styled.div<{ active?: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${props => props.active ? 'rgba(6, 148, 251, 0.2)' : 'transparent'};
  color: ${props => props.active ? '#0694FB' : '#A0A0A0'};

  &:hover {
    background-color: ${props => props.active ? 'rgba(6, 148, 251, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Content = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background-color: #0D0D0D;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  &::placeholder {
    color: #A0A0A0;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background-color: #0D0D0D;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  &::placeholder {
    color: #A0A0A0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background-color: #0D0D0D;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  option {
    background-color: #0D0D0D;
    color: #FFFFFF;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #2A2A2A;

  &:last-child {
    border-bottom: none;
  }
`;

const ToggleLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ToggleTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
`;

const ToggleDescription = styled.div`
  font-size: 12px;
  color: #A0A0A0;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #0694FB;
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #333;
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #0694FB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 24px;
`;

const AvatarUpload = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UploadButton = styled.button`
  background-color: #0D0D0D;
  border: 1px solid #333;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0694FB;
  }
`;

const PasswordSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const PasswordInput = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #FFFFFF;
  }
`;

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    specialization: user?.specialization || '',
    bio: 'Experienced medical professional with expertise in diagnostic imaging and patient care.',
    timezone: 'UTC-5',
    language: 'English',
    notifications: {
      email: true,
      push: true,
      sms: false,
      newCases: true,
      completedScans: true,
      systemUpdates: false
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as NotificationSettings),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    console.log('Saving settings:', formData);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderProfileSection = () => (
    <>
      <SectionTitle>
        <FaUser size={16} />
        Profile Settings
      </SectionTitle>

      <AvatarSection>
        <Avatar>{getUserInitials()}</Avatar>
        <AvatarUpload>
          <UploadButton>
            <FaUpload size={12} />
            Upload Photo
          </UploadButton>
          <div style={{ fontSize: '12px', color: '#A0A0A0' }}>
            JPG, PNG or GIF. Max size 2MB.
          </div>
        </AvatarUpload>
      </AvatarSection>

      <FormGroup>
        <Label>First Name</Label>
        <Input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="Enter your first name"
        />
      </FormGroup>

      <FormGroup>
        <Label>Last Name</Label>
        <Input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Enter your last name"
        />
      </FormGroup>

      <FormGroup>
        <Label>Email Address</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter your email address"
        />
      </FormGroup>

      <FormGroup>
        <Label>Phone Number</Label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Enter your phone number"
        />
      </FormGroup>

      <FormGroup>
        <Label>Specialization</Label>
        <Input
          type="text"
          value={formData.specialization}
          onChange={(e) => handleInputChange('specialization', e.target.value)}
          placeholder="Enter your specialization"
        />
      </FormGroup>

      <FormGroup>
        <Label>Bio</Label>
        <TextArea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
        />
      </FormGroup>
    </>
  );

  const renderSecuritySection = () => (
    <>
      <SectionTitle>
        <FaLock size={16} />
        Security Settings
      </SectionTitle>

      <PasswordSection>
        <FormGroup>
          <Label>Current Password</Label>
          <PasswordInput>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter current password"
            />
            <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </PasswordToggle>
          </PasswordInput>
        </FormGroup>

        <FormGroup>
          <Label>New Password</Label>
          <PasswordInput>
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
            />
            <PasswordToggle onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </PasswordToggle>
          </PasswordInput>
        </FormGroup>
      </PasswordSection>

      <FormGroup>
        <Label>Confirm New Password</Label>
        <Input
          type="password"
          placeholder="Confirm new password"
        />
      </FormGroup>
    </>
  );

  const renderNotificationsSection = () => (
    <>
      <SectionTitle>
        <FaBell size={16} />
        Notification Settings
      </SectionTitle>

      <ToggleContainer>
        <ToggleLabel>
          <ToggleTitle>Email Notifications</ToggleTitle>
          <ToggleDescription>Receive notifications via email</ToggleDescription>
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={formData.notifications.email}
            onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>

      <ToggleContainer>
        <ToggleLabel>
          <ToggleTitle>Push Notifications</ToggleTitle>
          <ToggleDescription>Receive push notifications in browser</ToggleDescription>
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={formData.notifications.push}
            onChange={(e) => handleInputChange('notifications.push', e.target.checked)}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>

      <ToggleContainer>
        <ToggleLabel>
          <ToggleTitle>SMS Notifications</ToggleTitle>
          <ToggleDescription>Receive notifications via SMS</ToggleDescription>
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={formData.notifications.sms}
            onChange={(e) => handleInputChange('notifications.sms', e.target.checked)}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>

      <ToggleContainer>
        <ToggleLabel>
          <ToggleTitle>New Cases</ToggleTitle>
          <ToggleDescription>Notify when new cases are assigned</ToggleDescription>
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={formData.notifications.newCases}
            onChange={(e) => handleInputChange('notifications.newCases', e.target.checked)}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>

      <ToggleContainer>
        <ToggleLabel>
          <ToggleTitle>Completed Scans</ToggleTitle>
          <ToggleDescription>Notify when scans are completed</ToggleDescription>
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={formData.notifications.completedScans}
            onChange={(e) => handleInputChange('notifications.completedScans', e.target.checked)}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>

      <ToggleContainer>
        <ToggleLabel>
          <ToggleTitle>System Updates</ToggleTitle>
          <ToggleDescription>Receive system update notifications</ToggleDescription>
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={formData.notifications.systemUpdates}
            onChange={(e) => handleInputChange('notifications.systemUpdates', e.target.checked)}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>
    </>
  );

  const renderPreferencesSection = () => (
    <>
      <SectionTitle>
        <FaPalette size={16} />
        Preferences
      </SectionTitle>

      <FormGroup>
        <Label>Timezone</Label>
        <Select
          value={formData.timezone}
          onChange={(e) => handleInputChange('timezone', e.target.value)}
        >
          <option value="UTC-8">Pacific Time (UTC-8)</option>
          <option value="UTC-7">Mountain Time (UTC-7)</option>
          <option value="UTC-6">Central Time (UTC-6)</option>
          <option value="UTC-5">Eastern Time (UTC-5)</option>
          <option value="UTC+0">UTC</option>
          <option value="UTC+1">Central European Time (UTC+1)</option>
          <option value="UTC+5:30">India Standard Time (UTC+5:30)</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Language</Label>
        <Select
          value={formData.language}
          onChange={(e) => handleInputChange('language', e.target.value)}
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
        </Select>
      </FormGroup>
    </>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      case 'preferences':
        return renderPreferencesSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>Settings</PageTitle>
        <SaveButton onClick={handleSave}>
          <FaSave size={14} />
          Save Changes
        </SaveButton>
      </Header>

      <SettingsContainer>
        <Sidebar>
          <SidebarTitle>Settings</SidebarTitle>
          <SidebarItem
            active={activeSection === 'profile'}
            onClick={() => setActiveSection('profile')}
          >
            <FaUser size={14} />
            Profile
          </SidebarItem>
          <SidebarItem
            active={activeSection === 'security'}
            onClick={() => setActiveSection('security')}
          >
            <FaLock size={14} />
            Security
          </SidebarItem>
          <SidebarItem
            active={activeSection === 'notifications'}
            onClick={() => setActiveSection('notifications')}
          >
            <FaBell size={14} />
            Notifications
          </SidebarItem>
          <SidebarItem
            active={activeSection === 'preferences'}
            onClick={() => setActiveSection('preferences')}
          >
            <FaPalette size={14} />
            Preferences
          </SidebarItem>
        </Sidebar>

        <Content>
          {renderContent()}
        </Content>
      </SettingsContainer>
    </PageContainer>
  );
};

export default SettingsPage;
