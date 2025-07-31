export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accesso Negato
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            La tua email non è autorizzata ad accedere a questo sistema.
          </p>
          <div className="mt-4 text-center">
            <a 
              href="/auth/signin" 
              className="text-indigo-600 hover:text-indigo-500"
            >
              Torna al login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}