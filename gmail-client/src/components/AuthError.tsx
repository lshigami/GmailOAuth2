import { useNavigate } from 'react-router-dom';

function AuthError() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-10">
      <h2 className="text-xl mb-4 text-red-600">Authentication Failed</h2>
      <p className="mb-4">There was an error during authentication.</p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Return to Home
      </button>
    </div>
  );
}

export default AuthError;