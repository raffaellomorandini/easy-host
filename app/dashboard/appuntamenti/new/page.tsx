'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { LeadCombobox } from '@/components/ui/lead-combobox'
import Link from 'next/link'
import { ArrowLeft, Save, X, Search, Calendar, User, MapPin } from 'lucide-react'

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

function NewAppuntamentoForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [searchedLeads, setSearchedLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState({
    leadId: parseInt(searchParams.get('leadId') || '0') || 0,
    data: undefined as Date | undefined,
    tipo: '',
    luogo: '',
    note: '',
    completato: false
  })

  // Se c'è un leadId preselezionato (da URL), carica quella lead specifica
  useEffect(() => {
    if (session && formData.leadId > 0) {
      fetchSelectedLead(formData.leadId)
    }
  }, [session, formData.leadId])

  // Effettua la ricerca quando cambia il termine di ricerca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchedLeads([])
      return
    }

    const timeoutId = setTimeout(() => {
      searchLeads(searchTerm)
    }, 300) // Debounce di 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchSelectedLead = async (leadId: number) => {
    try {
      const response = await fetch(`/api/leads?id=${leadId}`)
      if (response.ok) {
        const lead = await response.json()
        setSelectedLead(lead)
      }
    } catch (error) {
      console.error('Error fetching selected lead:', error)
    }
  }

  const searchLeads = async (search: string) => {
    if (!search.trim()) {
      setSearchedLeads([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/leads?search=${encodeURIComponent(search)}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setSearchedLeads(data.leads)
      }
    } catch (error) {
      console.error('Error searching leads:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    // Validazione lato client
    if (!formData.leadId || formData.leadId <= 0) {
      alert('Seleziona una lead valida')
      return
    }

                    if (!formData.data) {
      alert('Inserisci una data per l&apos;appuntamento')
      return
    }

    if (!formData.tipo) {
      alert('Inserisci il tipo di appuntamento')
      return
    }

    setLoading(true)
    try {
      console.log('Sending appointment data:', {
        ...formData,
        data: new Date(formData.data).toISOString()
      })

      const response = await fetch('/api/appuntamenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          data: formData.data?.toISOString()
        })
      })

      if (response.ok) {
        router.push('/dashboard/appuntamenti')
      } else {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        alert(`Errore durante il salvataggio: ${errorData.error || 'Errore sconosciuto'}`)
      }
    } catch (error) {
      console.error('Error creating appuntamento:', error)
      alert('Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }


  // Suggerimenti per il tipo di appuntamento
  const tipiAppuntamento = [
    'Incontro conoscitivo',
    'Incontro conoscitivo + sopralluogo',
    'Incontro di piacere',
    'Firma contratto',
    'Sistemazione immobile'
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/appuntamenti">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutti gli Appuntamenti
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Nuovo Appuntamento</h1>
                  <p className="text-gray-600">Programma un nuovo appuntamento con una lead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selezione Lead */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Lead di Riferimento
                </CardTitle>
                <CardDescription>
                  Seleziona la lead per cui creare l&apos;appuntamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleziona Lead *
                    </label>
                    <LeadCombobox
                      leads={searchedLeads}
                      selectedLead={selectedLead}
                      onSelectLead={(lead) => {
                        setSelectedLead(lead)
                        setFormData(prev => ({ ...prev, leadId: lead?.id || 0 }))
                      }}
                      onSearch={setSearchTerm}
                      searching={searching}
                      placeholder="Cerca e seleziona una lead per l'appuntamento..."
                      emptyMessage="Nessuna lead trovata"
                    />
                  </div>
                  
                  {!selectedLead && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      ⚠️ È necessario selezionare una lead per creare un appuntamento.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dettagli Appuntamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dettagli Appuntamento
                </CardTitle>
                <CardDescription>
                  Informazioni specifiche dell&apos;appuntamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                      Data e Ora *
                    </label>
                    <DateTimePicker
                      value={formData.data}
                      onChange={(date) => setFormData(prev => ({ ...prev, data: date }))}
                      placeholder="Seleziona data e ora dell&apos;appuntamento"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo di Appuntamento *
                    </label>
                    <Select 
                      value={formData.tipo} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tipiAppuntamento.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="luogo" className="block text-sm font-medium text-gray-700 mb-2">
                      Luogo
                    </label>
                    <input
                      type="text"
                      id="luogo"
                      name="luogo"
                      value={formData.luogo}
                      onChange={(e) => setFormData(prev => ({ ...prev, luogo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Es. Ufficio, Casa del cliente, Video chiamata, ecc."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                      Note e Dettagli
                    </label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Aggiungi note specifiche per questo appuntamento, agenda, documenti da portare..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Stato Appuntamento
                </CardTitle>
                <CardDescription>
                  Imposta lo stato iniziale dell&apos;appuntamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.completato}
                    onChange={(e) => setFormData(prev => ({ ...prev, completato: e.target.checked }))}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Appuntamento già completato</span>
                </label>
              </CardContent>
            </Card>

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

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📅 Consigli per gli appuntamenti</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Digita nel campo di ricerca per trovare la lead desiderata (ricerca in tempo reale)</li>
              <li>• Conferma sempre data e ora con la lead prima di fissare l&apos;appuntamento</li>
              <li>• Specifica il tipo di incontro per preparare al meglio i materiali necessari</li>
              <li>• Aggiungi note specifiche per ricordare dettagli importanti discussi</li>
              <li>• Per appuntamenti importanti, considera di inviare un promemoria il giorno prima</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function NewAppuntamentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento...</div>
      </div>
    }>
      <NewAppuntamentoForm />
    </Suspense>
  )
}