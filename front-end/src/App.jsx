import { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  const request = async (endpoint) => {
    setMsg('requesting');
    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      setMsg(data.message || data.error);
    } catch (err) {
      setMsg('Cant access backend');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>DB Test Page</h1>
      
      <input placeholder="Name (Register only)" onChange={e => setName(e.target.value)} /><br/><br/>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br/><br/>
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br/><br/>
      
      <button onClick={() => request('register')}>Register New User</button>
      <button onClick={() => request('login')} style={{ marginLeft: '10px' }}>Login</button>

      <div style={{ marginTop: '20px', color: 'blue' }}>
        <strong>Server Response:</strong> {msg}
      </div>
    </div>
  );
}

export default App;