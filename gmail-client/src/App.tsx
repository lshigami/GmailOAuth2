import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmailForm from './components/EmailForm';
import AuthSuccess from './components/AuthSuccess';
import AuthError from './components/AuthError';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-4xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<EmailForm />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/auth-error" element={<AuthError />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;