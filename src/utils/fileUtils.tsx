import { FaFileMedical } from 'react-icons/fa';

/**
 * Utility functions for handling DICOM files and thumbnails
 */

export interface FileInfo {
  url: string;
  name: string;
  isDicom: boolean;
  mimeType?: string;
}

/**
 * Detects if a file is a DICOM file based on URL, filename, or MIME type
 */
export const isDicomFile = (url: string, filename?: string, mimeType?: string): boolean => {
  // Check file extension
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'dcm' || ext === 'dicom') {
      return true;
    }
  }
  
  // Check URL for DICOM extensions
  if (url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.dcm') || urlLower.includes('.dicom')) {
      return true;
    }
  }
  
  // Check MIME type
  if (mimeType) {
    const mimeLower = mimeType.toLowerCase();
    if (mimeLower.includes('dicom') || mimeLower === 'application/dicom') {
      return true;
    }
  }
  
  return false;
};

/**
 * Creates a DICOM placeholder thumbnail component
 */
export const DicomThumbnail: React.FC<{
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 40, className, style }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'rgba(6, 148, 251, 0.1)',
        border: '1px solid rgba(6, 148, 251, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        ...style
      }}
    >
      <FaFileMedical 
        size={size * 0.5} 
        color="#0694fb" 
        style={{ opacity: 0.8 }}
      />
    </div>
  );
};

/**
 * Creates a thumbnail component that handles both images and DICOM files
 */
export const SmartThumbnail: React.FC<{
  url: string;
  filename?: string;
  mimeType?: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ url, filename, mimeType, alt = 'scan', size = 40, className, style }) => {
  const isDicom = isDicomFile(url, filename, mimeType);
  
  if (isDicom) {
    return <DicomThumbnail size={size} className={className} style={style} />;
  }
  
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1px solid rgba(255,255,255,0.15)',
        ...style
      }}
      onError={(e) => {
        // If image fails to load, show DICOM placeholder as fallback
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          const placeholder = document.createElement('div');
          placeholder.innerHTML = `
            <div style="
              width: ${size}px; 
              height: ${size}px; 
              border-radius: 50%; 
              background: rgba(6, 148, 251, 0.1); 
              border: 1px solid rgba(6, 148, 251, 0.3); 
              display: flex; 
              align-items: center; 
              justify-content: center;
              margin-right: 12px;
            ">
              <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="#0694fb" opacity="0.8">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
          `;
          parent.appendChild(placeholder.firstElementChild!);
        }
      }}
    />
  );
};

/**
 * Enhanced file info extractor that includes DICOM detection
 */
export const extractFileInfo = (scan: any): FileInfo => {
  const url = scan.filePath || scan.file_path || scan.imagePath || scan.image_path || '';
  const filename = scan.file_name || scan.fileName || '';
  const mimeType = scan.mime_type || scan.mimeType || '';
  
  return {
    url,
    name: filename,
    isDicom: isDicomFile(url, filename, mimeType),
    mimeType
  };
};
