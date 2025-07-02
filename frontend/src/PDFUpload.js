import React, { useState } from 'react';

const PDFUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('pdfs', files[i]);
    }

    try {
      const response = await fetch('http://localhost:3000/api/rag/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadStatus(`Success: ${result.message}`);
        if (onUploadSuccess) onUploadSuccess(result);
      } else {
        setUploadStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed');
    } finally {
      setUploading(false);
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  return (
    <div className="pdf-upload">
      <h3>Upload PDF Documents</h3>
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        disabled={uploading}
        style={{ marginBottom: '10px' }}
      />
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.includes('Success') ? 'success' : 'error'}`}>
          {uploadStatus}
        </div>
      )}
      {uploading && <div>Processing documents...</div>}
    </div>
  );
};

export default PDFUpload;