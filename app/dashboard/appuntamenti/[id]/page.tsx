'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  CheckCircle,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'

interface Appuntamento {
  id: number
  leadId: number
  data: string
  tipo: string
  luogo?: string
  note?: string
  completato: boolean
  createdAt: string
  leadNome: string
  leadLocalita: string
}

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
  createdAt: string
  updatedAt: string
}

function AppuntamentoDetailContent() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [appuntamento, setAppuntamento] = useState<Appuntamento | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    data: new Date(),
    tipo: '',
    luogo: '',
    note: '',
    completato: false
  })

  const tipiAppuntamento = [
    'Incontro conoscitivo',
    'Incontro conoscitivo + sopralluogo',
    'Incontro di piacere',
    'Firma contratto',
    'Sistemazione immobile'
  ]

  useEffect(() => {
    if (session && params.id) {
      fetchAppuntamento()
    }
  }, [session, params.id])

  useEffect(() => {
    if (appuntamento?.leadId) {
      fetchLead()
    }
  }, [appuntamento?.leadId])

  // Check for edit mode from URL params
  useEffect(() => {
    const editParam = searchParams.get('edit')
    if (editParam === 'true') {
      setIsEditing(true)
    }
  }, [searchParams])

  const fetchAppuntamento = async () => {
    try {
      const response = await fetch(`/api/appuntamenti?id=${params.id}`)
      if (response.ok) {
        const foundAppuntamento = await response.json()
        setAppuntamento(foundAppuntamento)
        setEditForm({
          data: new Date(foundAppuntamento.data),
          tipo: foundAppuntamento.tipo,
          luogo: foundAppuntamento.luogo || '',
          note: foundAppuntamento.note || '',
          completato: foundAppuntamento.completato
        })
      }
    } catch (error) {
      console.error('Error fetching appuntamento:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLead = async () => {
    if (!appuntamento?.leadId) return
    try {
      const response = await fetch(`/api/leads?id=${appuntamento.leadId}`)
      if (response.ok) {
        const leadData = await response.json()
        setLead(leadData)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    }
  }

  const handleSave = async () => {
    if (!appuntamento) return

    setSaving(true)
    try {
      const response = await fetch('/api/appuntamenti', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appuntamento.id,
          data: editForm.data.toISOString(),
          tipo: editForm.tipo,
          luogo: editForm.luogo || null,
          note: editForm.note || null,
          completato: editForm.completato
        })
      })

      if (response.ok) {
        toast.success('Appuntamento aggiornato con successo!')
        setIsEditing(false)
        fetchAppuntamento()
      } else {
        toast.error('Errore durante l&apos;aggiornamento')
      }
    } catch (error) {
      console.error('Error updating appuntamento:', error)
      toast.error('Errore durante l&apos;aggiornamento')
    } finally {
      setSaving(false)
    }
  }

  const toggleCompletato = async () => {
    if (!appuntamento) return

    try {
      const response = await fetch('/api/appuntamenti', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appuntamento.id,
          completato: !appuntamento.completato
        })
      })

      if (response.ok) {
        toast.success(appuntamento.completato ? 'Appuntamento riaperto!' : 'Appuntamento completato!')
        fetchAppuntamento()
      }
    } catch (error) {
      console.error('Error updating appuntamento status:', error)
    }
  }

  const getStatusInfo = () => {
    if (!appuntamento) return { color: 'secondary', text: 'Sconosciuto', icon: Clock }
    
    const now = new Date()
    const dataAppuntamento = new Date(appuntamento.data)
    
    if (appuntamento.completato) {
      return { color: 'default', text: 'Completato', icon: CheckCircle }
    } else if (dataAppuntamento < now) {
      return { color: 'destructive', text: 'Scaduto', icon: AlertTriangle }
    } else {
      return { color: 'secondary', text: 'Programmato', icon: Clock }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento dettagli appuntamento...</div>
      </div>
    )
  }

  if (!appuntamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Appuntamento non trovato</CardTitle>
            <CardDescription>L&apos;appuntamento richiesto non esiste o è stato eliminato</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard/appuntamenti">
              <Button>Torna agli Appuntamenti</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo()

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
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {appuntamento.leadNome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{appuntamento.leadNome}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600">{appuntamento.tipo}</p>
                    <Badge variant={statusInfo.color as any}>
                      {statusInfo.text}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Modifica
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Salvando...' : 'Salva'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Dettagli</TabsTrigger>
                <TabsTrigger value="lead">Lead</TabsTrigger>
                <TabsTrigger value="activity">Attività</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Appointment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Dettagli Appuntamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data e Ora *
                          </label>
                          <DateTimePicker
                            value={editForm.data}
                            onChange={(date) => date && setEditForm(prev => ({ ...prev, data: date }))}
                            placeholder="Seleziona data e ora"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo di Appuntamento *
                          </label>
                          <Select 
                            value={editForm.tipo} 
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, tipo: value }))}
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Luogo
                          </label>
                          <input
                            type="text"
                            value={editForm.luogo}
                            onChange={(e) => setEditForm(prev => ({ ...prev, luogo: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Es. Ufficio, Casa del cliente, Video chiamata"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Note e Dettagli
                          </label>
                          <Textarea
                            value={editForm.note}
                            onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="Note aggiuntive per l'appuntamento..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="completato"
                            checked={editForm.completato}
                            onChange={(e) => setEditForm(prev => ({ ...prev, completato: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="completato" className="text-sm text-gray-700">
                            Appuntamento completato
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Data e Ora</p>
                              <p className="font-medium">
                                {format(new Date(appuntamento.data), "EEEE, d MMMM yyyy 'alle' HH:mm", { locale: it })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Tipo</p>
                              <p className="font-medium">{appuntamento.tipo}</p>
                            </div>
                          </div>
                          {appuntamento.luogo && (
                            <div className="flex items-center gap-3">
                              <MapPin className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Luogo</p>
                                <p className="font-medium">{appuntamento.luogo}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Stato</p>
                              <Badge variant={statusInfo.color as any}>
                                {statusInfo.text}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {appuntamento.note && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-gray-500 mb-2">Note</p>
                            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                              {appuntamento.note}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lead" className="space-y-6">
                {lead ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informazioni Lead
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback className="bg-blue-600 text-white">
                              {lead.nome.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-blue-900">{lead.nome}</h4>
                            <div className="flex items-center gap-4 text-sm text-blue-700">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {lead.localita}
                              </span>
                              <span>{lead.camere} camera{lead.camere > 1 ? 'e' : ''}</span>
                              {lead.telefono && (
                                <a href={`tel:${lead.telefono}`} className="flex items-center gap-1 hover:underline">
                                  <Phone className="h-4 w-4" />
                                  {lead.telefono}
                                </a>
                              )}
                              {lead.email && (
                                <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:underline">
                                  <Mail className="h-4 w-4" />
                                  {lead.email}
                                </a>
                              )}
                            </div>
                            {lead.note && (
                              <p className="text-sm text-blue-600 mt-2 max-w-md">
                                {lead.note.length > 100 ? `${lead.note.substring(0, 100)}...` : lead.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">Caricamento informazioni lead...</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline Attività</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Appuntamento creato</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(appuntamento.createdAt), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                          </p>
                        </div>
                      </div>
                      {appuntamento.completato && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">Appuntamento completato</p>
                            <p className="text-sm text-gray-500">
                              Stato aggiornato come completato
                            </p>
                          </div>
                        </div>
                      )}
                      {!appuntamento.completato && new Date(appuntamento.data) < new Date() && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">Appuntamento scaduto</p>
                            <p className="text-sm text-gray-500">
                              L&apos;appuntamento è passato ma non è stato marcato come completato
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Azioni Rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!appuntamento.completato ? (
                  <Button 
                    onClick={toggleCompletato}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completa Appuntamento
                  </Button>
                ) : (
                  <Button 
                    onClick={toggleCompletato}
                    variant="outline"
                    className="w-full"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Riapri Appuntamento
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Appointment Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stato</span>
                  <Badge variant={statusInfo.color as any}>
                    {statusInfo.text}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data</span>
                  <span className="text-sm font-medium">
                    {format(new Date(appuntamento.data), "d MMM yyyy", { locale: it })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ora</span>
                  <span className="text-sm font-medium">
                    {format(new Date(appuntamento.data), "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Creato</span>
                  <span className="text-sm">
                    {format(new Date(appuntamento.createdAt), "d MMM yyyy", { locale: it })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Related Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Collegamenti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/calendario">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Visualizza nel Calendario
                  </Button>
                </Link>
                <Link href="/dashboard/appuntamenti">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Tutti gli Appuntamenti
                  </Button>
                </Link>
                {lead && (
                  <Link href={`/dashboard/leads/${lead.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Visualizza Lead
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AppuntamentoDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento dettagli appuntamento...</div>
      </div>
    }>
      <AppuntamentoDetailContent />
    </Suspense>
  )
}
