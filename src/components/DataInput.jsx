import { useState } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';

function DataInput({ onSubmit }) {
  const [source, setSource] = useState('file'); // 'file', 'database', 'api', 'text'
  const [file, setFile] = useState(null);
  const [dbConfig, setDbConfig] = useState({ url: '', query: '' });
  const [apiConfig, setApiConfig] = useState({ endpoint: '', params: '' });
  const [text, setText] = useState('');

  const handleFileDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const handleSubmit = async () => {
    let data;
    if (source === 'file' && file) {
      const formData = new FormData();
      formData.append('file', file);
      // Send to backend (replace with your backend URL)
      const response = await axios.post('http://localhost:8000/analyze/file', formData);
      data = response.data;
    } else if (source === 'text') {
      // Similar for text, db, api – implement API calls
      data = { /* Mock data */ sentiments: { positive: 60, negative: 20, neutral: 20 } };
    }
    onSubmit(data);
  };

  return (
    <div className="data-input">
      <h2>Select Data Source</h2>
      <select value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="file">File Upload</option>
        <option value="database">Database</option>
        <option value="api">External API (e.g., Tweets)</option>
        <option value="text">Custom Text</option>
      </select>

      {source === 'file' && (
        <Dropzone onDrop={handleFileDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} style={{ border: '1px dashed #ccc', padding: '20px' }}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop file here, or click to select (CSV, Excel, Text)</p>
            </div>
          )}
        </Dropzone>
      )}

      {source === 'text' && (
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text for analysis" />
      )}

      {/* Add inputs for db and api similarly */}

      <button onClick={handleSubmit}>Analyze</button>
    </div>
  );
}

export default DataInput;