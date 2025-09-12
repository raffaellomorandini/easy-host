'use client'

import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EasyHost</h1>
              <p className="text-gray-600 text-sm">CRM System</p>
            </div>
          </div>

          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </motion.div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Accesso Negato
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              La tua email non è autorizzata ad accedere a questo sistema. 
              Contatta l&apos;amministratore per richiedere l&apos;accesso.
            </p>
          </div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6 max-w-md mx-auto bg-red-50 border-red-200"
          >
            <h3 className="font-semibold text-red-900 mb-2">Cosa fare?</h3>
            <ul className="text-sm text-red-800 space-y-1 text-left">
              <li>• Verifica di aver effettuato l&apos;accesso con l&apos;email corretta</li>
              <li>• Contatta l&apos;amministratore del sistema</li>
              <li>• Riprova con un account autorizzato</li>
            </ul>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/signin">
              <Button className="btn-primary flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Torna al Login
              </Button>
            </Link>
            <Button className="btn-secondary" onClick={() => window.location.href = 'mailto:admin@example.com'}>
              Contatta Amministratore
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}