'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Plus, Edit, Trash2, Check, Clock, Flag, Filter, Search, CheckSquare } from 'lucide-react'

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
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState({
    stato: 'all' as 'all' | 'da_fare' | 'in_corso' | 'completato',
    priorita: 'all' as 'all' | 'bassa' | 'media' | 'alta' | 'urgente',
    tipo: 'all' as 'all' | 'task' | 'reminder' | 'call' | 'meeting' | 'follow-up' | 'personal'
  })
  const [search, setSearch] = useState('')
  const [newTask, setNewTask] = useState({
    titolo: '',
    descrizione: '',
    tipo: 'task',
    priorita: 'media',
    stato: 'da_fare',
    dataScadenza: '',
    colore: '#3b82f6'
  })

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
    if (!session) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          dataScadenza: newTask.dataScadenza || null
        })
      })

      if (response.ok) {
        fetchTasks()
        setShowNewTaskForm(false)
        setNewTask({
          titolo: '',
          descrizione: '',
          tipo: 'task',
          priorita: 'media',
          stato: 'da_fare',
          dataScadenza: '',
          colore: '#3b82f6'
        })
      } else {
        const error = await response.json()
        alert(`Errore durante la creazione: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Errore durante la creazione del task')
    }
  }

  const updateTaskStatus = async (taskId: number, newStato: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: taskId, 
          stato: newStato,
          completato: newStato === 'completato'
        })
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: number, taskTitle: string) => {
    const confirmed = window.confirm(`Sei sicuro di voler eliminare il task "${taskTitle}"?`)
    if (!confirmed) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      })

      if (response.ok) {
        fetchTasks()
        alert('Task eliminato con successo!')
      } else {
        const error = await response.json()
        alert(`Errore durante l'eliminazione: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Errore durante l\'eliminazione del task')
    }
  }

  const getPriorityColor = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-300'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'media': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'bassa': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'completato': return 'bg-green-100 text-green-800'
      case 'in_corso': return 'bg-yellow-100 text-yellow-800'
      case 'da_fare': return 'bg-blue-100 text-blue-800'
      case 'annullato': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return '🔴'
      case 'alta': return '🟠'
      case 'media': return '🔵'
      case 'bassa': return '⚪'
      default: return '🔵'
    }
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'task': return '📋'
      case 'reminder': return '⏰'
      case 'call': return '📞'
      case 'meeting': return '🤝'
      case 'follow-up': return '🔄'
      case 'personal': return '👤'
      default: return '📋'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento tasks...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-primary">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 gap-4">
            <motion.div 
              className="flex items-center"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/dashboard">
                <Button className="btn-secondary mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-gradient text-2xl lg:text-3xl font-bold">
                  📋 Task Manager
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-600 text-sm lg:text-base">Gestisci i tuoi task e promemoria</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckSquare className="h-4 w-4" />
                    <span>{tasks.length} task totali</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="hidden lg:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">{tasks.filter(t => t.priorita === 'urgente' && t.stato !== 'completato').length} Urgenti</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">{tasks.filter(t => t.stato === 'da_fare').length} Da fare</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">{tasks.filter(t => t.stato === 'completato').length} Completati</span>
                </div>
              </div>
              
              <Button onClick={() => setShowNewTaskForm(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Task
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Nuovo Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titolo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTask.titolo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, titolo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newTask.tipo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="task">Task</option>
                    <option value="reminder">Promemoria</option>
                    <option value="call">Chiamata</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="personal">Personale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorità
                  </label>
                  <select
                    value={newTask.priorita}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priorita: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bassa">Bassa</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Scadenza
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.dataScadenza}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dataScadenza: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={newTask.descrizione}
                  onChange={(e) => setNewTask(prev => ({ ...prev, descrizione: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewTaskForm(false)}
                >
                  Annulla
                </Button>
                <Button type="submit">Crea Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card shadow-elegant mb-6"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filters.stato}
                onChange={(e) => setFilters(prev => ({ ...prev, stato: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="da_fare">Da fare</option>
                <option value="in_corso">In corso</option>
                <option value="completato">Completato</option>
              </select>

              <select
                value={filters.priorita}
                onChange={(e) => setFilters(prev => ({ ...prev, priorita: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tutte le priorità</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="bassa">Bassa</option>
              </select>

              <select
                value={filters.tipo}
                onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tutti i tipi</option>
                <option value="task">Task</option>
                <option value="reminder">Promemoria</option>
                <option value="call">Chiamata</option>
                <option value="meeting">Meeting</option>
                <option value="follow-up">Follow-up</option>
                <option value="personal">Personale</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.stato === 'da_fare').length}
              </div>
              <div className="text-sm text-gray-600">Da fare</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.stato === 'in_corso').length}
              </div>
              <div className="text-sm text-gray-600">In corso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.stato === 'completato').length}
              </div>
              <div className="text-sm text-gray-600">Completati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.priorita === 'urgente' && t.stato !== 'completato').length}
              </div>
              <div className="text-sm text-gray-600">Urgenti</div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div 
              key={task.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              className={`card card-hover group overflow-hidden border-l-4 ${
                task.completato ? 'opacity-75' : ''
              }`}
              style={{ borderLeftColor: task.colore }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTypeIcon(task.tipo)}</span>
                      <span className="text-lg">{getPriorityIcon(task.priorita)}</span>
                      <h3 className={`text-lg font-medium ${task.completato ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.titolo}
                      </h3>
                    </div>
                    
                    {task.descrizione && (
                      <p className="text-gray-600 mb-3">{task.descrizione}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
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

                  <div className="flex items-center gap-2 ml-4">
                    {/* Priority Badge */}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priorita)}`}>
                      {task.priorita}
                    </span>

                    {/* Status Badge */}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.stato)}`}>
                      {task.stato.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
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
      </main>
    </div>
  )
}