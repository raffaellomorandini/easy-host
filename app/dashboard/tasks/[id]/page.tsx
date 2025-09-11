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
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  leadNome?: string
  leadLocalita?: string
  leadStatus?: string
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

export default function TaskDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    titolo: '',
    descrizione: '',
    tipo: '',
    priorita: '',
    stato: '',
    dataScadenza: ''
  })

  useEffect(() => {
    if (session && params.id) {
      fetchTask()
    }
  }, [session, params.id])

  useEffect(() => {
    if (task?.leadId) {
      fetchLead()
    }
  }, [task?.leadId])

  const fetchTask = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        const foundTask = data.find((t: Task) => t.id === parseInt(params.id as string))
        if (foundTask) {
          setTask(foundTask)
          setEditForm({
            titolo: foundTask.titolo,
            descrizione: foundTask.descrizione || '',
            tipo: foundTask.tipo,
            priorita: foundTask.priorita,
            stato: foundTask.stato,
            dataScadenza: foundTask.dataScadenza ? foundTask.dataScadenza.slice(0, 16) : ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLead = async () => {
    if (!task?.leadId) return
    try {
      const response = await fetch(`/api/leads?id=${task.leadId}`)
      if (response.ok) {
        const leadData = await response.json()
        setLead(leadData)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    }
  }

  const handleSave = async () => {
    if (!task) return

    setSaving(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          ...editForm,
          dataScadenza: editForm.dataScadenza || null
        })
      })

      if (response.ok) {
        toast.success('Task aggiornato con successo!')
        setIsEditing(false)
        fetchTask()
      } else {
        toast.error('Errore durante l\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Errore durante l\'aggiornamento')
    } finally {
      setSaving(false)
    }
  }

  const updateTaskStatus = async (newStato: string) => {
    if (!task) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          stato: newStato,
          completato: newStato === 'completato'
        })
      })

      if (response.ok) {
        toast.success('Stato aggiornato!')
        fetchTask()
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const getPriorityColor = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return 'destructive'
      case 'alta': return 'default'
      case 'media': return 'secondary'
      case 'bassa': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'completato': return 'default'
      case 'in_corso': return 'default'
      case 'da_fare': return 'secondary'
      default: return 'secondary'
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
        <div className="text-lg">Caricamento dettagli task...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Task non trovato</CardTitle>
            <CardDescription>Il task richiesto non esiste o è stato eliminato</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard/tasks">
              <Button>Torna ai Tasks</Button>
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
              <Link href="/dashboard/tasks">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutti i Tasks
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {task.titolo.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{task.titolo}</h1>
                  <p className="text-gray-600">{getTaskTypeText(task.tipo)}</p>
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
                <TabsTrigger value="activity">Attività</TabsTrigger>
                <TabsTrigger value="settings">Impostazioni</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Task Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informazioni Task
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titolo
                          </label>
                          <input
                            type="text"
                            value={editForm.titolo}
                            onChange={(e) => setEditForm(prev => ({ ...prev, titolo: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrizione
                          </label>
                          <Textarea
                            value={editForm.descrizione}
                            onChange={(e) => setEditForm(prev => ({ ...prev, descrizione: e.target.value }))}
                            placeholder="Descrizione del task..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo
                            </label>
                            <Select 
                              value={editForm.tipo} 
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, tipo: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prospetti_da_fare">Prospetti da fare</SelectItem>
                                <SelectItem value="chiamate_da_fare">Chiamate da fare</SelectItem>
                                <SelectItem value="task_importanti">Task importanti</SelectItem>
                                <SelectItem value="task_generiche">Task generiche</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Priorità
                            </label>
                            <Select 
                              value={editForm.priorita} 
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, priorita: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bassa">Bassa</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="urgente">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stato
                            </label>
                            <Select 
                              value={editForm.stato} 
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, stato: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="da_fare">Da fare</SelectItem>
                                <SelectItem value="in_corso">In corso</SelectItem>
                                <SelectItem value="completato">Completato</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Data Scadenza
                            </label>
                            <input
                              type="datetime-local"
                              value={editForm.dataScadenza}
                              onChange={(e) => setEditForm(prev => ({ ...prev, dataScadenza: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.titolo}</h3>
                          {task.descrizione && (
                            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                              {task.descrizione}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Tipo</span>
                            <span className="font-medium">{getTaskTypeText(task.tipo)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Priorità</span>
                            <Badge variant={getPriorityColor(task.priorita)} className="w-fit">
                              {task.priorita}
                            </Badge>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Stato</span>
                            <Badge variant={getStatusColor(task.stato)} className="w-fit">
                              {task.stato === 'da_fare' ? 'Da fare' : 
                               task.stato === 'in_corso' ? 'In corso' : 
                               'Completato'}
                            </Badge>
                          </div>
                          {task.dataScadenza && (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500">Scadenza</span>
                              <span className="font-medium">
                                {new Date(task.dataScadenza).toLocaleDateString('it-IT', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lead Association */}
                {task.leadNome && lead && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Lead Associata
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
                          <p className="font-medium text-gray-900">Task creata</p>
                          <p className="text-sm text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {task.updatedAt !== task.createdAt && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">Ultima modifica</p>
                            <p className="text-sm text-gray-500">
                              {new Date(task.updatedAt).toLocaleDateString('it-IT', {
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
                      {task.stato === 'completato' && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">Task completata</p>
                            <p className="text-sm text-gray-500">
                              {new Date(task.updatedAt).toLocaleDateString('it-IT', {
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Impostazioni Task</CardTitle>
                    <CardDescription>
                      Gestisci le impostazioni avanzate di questo task
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Colore del task</h4>
                          <p className="text-sm text-gray-500">Personalizza il colore per una migliore organizzazione</p>
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: task.colore }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Data di creazione</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
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
                {task.stato !== 'completato' && (
                  <>
                    <Button 
                      onClick={() => updateTaskStatus('in_corso')}
                      disabled={task.stato === 'in_corso'}
                      className="w-full"
                      variant={task.stato === 'in_corso' ? 'secondary' : 'default'}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {task.stato === 'in_corso' ? 'In Corso' : 'Inizia Task'}
                    </Button>
                    <Button 
                      onClick={() => updateTaskStatus('completato')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completa Task
                    </Button>
                  </>
                )}
                {task.stato === 'completato' && (
                  <Button 
                    onClick={() => updateTaskStatus('da_fare')}
                    className="w-full"
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Riapri Task
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Task Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priorità</span>
                  <Badge variant={getPriorityColor(task.priorita)}>
                    {task.priorita}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stato</span>
                  <Badge variant={getStatusColor(task.stato)}>
                    {task.stato === 'da_fare' ? 'Da fare' : 
                     task.stato === 'in_corso' ? 'In corso' : 
                     'Completato'}
                  </Badge>
                </div>
                {task.dataScadenza && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scadenza</span>
                    <span className={`text-sm font-medium ${
                      new Date(task.dataScadenza) < new Date() && task.stato !== 'completato'
                        ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(task.dataScadenza).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                )}
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
                <Link href="/dashboard/tasks">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Tutti i Tasks
                  </Button>
                </Link>
                {task.leadId && (
                  <Link href={`/dashboard/leads/${task.leadId}`}>
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
