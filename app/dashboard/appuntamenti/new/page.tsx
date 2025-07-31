'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'

interface Lead {
  id: number
  nome: string
  localita: string
  camere: number
  telefono?: string
  email?: string
  contattato: boolean
  note?: string
  status: string
}

export default function NewAppuntamentoPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [formData, setFormData] = useState({
    leadId: parseInt(searchParams.get('leadId') || '0') || 0,
    data: '',
    tipo: '',
    luogo: '',
    note: '',
    completato: false
  })

  useEffect(() => {
    if (session) {
      fetchLeads()
    }
  }, [session])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/appuntamenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          data: new Date(formData.data).toISOString()
        })
      })

      if (response.ok) {
        router.push('/dashboard/appuntamenti')
      } else {
        alert('Errore durante il salvataggio')
      }
    } catch (error) {
      console.error('Error creating appuntamento:', error)
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
               name === 'leadId' ? parseInt(value) || 0 : value
    }))
  }

  // Suggerimenti per il tipo di appuntamento
  const tipiAppuntamento = [
    'Incontro conoscitivo',
    'Sopralluogo',
    'Presentazione prospetto',
    'Firma contratto',
    'Chiamata telefonica',
    'Video chiamata',
    'Incontro follow-up',
    'Altro'
  ]

  const selectedLead = leads.find(l => l.id === formData.leadId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard/appuntamenti">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutti gli Appuntamenti
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuovo Appuntamento</h1>
                <p className="text-gray-600">Programma un nuovo appuntamento con una lead</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Selezione Lead */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead di Riferimento</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="leadId" className="block text-sm font-medium text-gray-700 mb-1">
                    Seleziona Lead *
                  </label>
                  <select
                    id="leadId"
                    name="leadId"
                    required
                    value={formData.leadId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Seleziona una lead...</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.nome} - {lead.localita} ({lead.camere} camera{lead.camere > 1 ? 'e' : ''})
                      </option>
                    ))}
                  </select>
                  
                  {selectedLead && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                      <div className="font-medium text-blue-900">{selectedLead.nome}</div>
                      <div className="text-blue-700">
                        {selectedLead.localita} • {selectedLead.camere} camera{selectedLead.camere > 1 ? 'e' : ''}
                        {selectedLead.telefono && (
                          <span> • Tel: {selectedLead.telefono}</span>
                        )}
                        {selectedLead.email && (
                          <span> • Email: {selectedLead.email}</span>
                        )}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        selectedLead.status === 'cliente_confermato' ? 'bg-green-100 text-green-800' :
                        selectedLead.status === 'cliente_attesa' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.status === 'cliente_confermato' ? 'Cliente Confermato' :
                         selectedLead.status === 'cliente_attesa' ? 'Cliente in Attesa' : 'Lead'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dettagli Appuntamento */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dettagli Appuntamento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Ora *
                  </label>
                  <input
                    type="datetime-local"
                    id="data"
                    name="data"
                    required
                    value={formData.data}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo di Appuntamento *
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    required
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleziona tipo...</option>
                    {tipiAppuntamento.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  
                  {formData.tipo === 'Altro' && (
                    <input
                      type="text"
                      placeholder="Specifica il tipo di appuntamento"
                      value={formData.tipo}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="luogo" className="block text-sm font-medium text-gray-700 mb-1">
                    Luogo
                  </label>
                  <input
                    type="text"
                    id="luogo"
                    name="luogo"
                    value={formData.luogo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. Ufficio, Casa del cliente, Video chiamata, ecc."
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Note e Dettagli
              </label>
              <textarea
                id="note"
                name="note"
                rows={4}
                value={formData.note}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Aggiungi note specifiche per questo appuntamento, agenda, documenti da portare..."
              />
            </div>

            {/* Stato */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="completato"
                  checked={formData.completato}
                  onChange={handleInputChange}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Appuntamento già completato</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Link href="/dashboard/appuntamenti">
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
                    Salva Appuntamento
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">📅 Consigli per gli appuntamenti</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Conferma sempre data e ora con la lead prima di fissare l'appuntamento</li>
            <li>• Specifica il tipo di incontro per preparare al meglio i materiali necessari</li>
            <li>• Aggiungi note specifiche per ricordare dettagli importanti discussi</li>
            <li>• Per appuntamenti importanti, considera di inviare un promemoria il giorno prima</li>
          </ul>
        </div>
      </main>
    </div>
  )
}