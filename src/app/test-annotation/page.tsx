'use client'

import React, { useState } from 'react'
import AnnotationCanvas from '@/components/AnnotationCanvas'
import styled from 'styled-components'
import { FaEye, FaEyeSlash, FaDownload, FaUpload, FaUndo, FaRedo, FaTrash } from 'react-icons/fa'

const TestPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0a0a0a;
  color: white;
`

const Header = styled.div`
  background: #1a1a1a;
  padding: 16px;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #0694fb;
`

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => 
    props.$variant === 'primary' ? '#0694fb' :
    props.$variant === 'danger' ? '#dc3545' :
    'rgba(255, 255, 255, 0.1)'
  };
  border: 1px solid ${props => 
    props.$variant === 'primary' ? '#0694fb' :
    props.$variant === 'danger' ? '#dc3545' :
    'rgba(255, 255, 255, 0.2)'
  };
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => 
      props.$variant === 'primary' ? '#0582d9' :
      props.$variant === 'danger' ? '#c82333' :
      'rgba(255, 255, 255, 0.2)'
    };
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const Sidebar = styled.div`
  width: 300px;
  background: #1a1a1a;
  border-right: 1px solid #2a2a2a;
  padding: 16px;
  overflow-y: auto;
`

const SidebarSection = styled.div`
  margin-bottom: 24px;
`

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #0694fb;
`

const ColorPicker = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const ColorButton = styled.button<{ $color: string; $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.$color};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`

const PresetLabels = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const PresetButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$active ? 'rgba(6, 148, 251, 0.2)' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#8aa'};
  border: 1px solid ${props => props.$active ? 'rgba(6, 148, 251, 0.6)' : 'rgba(255, 255, 255, 0.15)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'rgba(6, 148, 251, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
    color: white;
  }
`

const AnnotationList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`

const AnnotationItem = styled.div<{ $selected?: boolean }>`
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  background: ${props => props.$selected ? 'rgba(6, 148, 251, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$selected ? 'rgba(6, 148, 251, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$selected ? 'rgba(6, 148, 251, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`

const AnnotationInfo = styled.div`
  font-size: 12px;
  color: #8aa;
`

const AnnotationCanvasContainer = styled.div`
  flex: 1;
  position: relative;
`

const TestImageSelector = styled.div`
  margin-bottom: 16px;
`

const ImageButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: ${props => props.$active ? 'rgba(6, 148, 251, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  border: 1px solid ${props => props.$active ? 'rgba(6, 148, 251, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  cursor: pointer;
  text-align: left;
  font-size: 12px;

  &:hover {
    background: ${props => props.$active ? 'rgba(6, 148, 251, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`

const TestAnnotationPage = () => {
  const [annotations, setAnnotations] = useState<any[]>([])
  const [selectedColor, setSelectedColor] = useState('#0694fb')
  const [selectedPreset, setSelectedPreset] = useState('Lesion')
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [readOnly, setReadOnly] = useState(false)
  const [currentImage, setCurrentImage] = useState('chest-xray')

  // Test images
  const testImages = {
    'chest-xray': '/test_chest_xray.jpg',
    'placeholder': '/placeholder-image.jpg',
    'ct-mri': '/ct-mri.png',
    'sample-1': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    'sample-2': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop'
  }

  const colors = ['#0694fb', '#4CAF50', '#FFC107', '#F44336', '#9C27B0', '#00BCD4', '#FF5722', '#795548']
  const presets = ['Lesion', 'Nodule', 'Mass', 'Edema', 'Calcification', 'Fracture', 'Normal', 'Abnormal']

  const handleAnnotationsChange = (newAnnotations: any[]) => {
    setAnnotations(newAnnotations)
  }

  const handleExport = () => {
    const data = {
      image: currentImage,
      annotations: annotations,
      metadata: {
        createdAt: new Date().toISOString(),
        totalAnnotations: annotations.length,
        colors: Array.from(new Set(annotations.map(a => a.color))),
        presets: Array.from(new Set(annotations.map(a => a.label)))
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `test-annotations-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.annotations) {
              setAnnotations(data.annotations)
            }
          } catch (error) {
            console.error('Error importing annotations:', error)
            alert('Error importing annotations. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations([])
      setSelectedAnnotation(null)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedAnnotation) {
      setAnnotations(prev => prev.filter(a => a.id !== selectedAnnotation))
      setSelectedAnnotation(null)
    }
  }

  return (
    <TestPageContainer>
      <Header>
        <Title>Annotation Tools Test Page</Title>
        <Controls>
          <ControlButton
            onClick={() => setReadOnly(!readOnly)}
            title={readOnly ? 'Enable Editing' : 'Disable Editing'}
          >
            {readOnly ? <FaEyeSlash /> : <FaEye />}
            {readOnly ? 'Read Only' : 'Editing'}
          </ControlButton>
          <ControlButton onClick={handleImport}>
            <FaUpload />
            Import
          </ControlButton>
          <ControlButton onClick={handleExport} disabled={annotations.length === 0}>
            <FaDownload />
            Export
          </ControlButton>
          <ControlButton onClick={handleClearAll} $variant="danger" disabled={annotations.length === 0}>
            <FaTrash />
            Clear All
          </ControlButton>
        </Controls>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarSection>
            <SectionTitle>Test Images</SectionTitle>
            <TestImageSelector>
              {Object.entries(testImages).map(([key, url]) => (
                <ImageButton
                  key={key}
                  $active={currentImage === key}
                  onClick={() => setCurrentImage(key)}
                >
                  {key === 'ct-mri' ? 'MRI Brain' : key.replace('-', ' ').toUpperCase()}
                </ImageButton>
              ))}
            </TestImageSelector>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Annotation Color</SectionTitle>
            <ColorPicker>
              {colors.map(color => (
                <ColorButton
                  key={color}
                  $color={color}
                  $active={selectedColor === color}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </ColorPicker>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Label Presets</SectionTitle>
            <PresetLabels>
              {presets.map(preset => (
                <PresetButton
                  key={preset}
                  $active={selectedPreset === preset}
                  onClick={() => setSelectedPreset(preset)}
                >
                  {preset}
                </PresetButton>
              ))}
            </PresetLabels>
            
            {/* Custom Label Input */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#8aa', marginBottom: 4, fontWeight: 500 }}>Custom Label</div>
              <input
                type="text"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                placeholder="Enter custom label..."
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Annotations ({annotations.length})</SectionTitle>
            <AnnotationList>
              {annotations.map(annotation => (
                <AnnotationItem
                  key={annotation.id}
                  $selected={selectedAnnotation === annotation.id}
                  onClick={() => setSelectedAnnotation(annotation.id)}
                >
                  <div style={{ color: annotation.color, fontWeight: 'bold' }}>
                    {annotation.label}
                  </div>
                  <AnnotationInfo>
                    {annotation.type} • {new Date(annotation.createdAt).toLocaleTimeString()}
                    {annotation.metadata?.measurements && (
                      <div>
                        {annotation.metadata.measurements.length && `Length: ${annotation.metadata.measurements.length.toFixed(1)}px`}
                        {annotation.metadata.measurements.area && ` • Area: ${annotation.metadata.measurements.area.toFixed(1)}px²`}
                        {annotation.metadata.measurements.angle && ` • Angle: ${annotation.metadata.measurements.angle.toFixed(1)}°`}
                      </div>
                    )}
                  </AnnotationInfo>
                </AnnotationItem>
              ))}
            </AnnotationList>
            {selectedAnnotation && (
              <ControlButton onClick={handleDeleteSelected} $variant="danger" style={{ marginTop: 8 }}>
                <FaTrash />
                Delete Selected
              </ControlButton>
            )}
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Enhanced Features</SectionTitle>
            <div style={{ fontSize: 12, color: '#8aa', lineHeight: 1.6 }}>
              <div><strong>Visual Feedback:</strong></div>
              <div>• Drawing progress indicators</div>
              <div>• Real-time validation</div>
              <div>• Measurement units (px/mm)</div>
              <div>• Tooltips and hover effects</div>
              <br />
              <div><strong>Validation Rules:</strong></div>
              <div>• Size constraints</div>
              <div>• Boundary checking</div>
              <div>• Point count limits</div>
              <div>• Error/warning indicators</div>
            </div>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Keyboard Shortcuts</SectionTitle>
            <div style={{ fontSize: 12, color: '#8aa', lineHeight: 1.6 }}>
              <div><strong>Tools:</strong></div>
              <div>V - Select/Move</div>
              <div>R - Rectangle</div>
              <div>C - Circle</div>
              <div>E - Ellipse</div>
              <div>P - Polygon</div>
              <div>O - Point</div>
              <div>L - Line</div>
              <div>A - Arrow</div>
              <div>T - Text</div>
              <div>F - Freehand</div>
              <div>M - Measure Line</div>
              <div>Alt+M - Measure Circle</div>
              <div>Shift+M - Measure Freehand</div>
              <br />
              <div><strong>Actions:</strong></div>
              <div>Ctrl+Z - Undo</div>
              <div>Ctrl+Y - Redo</div>
              <div>Ctrl+S - Export</div>
              <div>Delete - Remove selected</div>
              <div>Esc - Cancel polygon</div>
              <div>Enter - Complete polygon</div>
            </div>
          </SidebarSection>
        </Sidebar>

        <AnnotationCanvasContainer>
          <AnnotationCanvas
            imageUrl={testImages[currentImage as keyof typeof testImages]}
            readOnly={readOnly}
            onAnnotationsChange={handleAnnotationsChange}
            initialAnnotations={annotations}
            selectedPreset={selectedPreset}
            selectedColor={selectedColor}
            pixelSpacing={0.1} // 0.1 mm per pixel for medical imaging
          />
        </AnnotationCanvasContainer>
      </MainContent>
    </TestPageContainer>
  )
}

export default TestAnnotationPage
