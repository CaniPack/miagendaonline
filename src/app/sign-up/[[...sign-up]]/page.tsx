import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mi Agenda Online
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta profesional y comienza a gestionar tus citas
          </p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          afterSignUpUrl="/"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
              card: "shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
