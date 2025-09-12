'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Clock, 
  User, 
  Target, 
  CheckCircle,
  CheckSquare,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Crown,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

interface Appuntamento {
  id: number
  leadId: number
  data: string
  tipo: string
  luogo?: string
  note?: string
  completato: boolean
  leadNome: string
  leadLocalita: string
}

interface Task {
  id: number
  userId: string
  leadId?: number
  titolo: string
  descrizione?: string
  tipo: string
  priorita: string
  stato: string
  dataScadenza?: string
  completato: boolean
  colore: string
  createdAt: string
  updatedAt: string
}

export default function LeadDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    nome: '',
    localita: '',
    camere: 1,
    telefono: '',
    email: '',
    contattato: false,
    note: '',
    status: 'lead'
  })

  useEffect(() => {
    if (session && params.id) {
      fetchLead()
      fetchAppuntamenti()
      fetchTasks()
    }
  }, [session, params.id])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads?id=${params.id}`)
      if (response.ok) {
        const leadData = await response.json()
        setLead(leadData)
        setEditForm({
          nome: leadData.nome,
          localita: leadData.localita,
          camere: leadData.camere,
          telefono: leadData.telefono || '',
          email: leadData.email || '',
          contattato: leadData.contattato,
          note: leadData.note || '',
          status: leadData.status
        })
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppuntamenti = async () => {
    try {
      const response = await fetch('/api/appuntamenti?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allAppuntamenti = data.appuntamenti || data
        const leadAppuntamenti = allAppuntamenti.filter((a: Appuntamento) => a.leadId === parseInt(params.id as string))
        setAppuntamenti(leadAppuntamenti)
      }
    } catch (error) {
      console.error('Error fetching appuntamenti:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allTasks = data.tasks || data
        const leadTasks = allTasks.filter((t: Task) => t.leadId === parseInt(params.id as string))
        setTasks(leadTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleSave = async () => {
    if (!lead) return

    setSaving(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          ...editForm
        })
      })

      if (response.ok) {
        toast.success('Lead aggiornata con successo!')
        setIsEditing(false)
        fetchLead()
      } else {
        toast.error('Errore durante l\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      toast.error('Errore durante l\'aggiornamento')
    } finally {
      setSaving(false)
    }
  }

  const updateLeadStatus = async (newStatus: string) => {
    if (!lead) return
    
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          status: newStatus
        })
      })

      if (response.ok) {
        toast.success('Stato aggiornato!')
        fetchLead()
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const toggleContattato = async () => {
    if (!lead) return
    
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          contattato: !lead.contattato
        })
      })

      if (response.ok) {
        toast.success('Stato contatto aggiornato!')
        fetchLead()
      }
    } catch (error) {
      console.error('Error updating lead contact status:', error)
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

  const getTaskTypeText = (tipo: string) => {
    switch (tipo) {
      case 'prospetti_da_fare': return 'Prospetti da fare'
      case 'chiamate_da_fare': return 'Chiamate da fare'
      case 'task_importanti': return 'Task importanti'
      case 'task_generiche': return 'Task generiche'
      default: return tipo.replace(/_/g, ' ')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento dettagli lead...</div>
    </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Lead non trovata</CardTitle>
            <CardDescription>La lead richiesta non esiste o è stata eliminata</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
        <Link href="/dashboard/leads">
          <Button>Torna alle Leads</Button>
        </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/leads">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutte le Leads
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {lead.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              <div>
                  <h1 className="text-2xl font-bold text-gray-900">{lead.nome}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(lead.status)}>
                      {getStatusText(lead.status)}
                    </Badge>
                    {lead.contattato && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Contattato
                      </Badge>
                    )}
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Dettagli</TabsTrigger>
                <TabsTrigger value="appointments">Appuntamenti</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="activity">Attività</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Lead Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informazioni Lead
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome Completo *
                            </label>
                            <input
                              type="text"
                              value={editForm.nome}
                              onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Es. Mario Rossi"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Località *
                            </label>
                            <input
                              type="text"
                              value={editForm.localita}
                              onChange={(e) => setEditForm(prev => ({ ...prev, localita: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Es. Milano, Roma, Napoli"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Numero Camere *
                            </label>
                            <Select 
                              value={editForm.camere.toString()} 
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, camere: parseInt(value) }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 camera</SelectItem>
                                <SelectItem value="2">2 camere</SelectItem>
                                <SelectItem value="3">3 camere</SelectItem>
                                <SelectItem value="4">4 camere</SelectItem>
                                <SelectItem value="5">5+ camere</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                    <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stato
                            </label>
                            <Select 
                              value={editForm.status} 
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="foto">Foto</SelectItem>
                                <SelectItem value="appuntamento">Appuntamento</SelectItem>
                                <SelectItem value="ghost">Ghost</SelectItem>
                                <SelectItem value="ricontattare">Ricontattare</SelectItem>
                                <SelectItem value="cliente_attesa">Cliente in Attesa</SelectItem>
                                <SelectItem value="cliente_confermato">Cliente Confermato</SelectItem>
                              </SelectContent>
                            </Select>
                    </div>
                  </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefono
                            </label>
                            <input
                              type="tel"
                              value={editForm.telefono}
                              onChange={(e) => setEditForm(prev => ({ ...prev, telefono: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Es. 3333333333"
                            />
                          </div>
                    <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Es. mario.rossi@email.com"
                            />
                    </div>
                  </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Note
                          </label>
                          <Textarea
                            value={editForm.note}
                            onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="Note aggiuntive sulla lead..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                            id="contattato"
                            checked={editForm.contattato}
                            onChange={(e) => setEditForm(prev => ({ ...prev, contattato: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="contattato" className="text-sm text-gray-700">
                            È stato contattato
                          </label>
                      </div>
                    </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Località</p>
                              <p className="font-medium">{lead.localita}</p>
                  </div>
                </div>
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 text-gray-400 flex items-center justify-center text-sm font-semibold">
                      #
                    </div>
                    <div>
                              <p className="text-sm text-gray-500">Camere</p>
                              <p className="font-medium">{lead.camere} camera{lead.camere > 1 ? 'e' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Contatto</p>
                              <Badge variant={lead.contattato ? "default" : "outline"}>
                                {lead.contattato ? 'Contattato' : 'Non contattato'}
                              </Badge>
                            </div>
                    </div>
                  </div>

                        {(lead.telefono || lead.email) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {lead.telefono && (
                              <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                                  <p className="text-sm text-gray-500">Telefono</p>
                        <a href={`tel:${lead.telefono}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {lead.telefono}
                        </a>
                      </div>
                    </div>
                  )}
                  {lead.email && (
                              <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                                  <p className="text-sm text-gray-500">Email</p>
                        <a href={`mailto:${lead.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                        )}

            {lead.note && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-gray-500 mb-2">Note</p>
                            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {lead.note}
                            </p>
                  </div>
                        )}
              </div>
            )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Appuntamenti ({appuntamenti.length})
                    </CardTitle>
                <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`}>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nuovo
                  </Button>
                </Link>
                  </CardHeader>
                  <CardContent>
              {appuntamenti.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nessun appuntamento programmato</p>
                  <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`}>
                    <Button variant="outline" className="mt-2">
                      Crea primo appuntamento
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appuntamenti.map((appuntamento) => (
                          <div key={appuntamento.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                appuntamento.completato 
                                  ? 'bg-green-100 text-green-600' 
                                  : new Date(appuntamento.data) < new Date()
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                <Calendar className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{appuntamento.tipo}</p>
                                <p className="text-sm text-gray-500">
                              {new Date(appuntamento.data).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                    day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                                </p>
                          </div>
                        </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                          appuntamento.completato 
                                  ? "default" 
                            : new Date(appuntamento.data) < new Date()
                                  ? "destructive"
                                  : "secondary"
                              }>
                          {appuntamento.completato 
                            ? 'Completato' 
                            : new Date(appuntamento.data) < new Date()
                              ? 'Scaduto'
                              : 'Programmato'}
                              </Badge>
                              <Link href={`/dashboard/appuntamenti/${appuntamento.id}`}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Tasks Associati ({tasks.length})
                    </CardTitle>
                    <Link href={`/dashboard/tasks?leadId=${lead.id}`}>
                      <Button size="sm">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Nuovo
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nessun task associato</p>
                        <Link href={`/dashboard/tasks?leadId=${lead.id}`}>
                          <Button variant="outline" className="mt-2">
                            Crea primo task
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                <Target className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{task.titolo}</p>
                                <p className="text-sm text-gray-500">{getTaskTypeText(task.tipo)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                task.priorita === 'urgente' ? 'destructive' :
                                task.priorita === 'alta' ? 'default' :
                                'secondary'
                              }>
                                {task.priorita}
                              </Badge>
                              <Badge variant={task.stato === 'completato' ? 'default' : 'outline'}>
                                {task.stato === 'da_fare' ? 'Da fare' : 
                                 task.stato === 'in_corso' ? 'In corso' : 
                                 'Completato'}
                              </Badge>
                              <Link href={`/dashboard/tasks/${task.id}`}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                  </CardContent>
                </Card>
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
                          <p className="font-medium text-gray-900">Lead creata</p>
                          <p className="text-sm text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {lead.updatedAt !== lead.createdAt && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">Ultima modifica</p>
                            <p className="text-sm text-gray-500">
                              {new Date(lead.updatedAt).toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      {appuntamenti.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appuntamenti.length} appuntamento{appuntamenti.length > 1 ? 'i' : ''} programmato{appuntamenti.length > 1 ? 'i' : ''}
                            </p>
                            <p className="text-sm text-gray-500">
                              Ultimo: {new Date(appuntamenti[appuntamenti.length - 1].data).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>
                      )}
                      {tasks.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {tasks.length} task associato{tasks.length > 1 ? 'i' : ''}
                            </p>
                            <p className="text-sm text-gray-500">
                              {tasks.filter(t => t.stato === 'completato').length} completato{tasks.filter(t => t.stato === 'completato').length !== 1 ? 'i' : ''}
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
                  <Target className="h-5 w-5" />
                  Azioni Rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Actions */}
                {lead.status === 'lead' && (
                  <>
                    <Button 
                      onClick={() => updateLeadStatus('foto')}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      📸 Sposta a &quot;Foto&quot;
                    </Button>
                    <Button 
                      onClick={() => updateLeadStatus('appuntamento')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      📅 Sposta a &quot;Appuntamento&quot;
                    </Button>
                    <Button 
                      onClick={() => updateLeadStatus('ghost')}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      👻 Marca come &quot;Ghost&quot;
                    </Button>
                  </>
                )}
                
                {(lead.status === 'foto' || lead.status === 'appuntamento' || lead.status === 'ricontattare') && (
                  <>
                  <Button
                    onClick={() => updateLeadStatus('cliente_attesa')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                      → Sposta in &quot;Cliente in Attesa&quot;
                    </Button>
                    <Button 
                      onClick={() => updateLeadStatus('ricontattare')}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={lead.status === 'ricontattare'}
                    >
                      📞 Marca &quot;Da Ricontattare&quot;
                    </Button>
                  </>
                )}
                
                {lead.status === 'ghost' && (
                  <Button 
                    onClick={() => updateLeadStatus('ricontattare')}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    📞 Sposta a &quot;Ricontattare&quot;
                  </Button>
                )}
                
                {lead.status === 'cliente_attesa' && (
                    <Button
                      onClick={() => updateLeadStatus('cliente_confermato')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      ✓ Conferma Cliente
                    </Button>
                )}
                
                {lead.status === 'cliente_confermato' && (
                  <Button
                    onClick={() => updateLeadStatus('cliente_attesa')}
                    variant="outline"
                    className="w-full"
                  >
                    ← Riporta in &quot;Attesa&quot;
                  </Button>
                )}

                {/* Contact Actions */}
                <Button 
                  onClick={toggleContattato}
                  variant="outline"
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {lead.contattato ? 'Marca Non Contattato' : 'Marca Contattato'}
                </Button>

                {/* Quick Contact */}
                {lead.telefono && (
                  <a href={`tel:${lead.telefono}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Chiama ora
                    </Button>
                  </a>
                )}
                
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Invia Email
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Lead Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stato</span>
                  <Badge variant={getStatusColor(lead.status)}>
                    {getStatusText(lead.status)}
                  </Badge>
                    </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Appuntamenti</span>
                  <span className="font-medium">{appuntamenti.length}</span>
                  </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Creata</span>
                  <span className="text-sm">{new Date(lead.createdAt).toLocaleDateString('it-IT')}</span>
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
                <Link href="/dashboard/leads">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Tutte le Leads
                  </Button>
                </Link>
                <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nuovo Appuntamento
                  </Button>
                </Link>
                <Link href={`/dashboard/tasks?leadId=${lead.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Nuovo Task
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}