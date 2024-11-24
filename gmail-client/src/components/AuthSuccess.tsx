import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthSuccess() {
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      await checkAuthStatus();
      navigate('/');
    };

    handleAuth();
  }, [checkAuthStatus, navigate]);

  return (
    <div className="text-center py-10">
      <h2 className="text-xl mb-4">Authentication Successful</h2>
      <p>Redirecting...</p>
    </div>
  );
}

export default AuthSuccess;
