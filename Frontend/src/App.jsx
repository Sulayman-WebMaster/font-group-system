import { useState } from 'react'
import axios from 'axios'

function App() {
  const [response, setResponse] = useState(null)

  const handleFileChange = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles.length) return;

    const formData = new FormData();
    for (let file of selectedFiles) {
      formData.append('fonts', file);
    }

    try {
      const res = await axios.post('http://localhost:3000/upload-fonts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResponse(res.data);
      alert('Upload successful!');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Font Group</h2>
      <input
        type='file'
        multiple
        accept='.ttf'
        onChange={handleFileChange}
      />
      {response && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          <strong>Server Response:</strong> {JSON.stringify(response)}
        </div>
      )}
    </div>
  )
}

export default App
