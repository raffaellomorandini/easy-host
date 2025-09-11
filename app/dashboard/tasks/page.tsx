'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Search,
  Clock, 
  Check, 
  Edit, 
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Clock as ClockIcon,
  Target,
  FileText,
  Settings,
  Star,
  Zap,
  User,
  Phone,
  ExternalLink,
  TrendingUp,
  Calendar,
  Filter,
  X
} from 'lucide-react'

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
}

function TasksPageContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTaskForView, setSelectedTaskForView] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  // Stati per la selezione lead nei task
  const [searchedLeads, setSearchedLeads] = useState<Lead[]>([])
  const [leadSearchTerm, setLeadSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filters, setFilters] = useState({
    stato: 'all' as 'all' | 'da_fare' | 'in_corso' | 'completato',
    priorita: 'all' as 'all' | 'bassa' | 'media' | 'alta' | 'urgente',
    tipo: 'all' as 'all' | 'prospetti_da_fare' | 'chiamate_da_fare' | 'task_importanti' | 'task_generiche'
  })
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session])

  // Gestisci leadId dalla URL per aprire il modal con lead preselezionata
  useEffect(() => {
    const leadId = searchParams.get('leadId')
    if (leadId && session) {
      const leadIdNum = parseInt(leadId)
      if (leadIdNum > 0) {
        fetchSelectedLead(leadIdNum)
        setShowNewTaskForm(true)
      }
    }
  }, [searchParams, session])

  useEffect(() => {
    filterTasks()
  }, [tasks, filters, search])

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

  // Gestisci apertura modal di modifica
  useEffect(() => {
    if (editingTask && editingTask.leadId) {
      fetchSelectedLead(editingTask.leadId)
    } else if (editingTask && !editingTask.leadId) {
      setSelectedLead(null)
      setLeadSearchTerm('')
      setSearchedLeads([])
    }
  }, [editingTask])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
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

  const filterTasks = () => {
    let filtered = tasks

    if (filters.stato !== 'all') {
      filtered = filtered.filter(task => task.stato === filters.stato)
    }

    if (filters.priorita !== 'all') {
      filtered = filtered.filter(task => task.priorita === filters.priorita)
    }

    if (filters.tipo !== 'all') {
      filtered = filtered.filter(task => task.tipo === filters.tipo)
    }

    if (search) {
      filtered = filtered.filter(task => 
        task.titolo.toLowerCase().includes(search.toLowerCase()) ||
        task.descrizione?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredTasks(filtered)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titolo: formData.get('titolo'),
          descrizione: formData.get('descrizione'),
          tipo: formData.get('tipo'),
          priorita: formData.get('priorita'),
          dataScadenza: formData.get('dataScadenza'),
          leadId: selectedLead?.id || null,
          colore: getPriorityColor(formData.get('priorita') as string)
        })
      })

      if (response.ok) {
        toast.success('Task creato con successo!')
        setShowNewTaskForm(false)
        fetchTasks()
        // Reset form e stati lead
        ;(e.target as HTMLFormElement).reset()
        setSelectedLead(null)
        setLeadSearchTerm('')
        setSearchedLeads([])
      } else {
        toast.error('Errore durante la creazione del task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Errore durante la creazione del task')
    }
  }

  const updateTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        fetchTasks()
        toast.success('Task aggiornato con successo!')
        setEditingTask(null)
        // Reset lead states
        setSelectedLead(null)
        setLeadSearchTerm('')
        setSearchedLeads([])
      } else {
        toast.error('Errore durante l\'aggiornamento del task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Errore durante l\'aggiornamento del task')
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    const formData = new FormData(e.target as HTMLFormElement)
    const dataScadenza = formData.get('dataScadenza') as string
    
    const taskData = {
      id: editingTask.id,
      titolo: (formData.get('titolo') as string).trim(),
      descrizione: (formData.get('descrizione') as string).trim() || null,
      tipo: formData.get('tipo') as string,
      priorita: formData.get('priorita') as string,
      stato: formData.get('stato') as string,
      dataScadenza: dataScadenza ? new Date(dataScadenza).toISOString() : null,
      leadId: selectedLead?.id || null
    }

    if (!taskData.titolo) {
      toast.error('Il titolo è obbligatorio')
      return
    }

    await updateTask(taskData)
  }

  const updateTaskStatus = async (taskId: number, newStato: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, stato: newStato })
      })

      if (response.ok) {
        fetchTasks()
        toast.success('Status aggiornato con successo!')
      } else {
        toast.error('Errore durante l\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Errore durante l\'aggiornamento')
    }
  }

  const deleteTask = async (taskId: number, taskTitle: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il task "${taskTitle}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      })

      if (response.ok) {
        fetchTasks()
        toast.success('Task eliminato con successo!')
      } else {
        toast.error('Errore durante l\'eliminazione')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Errore durante l\'eliminazione')
    }
  }

  const getPriorityColor = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return '#dc2626'  // red
      case 'alta': return '#ea580c'     // orange
      case 'media': return '#d97706'    // yellow/amber
      case 'bassa': return '#16a34a'    // green
      default: return '#6b7280'         // gray
    }
  }

  const getPriorityColorClasses = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return 'bg-red-100 text-red-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'bassa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'completato': return 'bg-green-100 text-green-800'
      case 'in_corso': return 'bg-blue-100 text-blue-800'
      case 'da_fare': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return <Zap className="h-4 w-4" />
      case 'alta': return <Star className="h-4 w-4" />
      case 'media': return <Target className="h-4 w-4" />
      case 'bassa': return <CheckCircle className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'prospetti_da_fare': return <User className="h-4 w-4" />
      case 'chiamate_da_fare': return <Clock className="h-4 w-4" />
      case 'task_importanti': return <Star className="h-4 w-4" />
      case 'task_generiche': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
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
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Caricamento tasks...</div>
      </div>
    )
  }

  const tasksCompletati = tasks.filter(t => t.stato === 'completato').length
  const tasksInCorso = tasks.filter(t => t.stato === 'in_corso').length
  const tasksDaFare = tasks.filter(t => t.stato === 'da_fare').length
  const tasksScaduti = tasks.filter(t => 
    t.dataScadenza && new Date(t.dataScadenza) < new Date() && t.stato !== 'completato'
  ).length
  
  const tasksUrgenti = tasks.filter(t => t.priorita === 'urgente' && t.stato !== 'completato').length

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-600 mt-1">
            Gestisci le tue attività e organizza il lavoro • {tasks.length} tasks totali • {tasksUrgenti} urgenti
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/calendario">
            <Button className="btn-secondary">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Button>
          </Link>
        <Button onClick={() => setShowNewTaskForm(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Task
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Completati", value: tasksCompletati, icon: CheckCircle, color: "green", change: "+8%" },
          { title: "In Corso", value: tasksInCorso, icon: Clock, color: "blue", change: "+5%" },
          { title: "Da Fare", value: tasksDaFare, icon: AlertCircle, color: "yellow", change: "+3%" },
          { title: "Scaduti", value: tasksScaduti, icon: Zap, color: "red", change: "-2%" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="card card-hover overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.change.startsWith('+') 
                        ? 'bg-green-100 text-green-700' 
                        : stat.change.startsWith('-')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stat.change}
                    </span>
              </div>
            </div>
                <div className={`p-3 rounded-lg shadow-lg ${
                  stat.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  stat.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <stat.icon className="h-6 w-6 text-white" />
          </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Vs. settimana scorsa
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        </div>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nuovo Task</h2>
                <button
                  onClick={() => {
                    setShowNewTaskForm(false)
                    setSelectedLead(null)
                    setLeadSearchTerm('')
                    setSearchedLeads([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo *
                  </label>
                  <input
                    type="text"
                    name="titolo"
                    required
                    className="form-input"
                    placeholder="Inserisci il titolo del task"
                  />
            </div>

                {/* Selezione Lead (Opzionale) */}
                <div>
                  <label htmlFor="leadSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    Associa a Lead (Opzionale)
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

                  {selectedLead ? (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-blue-900">{selectedLead.nome}</div>
                          <div className="text-blue-700">
                            {selectedLead.localita} • {selectedLead.camere} camera{selectedLead.camere > 1 ? 'e' : ''}
              </div>
            </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLead(null)
                            setLeadSearchTerm('')
                            setSearchedLeads([])
                          }}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          ×
                        </button>
          </div>
        </div>
                  ) : (
                    <>
                      {leadSearchTerm.trim() === '' && (
                        <div className="p-2 text-sm text-gray-600 bg-gray-50 rounded">
                          💡 Opzionale: digita per cercare una lead da associare al task
                        </div>
                      )}
                      
                      {leadSearchTerm && !searching && searchedLeads.length === 0 && (
                        <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded">
                          Nessuna lead trovata per "{leadSearchTerm}"
              </div>
                      )}
                      
                      {searchedLeads.length > 0 && (
                        <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                          {searchedLeads.map((lead) => (
                            <button
                              key={lead.id}
                              type="button"
                              onClick={() => {
                                setSelectedLead(lead)
                                setLeadSearchTerm('')
                                setSearchedLeads([])
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{lead.nome}</div>
                              <div className="text-sm text-gray-600">
                                {lead.localita} • {lead.camere} camera{lead.camere > 1 ? 'e' : ''}
            </div>
                            </button>
                          ))}
          </div>
                      )}
                    </>
                  )}
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    name="descrizione"
                    rows={3}
                    className="form-textarea"
                    placeholder="Descrizione opzionale del task"
                  />
      </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select name="tipo" required className="form-select">
                      <option value="">Seleziona tipo</option>
                      <option value="prospetti_da_fare">Prospetti da fare</option>
                      <option value="chiamate_da_fare">Chiamate da fare</option>
                      <option value="task_importanti">Task importanti</option>
                      <option value="task_generiche">Task generiche</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorità *
                    </label>
                    <select name="priorita" required className="form-select">
                      <option value="">Seleziona priorità</option>
                      <option value="bassa">Bassa</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data di Scadenza
                  </label>
                  <input
                    type="datetime-local"
                    name="dataScadenza"
                    className="form-input"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Task
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      setShowNewTaskForm(false)
                      setSelectedLead(null)
                      setLeadSearchTerm('')
                      setSearchedLeads([])
                    }}
                    className="btn-secondary"
                  >
                    Annulla
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Modifica Task</h2>
                  <p className="text-sm text-gray-500 mt-1">Aggiorna i dettagli del task</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTask(null)
                    setSelectedLead(null)
                    setLeadSearchTerm('')
                    setSearchedLeads([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo *
                  </label>
                  <input
                    type="text"
                    name="titolo"
                    required
                    defaultValue={editingTask.titolo}
                    className="form-input"
                    placeholder="Inserisci il titolo del task"
                  />
                </div>

                {/* Selezione Lead (Opzionale) */}
                <div>
                  <label htmlFor="editLeadSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    Associa a Lead (Opzionale)
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      id="editLeadSearch"
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
                  
                  {selectedLead ? (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-blue-900">{selectedLead.nome}</div>
                          <div className="text-blue-700">
                            {selectedLead.localita} • {selectedLead.camere} camera{selectedLead.camere > 1 ? 'e' : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLead(null)
                            setLeadSearchTerm('')
                            setSearchedLeads([])
                          }}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {leadSearchTerm.trim() === '' && (
                        <div className="p-2 text-sm text-gray-600 bg-gray-50 rounded">
                          💡 Opzionale: digita per cercare una lead da associare al task
                          {editingTask.leadNome && (
                            <div className="mt-1 text-orange-600">
                              ⚠️ Lead attuale: {editingTask.leadNome} (sarà rimossa se non selezioni nulla)
                            </div>
                          )}
                        </div>
                      )}
                      
                      {leadSearchTerm && !searching && searchedLeads.length === 0 && (
                        <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded">
                          Nessuna lead trovata per "{leadSearchTerm}"
                        </div>
                      )}
                      
                      {searchedLeads.length > 0 && (
                        <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                          {searchedLeads.map((lead) => (
                            <button
                              key={lead.id}
                              type="button"
                              onClick={() => {
                                setSelectedLead(lead)
                                setLeadSearchTerm('')
                                setSearchedLeads([])
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{lead.nome}</div>
                              <div className="text-sm text-gray-600">
                                {lead.localita} • {lead.camere} camera{lead.camere > 1 ? 'e' : ''}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    name="descrizione"
                    rows={3}
                    defaultValue={editingTask.descrizione || ''}
                    className="form-textarea"
                    placeholder="Descrizione opzionale del task"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select name="tipo" required defaultValue={editingTask.tipo} className="form-select">
                      <option value="">Seleziona tipo</option>
                      <option value="prospetti_da_fare">Prospetti da fare</option>
                      <option value="chiamate_da_fare">Chiamate da fare</option>
                      <option value="task_importanti">Task importanti</option>
                      <option value="task_generiche">Task generiche</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorità *
                    </label>
                    <select name="priorita" required defaultValue={editingTask.priorita} className="form-select">
                      <option value="">Seleziona priorità</option>
                      <option value="bassa">Bassa</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stato *
                    </label>
                    <select name="stato" required defaultValue={editingTask.stato} className="form-select">
                      <option value="da_fare">Da fare</option>
                      <option value="in_corso">In corso</option>
                      <option value="completato">Completato</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data di Scadenza
                  </label>
                  <input
                    type="datetime-local"
                    name="dataScadenza"
                    defaultValue={editingTask.dataScadenza ? new Date(editingTask.dataScadenza).toISOString().slice(0, 16) : ''}
                    className="form-input"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="btn-primary">
                    <Edit className="h-4 w-4 mr-2" />
                    Aggiorna Task
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      setEditingTask(null)
                      setSelectedLead(null)
                      setLeadSearchTerm('')
                      setSearchedLeads([])
                    }}
                    className="btn-secondary"
                  >
                    Annulla
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Advanced Filters */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card mb-6"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtri e Ricerca</h3>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ricerca tasks
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cerca per titolo, descrizione o lead associata..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Filter Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtra per stato
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'Tutti', count: filteredTasks.length, color: 'gray' },
                    { key: 'da_fare', label: 'Da fare', count: tasks.filter(t => t.stato === 'da_fare').length, color: 'blue' },
                    { key: 'in_corso', label: 'In corso', count: tasks.filter(t => t.stato === 'in_corso').length, color: 'yellow' },
                    { key: 'completato', label: 'Completato', count: tasks.filter(t => t.stato === 'completato').length, color: 'green' }
                  ].map(({ key, label, count, color }) => (
                    <Button
                      key={key}
                      onClick={() => setFilters(prev => ({ ...prev, stato: key as any }))}
                      size="sm"
                      className={`relative ${
                        filters.stato === key 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      {label}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        filters.stato === key 
                          ? 'bg-white/20 text-white' 
                          : `bg-${color}-100 text-${color}-700`
                      }`}>
                        {count}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtra per priorità
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'Tutte', count: filteredTasks.length, color: 'gray' },
                    { key: 'urgente', label: 'Urgente', count: tasks.filter(t => t.priorita === 'urgente').length, color: 'red' },
                    { key: 'alta', label: 'Alta', count: tasks.filter(t => t.priorita === 'alta').length, color: 'orange' },
                    { key: 'media', label: 'Media', count: tasks.filter(t => t.priorita === 'media').length, color: 'yellow' },
                    { key: 'bassa', label: 'Bassa', count: tasks.filter(t => t.priorita === 'bassa').length, color: 'green' }
                  ].map(({ key, label, count, color }) => (
                    <Button
                      key={key}
                      onClick={() => setFilters(prev => ({ ...prev, priorita: key as any }))}
                      size="sm"
                      className={`relative ${
                        filters.priorita === key 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      {label}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        filters.priorita === key 
                          ? 'bg-white/20 text-white' 
                          : `bg-${color}-100 text-${color}-700`
                      }`}>
                        {count}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtra per tipo
                </label>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="form-select w-full"
              >
                <option value="all">Tutti i tipi</option>
                  <option value="prospetti_da_fare">Prospetti da fare</option>
                  <option value="chiamate_da_fare">Chiamate da fare</option>
                  <option value="task_importanti">Task importanti</option>
                  <option value="task_generiche">Task generiche</option>
              </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tasks Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`card card-hover group overflow-hidden border-l-4 ${
                task.stato === 'completato' ? 'opacity-75' : ''
              }`}
              style={{ 
                borderLeftColor: 
                  task.priorita === 'urgente' ? '#ef4444' : 
                  task.priorita === 'alta' ? '#f97316' : 
                  task.priorita === 'media' ? '#eab308' : '#22c55e' 
              }}
            >
              <div className="p-6">
              {/* Task Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
                      task.stato === 'completato' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600' 
                        : task.priorita === 'urgente'
                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                        : task.priorita === 'alta'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {task.stato === 'completato' ? (
                        <Check className="h-6 w-6 text-white" />
                    ) : (
                        <div className="text-white">
                          {getTypeIcon(task.tipo)}
                        </div>
                    )}
                  </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${
                        task.stato === 'completato' ? 'line-through' : ''
                      }`}>
                      {task.titolo}
                    </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColorClasses(task.priorita)}`}>
                          {getPriorityIcon(task.priorita)}
                          <span className="ml-1">{task.priorita}</span>
                  </span>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.stato)}`}>
                          {task.stato === 'da_fare' ? '📋 Da fare' : 
                           task.stato === 'in_corso' ? '⏳ In corso' : 
                           '✅ Completato'}
                  </span>
                      </div>
                    </div>
                </div>
              </div>

              {/* Task Details */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="capitalize">{task.tipo.replace('_', ' ')}</span>
                  {task.dataScadenza && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(task.dataScadenza).toLocaleDateString('it-IT')}
                    </span>
                  )}
                  <span>Creato: {new Date(task.createdAt).toLocaleDateString('it-IT')}</span>
                </div>
                
                {/* Lead Associata */}
                {task.leadNome && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border">
                    <User className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <span className="font-medium text-blue-900">Lead: {task.leadNome}</span>
                      {task.leadLocalita && (
                        <span className="text-blue-700 ml-2">• {task.leadLocalita}</span>
                      )}
                    </div>
                    <Link href={`/dashboard/leads/${task.leadId}`}>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Vedi
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {/* Status Change Buttons */}
                <div className="flex flex-wrap gap-2">
                  {task.stato !== 'completato' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'in_corso')}
                        disabled={task.stato === 'in_corso'}
                        className={`flex-1 min-w-0 ${
                          task.stato === 'in_corso' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'btn-secondary hover:bg-blue-50'
                        }`}
                      >
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {task.stato === 'in_corso' ? 'In Corso' : 'Inizia'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'completato')}
                        className="flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Completa
                      </Button>
                    </>
                  )}
                  {task.stato === 'completato' && (
                    <Button
                      size="sm"
                      onClick={() => updateTaskStatus(task.id, 'da_fare')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Riapri Task
                    </Button>
                  )}
                </div>

                {/* Management Buttons */}
                <div className="grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTaskForView(task)}
                    className="btn-secondary group/btn"
                  >
                    <Eye className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                    Dettagli
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTask(task)}
                    className="btn-secondary group/btn"
                  >
                    <Edit className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTask(task.id, task.titolo)}
                    className="btn-danger group/btn"
                  >
                    <Trash2 className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                    Elimina
                  </Button>
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16"
          >
            <div className="card max-w-md mx-auto">
              <div className="p-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                  <CheckSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {search || filters.stato !== 'all' || filters.priorita !== 'all' || filters.tipo !== 'all' 
                    ? 'Nessun task trovato' 
                    : 'Inizia la gestione tasks'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {search || filters.stato !== 'all' || filters.priorita !== 'all' || filters.tipo !== 'all' 
                    ? 'Prova a modificare i filtri per trovare i tasks che stai cercando.' 
                    : 'Crea il tuo primo task per organizzare meglio il tuo lavoro e raggiungere i tuoi obiettivi.'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setShowNewTaskForm(true)} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    {search || filters.stato !== 'all' || filters.priorita !== 'all' || filters.tipo !== 'all' 
                      ? 'Nuovo Task' 
                      : 'Primo Task'
                    }
                  </Button>
                  <Link href="/dashboard/calendario">
                    <Button className="btn-secondary">
                      <Calendar className="h-4 w-4 mr-2" />
                      Vai al Calendario
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Task Details Modal */}
      {selectedTaskForView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
                    selectedTaskForView.stato === 'completato' 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : selectedTaskForView.priorita === 'urgente'
                      ? 'bg-gradient-to-br from-red-500 to-red-600'
                      : selectedTaskForView.priorita === 'alta'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {selectedTaskForView.stato === 'completato' ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : (
                      <div className="text-white">
                        {getTypeIcon(selectedTaskForView.tipo)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedTaskForView.titolo}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColorClasses(selectedTaskForView.priorita)}`}>
                        {getPriorityIcon(selectedTaskForView.priorita)}
                        <span className="ml-1">{selectedTaskForView.priorita}</span>
                      </span>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTaskForView.stato)}`}>
                        {selectedTaskForView.stato === 'da_fare' ? '📋 Da fare' : 
                         selectedTaskForView.stato === 'in_corso' ? '⏳ In corso' : 
                         '✅ Completato'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTaskForView(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Description */}
                {selectedTaskForView.descrizione && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Descrizione</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedTaskForView.descrizione}</p>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Informazioni Task</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Tipo</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getTaskTypeText(selectedTaskForView.tipo)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Priorità</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getPriorityColorClasses(selectedTaskForView.priorita)}`}>
                          {selectedTaskForView.priorita}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Stato</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(selectedTaskForView.stato)}`}>
                          {selectedTaskForView.stato === 'da_fare' ? 'Da fare' : 
                           selectedTaskForView.stato === 'in_corso' ? 'In corso' : 'Completato'}
                        </span>
                      </div>
                      {selectedTaskForView.dataScadenza && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Scadenza</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedTaskForView.dataScadenza).toLocaleDateString('it-IT', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Task creata</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedTaskForView.createdAt).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {selectedTaskForView.updatedAt !== selectedTaskForView.createdAt && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Ultima modifica</p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedTaskForView.updatedAt).toLocaleDateString('it-IT', {
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
                      {selectedTaskForView.stato === 'completato' && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Task completata</p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedTaskForView.updatedAt).toLocaleDateString('it-IT', {
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
                  </div>
                </div>

                {/* Lead Association */}
                {selectedTaskForView.leadNome && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Lead Associata</h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">{selectedTaskForView.leadNome}</p>
                          <p className="text-sm text-blue-700">
                            {selectedTaskForView.leadLocalita} • Status: {selectedTaskForView.leadStatus}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="btn-secondary"
                          onClick={() => window.open(`/dashboard/leads/${selectedTaskForView.leadId}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  {selectedTaskForView.stato !== 'completato' && (
                    <Button
                      onClick={() => {
                        updateTaskStatus(selectedTaskForView.id, 'completato')
                        setSelectedTaskForView(null)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Completa Task
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setEditingTask(selectedTaskForView)
                      setSelectedTaskForView(null)
                    }}
                    className="btn-secondary"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                </div>
                <Button
                  onClick={() => setSelectedTaskForView(null)}
                  variant="outline"
                >
                  Chiudi
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Caricamento...</div>
      </div>
    }>
      <TasksPageContent />
    </Suspense>
  )
}