import React from 'react';
// import { signInWithGoogle } from '../../services/authService';

const SignIn: React.FC = () => {
  const handleGoogleSignIn = async () => {
    // const user = await signInWithGoogle();
    // if (user) {
    //   // redirect or store user info
    // }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 bg-white shadow rounded">
        <button 
          onClick={handleGoogleSignIn} 
          className="border px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
        {/* Similar buttons for Facebook/Twitter */}
      </div>
    </div>
  );
};

export default SignIn;
