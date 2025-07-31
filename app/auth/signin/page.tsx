'use client'

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accedi al Gestionale Leads
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Solo utenti autorizzati possono accedere
          </p>
        </div>
        <div>
          <Button 
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Accedi con Google
          </Button>
        </div>
      </div>
    </div>
  )
}