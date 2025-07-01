import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mi Agenda Online</h1>
          <p className="text-gray-600">Crea tu cuenta profesional</p>
        </div>
        <SignUp 
          routing="path" 
          path="/sign-up"
          redirectUrl="/"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
} 