'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'

export default function NewLeadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    localita: '',
    camere: 1,
    telefono: '',
    email: '',
    contattato: false,
    note: '',
    status: 'lead'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/dashboard/leads')
      } else {
        alert('Errore durante il salvataggio')
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      alert('Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'camere' ? parseInt(value) || 1 : value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard/leads">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutte le Leads
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuova Lead</h1>
                <p className="text-gray-600">Aggiungi una nuova lead al sistema</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informazioni Base */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. Mario Rossi"
                  />
                </div>

                <div>
                  <label htmlFor="localita" className="block text-sm font-medium text-gray-700 mb-1">
                    Località *
                  </label>
                  <input
                    type="text"
                    id="localita"
                    name="localita"
                    required
                    value={formData.localita}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. Milano, Roma, Napoli"
                  />
                </div>

                <div>
                  <label htmlFor="camere" className="block text-sm font-medium text-gray-700 mb-1">
                    Numero Camere *
                  </label>
                  <select
                    id="camere"
                    name="camere"
                    value={formData.camere}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 camera</option>
                    <option value={2}>2 camere</option>
                    <option value={3}>3 camere</option>
                    <option value={4}>4 camere</option>
                    <option value={5}>5+ camere</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Stato Iniziale
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="foto">Foto</option>
                    <option value="appuntamento">Appuntamento</option>
                    <option value="ghost">Ghost</option>
                    <option value="ricontattare">Ricontattare</option>
                    <option value="cliente_attesa">Cliente in Attesa</option>
                    <option value="cliente_confermato">Cliente Confermato</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contatti */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni di Contatto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Numero di Telefono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. 3333333333"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. mario.rossi@email.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="contattato"
                    checked={formData.contattato}
                    onChange={handleInputChange}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">È già stato contattato</span>
                </label>
              </div>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                id="note"
                name="note"
                rows={6}
                value={formData.note}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Aggiungi note, dettagli della conversazione, preferenze specifiche..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Link href="/dashboard/leads">
                <Button type="button" variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Annulla
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salva Lead
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Consigli per l'inserimento</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Inserisci sempre il nome completo per una migliore identificazione</li>
            <li>• La località dovrebbe includere città e eventualmente zona/quartiere</li>
            <li>• Nelle note puoi inserire dettagli su esigenze specifiche, budget, tempistiche</li>
            <li>• Marca come "contattato" se hai già avuto un primo contatto</li>
          </ul>
        </div>
      </main>
    </div>
  )
}