'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Check, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  Target,
  FileText,
  Settings,
  Star,
  Zap
} from 'lucide-react'

interface Task {
  id: number
  userId: string
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

export default function TasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    stato: 'all' as 'all' | 'da_fare' | 'in_corso' | 'completato',
    priorita: 'all' as 'all' | 'bassa' | 'media' | 'alta' | 'urgente',
    tipo: 'all' as 'all' | 'amministrativo' | 'commerciale' | 'tecnico' | 'marketing'
  })
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session])

  useEffect(() => {
    filterTasks()
  }, [tasks, filters, search])

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
          colore: getPriorityColor(formData.get('priorita') as string)
        })
      })

      if (response.ok) {
        toast.success('Task creato con successo!')
        setShowNewTaskForm(false)
        fetchTasks()
        // Reset form
        ;(e.target as HTMLFormElement).reset()
      } else {
        toast.error('Errore durante la creazione del task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Errore durante la creazione del task')
    }
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
      case 'amministrativo': return <FileText className="h-4 w-4" />
      case 'commerciale': return <Target className="h-4 w-4" />
      case 'tecnico': return <Settings className="h-4 w-4" />
      case 'marketing': return <Star className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
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

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Tasks</h1>
          <p className="text-gray-600 mt-1">
            {tasks.length} tasks totali • {tasksCompletati} completati • {tasksInCorso} in corso • {tasksDaFare} da fare
          </p>
        </div>
        <Button onClick={() => setShowNewTaskForm(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-600">Completati</p>
                <p className="text-2xl font-bold text-gray-900">{tasksCompletati}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-600">In Corso</p>
                <p className="text-2xl font-bold text-gray-900">{tasksInCorso}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-600">Da Fare</p>
                <p className="text-2xl font-bold text-gray-900">{tasksDaFare}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-red-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-600">Scaduti</p>
                <p className="text-2xl font-bold text-gray-900">{tasksScaduti}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  onClick={() => setShowNewTaskForm(false)}
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
                      <option value="amministrativo">Amministrativo</option>
                      <option value="commerciale">Commerciale</option>
                      <option value="tecnico">Tecnico</option>
                      <option value="marketing">Marketing</option>
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
                    onClick={() => setShowNewTaskForm(false)}
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

      {/* Filters and Search */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card mb-6"
      >
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cerca tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filters.stato}
                onChange={(e) => setFilters(prev => ({ ...prev, stato: e.target.value as any }))}
                className="form-select"
              >
                <option value="all">Tutti gli stati</option>
                <option value="da_fare">Da fare</option>
                <option value="in_corso">In corso</option>
                <option value="completato">Completato</option>
              </select>

              <select
                value={filters.priorita}
                onChange={(e) => setFilters(prev => ({ ...prev, priorita: e.target.value as any }))}
                className="form-select"
              >
                <option value="all">Tutte le priorità</option>
                <option value="bassa">Bassa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>

              <select
                value={filters.tipo}
                onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value as any }))}
                className="form-select"
              >
                <option value="all">Tutti i tipi</option>
                <option value="amministrativo">Amministrativo</option>
                <option value="commerciale">Commerciale</option>
                <option value="tecnico">Tecnico</option>
                <option value="marketing">Marketing</option>
              </select>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`card card-hover ${task.stato === 'completato' ? 'opacity-75' : ''}`}
            >
              {/* Task Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    task.stato === 'completato' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {task.stato === 'completato' ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      getTypeIcon(task.tipo)
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 ${task.stato === 'completato' ? 'line-through' : ''}`}>
                      {task.titolo}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {task.descrizione && task.descrizione.length > 50 
                        ? `${task.descrizione.substring(0, 50)}...` 
                        : task.descrizione
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Priority Badge */}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColorClasses(task.priorita)}`}>
                    {task.priorita}
                  </span>

                  {/* Status Badge */}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.stato)}`}>
                    {task.stato.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Task Details */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span className="capitalize">{task.tipo.replace('_', ' ')}</span>
                  {task.dataScadenza && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(task.dataScadenza).toLocaleDateString('it-IT')}
                    </span>
                  )}
                  <span>Creato: {new Date(task.createdAt).toLocaleDateString('it-IT')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  {task.stato !== 'completato' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, 'in_corso')}
                        disabled={task.stato === 'in_corso'}
                      >
                        In corso
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'completato')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Completa
                      </Button>
                    </>
                  )}
                  {task.stato === 'completato' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus(task.id, 'da_fare')}
                    >
                      Riapri
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTask(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTask(task.id, task.titolo)}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {search || filters.stato !== 'all' || filters.priorita !== 'all' || filters.tipo !== 'all' 
                ? 'Nessun task trovato con i filtri selezionati' 
                : 'Nessun task presente'
              }
            </div>
            <Button className="mt-4" onClick={() => setShowNewTaskForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Primo Task
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}