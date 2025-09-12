'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Search, 
  Target,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'

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

function NewTaskForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    tipo: '',
    priorita: 'media',
    stato: 'da_fare',
    dataScadenza: undefined as Date | undefined,
    leadId: 0
  })

  // Lead selection state
  const [searchedLeads, setSearchedLeads] = useState<Lead[]>([])
  const [leadSearchTerm, setLeadSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const tipiTask = [
    { value: 'prospetti_da_fare', label: 'Prospetti da fare' },
    { value: 'chiamate_da_fare', label: 'Chiamate da fare' },
    { value: 'task_importanti', label: 'Task importanti' },
    { value: 'task_generiche', label: 'Task generiche' }
  ]

  const priorita = [
    { value: 'bassa', label: 'Bassa' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
  ]

  const stati = [
    { value: 'da_fare', label: 'Da fare' },
    { value: 'in_corso', label: 'In corso' },
    { value: 'completato', label: 'Completato' }
  ]

  // Gestisci leadId preselezionata dalla URL
  useEffect(() => {
    const leadId = searchParams.get('leadId')
    if (leadId && session) {
      const leadIdNum = parseInt(leadId)
      if (leadIdNum > 0) {
        setFormData(prev => ({ ...prev, leadId: leadIdNum }))
        fetchSelectedLead(leadIdNum)
      }
    }
  }, [searchParams, session])

  // Effettua la ricerca delle lead quando cambia il termine di ricerca
  useEffect(() => {
    if (leadSearchTerm.trim() === '') {
      setSearchedLeads([])
      return
    }

    const timeoutId = setTimeout(() => {
      searchLeads(leadSearchTerm)
    }, 300) // Debounce di 300ms

    return () => clearTimeout(timeoutId)
  }, [leadSearchTerm])

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

    if (!formData.titolo.trim()) {
      toast.error('Il titolo è obbligatorio')
      return
    }

    if (!formData.tipo) {
      toast.error('Seleziona il tipo di task')
      return
    }

    setLoading(true)
    try {
      const taskData = {
        titolo: formData.titolo.trim(),
        descrizione: formData.descrizione.trim() || null,
        tipo: formData.tipo,
        priorita: formData.priorita,
        stato: formData.stato,
        dataScadenza: formData.dataScadenza ? formData.dataScadenza.toISOString() : null,
        leadId: selectedLead?.id || null,
        colore: getPriorityColor(formData.priorita)
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        toast.success('Task creato con successo!')
        router.push('/dashboard/tasks')
      } else {
        const errorData = await response.json()
        toast.error(`Errore: ${errorData.error || 'Errore durante la creazione'}`)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Errore durante la creazione del task')
    } finally {
      setLoading(false)
    }
  }

  const handleLeadSelect = (leadId: string) => {
    if (leadId === '0') {
      setSelectedLead(null)
      setFormData(prev => ({ ...prev, leadId: 0 }))
    } else {
      const lead = searchedLeads.find(l => l.id === parseInt(leadId))
      if (lead) {
        setSelectedLead(lead)
        setFormData(prev => ({ ...prev, leadId: lead.id }))
      }
    }
  }

  const getPriorityColor = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return '#ef4444'
      case 'alta': return '#f97316'
      case 'media': return '#eab308'
      case 'bassa': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'default'
      case 'cliente_attesa': return 'secondary'
      case 'foto': return 'outline'
      case 'appuntamento': return 'default'
      case 'ghost': return 'destructive'
      case 'ricontattare': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'Cliente Confermato'
      case 'cliente_attesa': return 'Cliente in Attesa'
      case 'foto': return 'Foto'
      case 'appuntamento': return 'Appuntamento'
      case 'ghost': return 'Ghost'
      case 'ricontattare': return 'Ricontattare'
      default: return 'Lead'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/tasks">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutti i Tasks
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Nuovo Task</h1>
                  <p className="text-gray-600">Crea un nuovo task per organizzare il tuo lavoro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Informazioni Base
              </CardTitle>
              <CardDescription>
                Dettagli principali del task da creare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="titolo" className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo Task *
                  </label>
                  <input
                    type="text"
                    id="titolo"
                    value={formData.titolo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titolo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. Chiamare cliente per appuntamento"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo di Task *
                  </label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tipiTask.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="priorita" className="block text-sm font-medium text-gray-700 mb-2">
                    Priorità
                  </label>
                  <Select value={formData.priorita} onValueChange={(value) => setFormData(prev => ({ ...prev, priorita: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorita.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="stato" className="block text-sm font-medium text-gray-700 mb-2">
                    Stato Iniziale
                  </label>
                  <Select value={formData.stato} onValueChange={(value) => setFormData(prev => ({ ...prev, stato: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stati.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="dataScadenza" className="block text-sm font-medium text-gray-700 mb-2">
                    Data di Scadenza
                  </label>
                  <DateTimePicker
                    value={formData.dataScadenza}
                    onChange={(date) => setFormData(prev => ({ ...prev, dataScadenza: date }))}
                    placeholder="Seleziona data di scadenza (opzionale)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <Textarea
                  id="descrizione"
                  value={formData.descrizione}
                  onChange={(e) => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
                  placeholder="Descrizione dettagliata del task..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lead Association */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Lead Associata (Opzionale)
              </CardTitle>
              <CardDescription>
                Associa questo task a una lead specifica se necessario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="leadSearch" className="block text-sm font-medium text-gray-700 mb-2">
                  Cerca Lead
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    id="leadSearch"
                    placeholder="Cerca per nome, località, email o telefono..."
                    value={leadSearchTerm}
                    onChange={(e) => setLeadSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                <Select value={selectedLead?.id.toString() || '0'} onValueChange={handleLeadSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={leadSearchTerm.trim() === '' ? 'Inizia a digitare per cercare lead...' : 'Seleziona una lead...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nessuna lead associata</SelectItem>
                    {selectedLead && formData.leadId === selectedLead.id && (
                      <SelectItem key={selectedLead.id} value={selectedLead.id.toString()}>
                        {selectedLead.nome} - {selectedLead.localita} ({selectedLead.camere} camera{selectedLead.camere > 1 ? 'e' : ''})
                      </SelectItem>
                    )}
                    {searchedLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id.toString()}>
                        {lead.nome} - {lead.localita} ({lead.camere} camera{lead.camere > 1 ? 'e' : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {leadSearchTerm.trim() === '' && !selectedLead && (
                  <div className="mt-2 p-3 text-sm text-gray-600 bg-gray-50 rounded-lg">
                    💡 Inizia a digitare nel campo di ricerca per trovare le lead
                  </div>
                )}

                {leadSearchTerm && !searching && searchedLeads.length === 0 && (
                  <div className="mt-2 p-3 text-sm text-gray-500 bg-gray-50 rounded-lg">
                    Nessuna lead trovata per &quot;{leadSearchTerm}&quot;
                  </div>
                )}

                {searchedLeads.length > 0 && leadSearchTerm && (
                  <div className="mt-2 p-3 text-sm text-blue-600 bg-blue-50 rounded-lg">
                    {searchedLeads.length} lead{searchedLeads.length > 1 ? 's' : ''} trovata{searchedLeads.length > 1 ? 'e' : ''}
                  </div>
                )}

                {selectedLead && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-600 text-white">
                            {selectedLead.nome.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-blue-900">{selectedLead.nome}</h4>
                          <div className="flex items-center gap-4 text-sm text-blue-700">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {selectedLead.localita}
                            </span>
                            <span>{selectedLead.camere} camera{selectedLead.camere > 1 ? 'e' : ''}</span>
                            {selectedLead.telefono && (
                              <a href={`tel:${selectedLead.telefono}`} className="flex items-center gap-1 hover:underline">
                                <Phone className="h-4 w-4" />
                                {selectedLead.telefono}
                              </a>
                            )}
                            {selectedLead.email && (
                              <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-1 hover:underline">
                                <Mail className="h-4 w-4" />
                                {selectedLead.email}
                              </a>
                            )}
                          </div>
                          <div className="mt-2">
                            <Badge variant={getStatusColor(selectedLead.status) as any}>
                              {getStatusText(selectedLead.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(null)
                          setFormData(prev => ({ ...prev, leadId: 0 }))
                          setLeadSearchTerm('')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Link href="/dashboard/tasks">
              <Button type="button" variant="outline">
                <X className="h-4 w-4 mr-2" />
                Annulla
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crea Task
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Consigli per i Task</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Titolo chiaro:</strong> Usa titoli specifici e azionabili (es. &quot;Chiamare Mario Rossi per conferma appuntamento&quot;)</li>
              <li>• <strong>Priorità:</strong> Usa &quot;Urgente&quot; solo per task che richiedono azione immediata</li>
              <li>• <strong>Scadenza:</strong> Imposta una data realistica per completare il task</li>
              <li>• <strong>Lead associata:</strong> Collega il task a una lead per un migliore tracciamento del customer journey</li>
              <li>• <strong>Descrizione:</strong> Aggiungi dettagli utili per ricordare il contesto quando riprenderai il task</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento...</div>
      </div>
    }>
      <NewTaskForm />
    </Suspense>
  )
}
