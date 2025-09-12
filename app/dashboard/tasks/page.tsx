'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Target,
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

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

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  hasMore: boolean
  totalPages: number
}

function TasksPageContent() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    hasMore: true,
    totalPages: 0
  })
  const [selectedTaskForView, setSelectedTaskForView] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({
    stato: 'all' as 'all' | 'da_fare' | 'in_corso' | 'completato',
    priorita: 'all' as 'all' | 'bassa' | 'media' | 'alta' | 'urgente',
    tipo: 'all' as 'all' | 'prospetti_da_fare' | 'chiamate_da_fare' | 'task_importanti' | 'task_generiche'
  })

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session, pagination.page, filters.stato, filters.priorita, filters.tipo, search])

  useEffect(() => {
    // Reset alla pagina 1 quando cambiano i filtri
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [filters.stato, filters.priorita, filters.tipo, search])

  const fetchTasks = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(filters.stato !== 'all' && { stato: filters.stato }),
        ...(filters.priorita !== 'all' && { priorita: filters.priorita }),
        ...(filters.tipo !== 'all' && { tipo: filters.tipo })
      })

      const response = await fetch(`/api/tasks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
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
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare il task "${taskTitle}"?\n\nQuesta azione non può essere annullata.`
    )
    
    if (!confirmed) return

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
        const error = await response.json()
        toast.error(`Errore durante l'eliminazione: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Errore durante l\'eliminazione del task')
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

  const getPriorityColorClasses = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'bassa': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'completato': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_corso': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return AlertCircle
      case 'alta': return Star
      case 'media': return Clock
      case 'bassa': return CheckCircle
      default: return Clock
    }
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'prospetti_da_fare': return Target
      case 'chiamate_da_fare': return Phone
      case 'task_importanti': return Star
      case 'task_generiche': return CheckSquare
      default: return CheckSquare
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

  // Statistiche (mostrate per la pagina corrente)
  const taskCompletati = tasks.filter(t => t.stato === 'completato').length
  const taskInCorso = tasks.filter(t => t.stato === 'in_corso').length
  const taskDaFare = tasks.filter(t => t.stato === 'da_fare').length
  const tasksUrgenti = tasks.filter(t => t.priorita === 'urgente' && t.stato !== 'completato').length

  // Rimosso il loading generale - ora mostriamo sempre il layout

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <div className="text-gray-600 mt-1">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Caricamento statistiche...</span>
              </div>
            ) : (
              <span>{tasks.length} task totali • {taskDaFare} da fare • {taskInCorso} in corso • {taskCompletati} completati</span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/calendario">
            <Button className="btn-secondary">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Button>
          </Link>
          <Link href="/dashboard/tasks/new">
            <Button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Task
        </Button>
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card mb-6"
      >
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ricerca avanzata
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cerca per titolo, descrizione o lead..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="form-input w-full"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="btn-primary"
                  disabled={loading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Cerca
                </Button>
                {search && (
                  <Button
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                    }}
                    className="btn-secondary"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Totale", value: pagination.totalCount, icon: CheckSquare, color: "blue", change: "+12%" },
          { title: "Da Fare", value: taskDaFare, icon: Clock, color: "yellow", change: "+8%" },
          { title: "In Corso", value: taskInCorso, icon: Zap, color: "purple", change: "+15%" },
          { title: "Completati", value: taskCompletati, icon: CheckCircle, color: "green", change: "+22%" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
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
                  stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  stat.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  stat.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  'bg-gradient-to-br from-green-500 to-green-600'
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

      {/* Advanced Filters */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="card mb-6"
      >
        <div className="p-6">
          <div className="flex flex-col gap-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stato
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { key: 'all', label: 'Tutti', count: tasks.length },
                    { key: 'da_fare', label: 'Da fare', count: taskDaFare },
                    { key: 'in_corso', label: 'In corso', count: taskInCorso },
                    { key: 'completato', label: 'Completati', count: taskCompletati }
                  ].map(({ key, label, count }) => (
                    <Button
                      key={key}
                      onClick={() => setFilters(prev => ({ ...prev, stato: key as any }))}
                      size="sm"
                      className={`${
                        filters.stato === key 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      {label} ({count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorità
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { key: 'all', label: 'Tutte' },
                    { key: 'urgente', label: 'Urgente' },
                    { key: 'alta', label: 'Alta' },
                    { key: 'media', label: 'Media' },
                    { key: 'bassa', label: 'Bassa' }
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      onClick={() => setFilters(prev => ({ ...prev, priorita: key as any }))}
                      size="sm"
                      className={`${
                        filters.priorita === key 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { key: 'all', label: 'Tutti' },
                    { key: 'prospetti_da_fare', label: 'Prospetti' },
                    { key: 'chiamate_da_fare', label: 'Chiamate' },
                    { key: 'task_importanti', label: 'Importanti' },
                    { key: 'task_generiche', label: 'Generiche' }
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      onClick={() => setFilters(prev => ({ ...prev, tipo: key as any }))}
                      size="sm"
                      className={`${
                        filters.tipo === key 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton Loading Cards
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card card-hover animate-pulse">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                    <div>
                      <div className="h-5 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          tasks.map((task, index) => {
          const PriorityIcon = getPriorityIcon(task.priorita)
          const TypeIcon = getTypeIcon(task.tipo)
          const isOverdue = task.dataScadenza && new Date(task.dataScadenza) < new Date() && task.stato !== 'completato'
          
          return (
            <motion.div
              key={task.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              className={`card card-hover group overflow-hidden border-l-4 ${
                task.stato === 'completato' ? 'opacity-75' : ''
              }`}
              style={{ borderLeftColor: getPriorityColor(task.priorita) }}
            >
              <div className="p-6">
                {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center shadow-lg`}
                         style={{ backgroundColor: task.colore }}>
                      <TypeIcon className="h-6 w-6 text-white" />
                  </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {task.titolo}
                    </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPriorityColorClasses(task.priorita)}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {task.priorita}
                        </Badge>
                        <Badge className={getStatusColor(task.stato)}>
                          {task.stato === 'da_fare' ? 'Da fare' : 
                           task.stato === 'in_corso' ? 'In corso' : 
                           'Completato'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="font-medium">{getTaskTypeText(task.tipo)}</span>
              </div>

                  {task.dataScadenza && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Scadenza:</span>
                      <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(task.dataScadenza).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        {isOverdue && (
                          <span className="ml-1 text-red-500">⚠️</span>
                        )}
                    </span>
                    </div>
                  )}

                  {task.leadNome && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Lead:</span>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-600">{task.leadNome}</span>
                        {task.leadLocalita && (
                          <span className="text-gray-400">- {task.leadLocalita}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Task Description */}
                {task.descrizione && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4">
                    <div className="line-clamp-3">
                      {task.descrizione.length > 120 ? `${task.descrizione.substring(0, 120)}...` : task.descrizione}
                </div>
              </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {/* Status Quick Actions */}
                <div className="flex gap-2">
                    {task.stato === 'da_fare' && (
                      <Button
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'in_corso')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Inizia
                      </Button>
                    )}
                    {task.stato === 'in_corso' && (
                      <Button
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'completato')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Completa
                      </Button>
                  )}
                  {task.stato === 'completato' && (
                    <Button
                      size="sm"
                      onClick={() => updateTaskStatus(task.id, 'da_fare')}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        <Clock className="h-4 w-4 mr-1" />
                      Riapri
                    </Button>
                  )}
                </div>

                  {/* Management Actions */}
                  <div className="grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/tasks/${task.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-secondary group/btn w-full"
                      >
                        <Eye className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                        Dettagli
                      </Button>
                    </Link>
                    <Link href={`/dashboard/tasks/${task.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                        className="btn-secondary group/btn w-full"
                  >
                        <Edit className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                        Modifica
                  </Button>
                    </Link>
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
          )
        })
        )}
        </div>

        {/* Pagination */}
        {!loading && tasks.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
              Mostrati {tasks.length} di {pagination.totalCount} tasks totali • Pagina {pagination.page} di {pagination.totalPages}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNumber = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = pagination.page - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={pageNumber === pagination.page}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="cursor-pointer"
                      >
                        {pagination.totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                    className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !loading && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-16"
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <CardTitle>
                {search || filters.stato !== 'all' || filters.priorita !== 'all' || filters.tipo !== 'all' 
                  ? 'Nessun task trovato' 
                  : 'Inizia a organizzare il tuo lavoro'}
              </CardTitle>
              <CardDescription>
              {search || filters.stato !== 'all' || filters.priorita !== 'all' || filters.tipo !== 'all' 
                  ? 'Prova a modificare i filtri per trovare i task che stai cercando.' 
                  : 'Crea il tuo primo task per iniziare a organizzare e tracciare il tuo lavoro.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/tasks/new">
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  {search || filters.stato !== 'all' ? 'Nuovo Task' : 'Primo Task'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Task Details Modal */}
      {selectedTaskForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center shadow-lg`}
                       style={{ backgroundColor: selectedTaskForView.colore }}>
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedTaskForView.titolo}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColorClasses(selectedTaskForView.priorita)}>
                        {selectedTaskForView.priorita}
                      </Badge>
                      <Badge className={getStatusColor(selectedTaskForView.stato)}>
                        {selectedTaskForView.stato === 'da_fare' ? 'Da fare' : 
                         selectedTaskForView.stato === 'in_corso' ? 'In corso' : 
                         'Completato'}
                      </Badge>
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
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Informazioni Task</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Tipo</span>
                        <span className="text-sm font-medium text-gray-900">{getTaskTypeText(selectedTaskForView.tipo)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Priorità</span>
                        <Badge className={getPriorityColorClasses(selectedTaskForView.priorita)}>
                          {selectedTaskForView.priorita}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Stato</span>
                        <Badge className={getStatusColor(selectedTaskForView.stato)}>
                          {selectedTaskForView.stato === 'da_fare' ? 'Da fare' : 
                           selectedTaskForView.stato === 'in_corso' ? 'In corso' : 
                           'Completato'}
                        </Badge>
                      </div>
                      {selectedTaskForView.dataScadenza && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Scadenza</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedTaskForView.dataScadenza).toLocaleDateString('it-IT', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Date</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">Creato</p>
                            <p className="text-sm text-blue-700">
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
                      </div>
                      {selectedTaskForView.updatedAt !== selectedTaskForView.createdAt && (
                        <div className="text-xs text-gray-500">
                          Aggiornato il {new Date(selectedTaskForView.updatedAt).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedTaskForView.descrizione && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Descrizione</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedTaskForView.descrizione}</p>
                    </div>
                  </div>
                )}

                {/* Lead Association */}
                {selectedTaskForView.leadNome && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Lead Associata</h4>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">{selectedTaskForView.leadNome}</p>
                            {selectedTaskForView.leadLocalita && (
                              <p className="text-sm text-green-700">{selectedTaskForView.leadLocalita}</p>
                            )}
                          </div>
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
                  {selectedTaskForView.stato === 'da_fare' && (
                    <Button
                      onClick={() => {
                        updateTaskStatus(selectedTaskForView.id, 'in_corso')
                        setSelectedTaskForView(null)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Inizia Task
                    </Button>
                  )}
                  {selectedTaskForView.stato === 'in_corso' && (
                    <Button
                      onClick={() => {
                        updateTaskStatus(selectedTaskForView.id, 'completato')
                        setSelectedTaskForView(null)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completa Task
                    </Button>
                  )}
                  <Link href={`/dashboard/tasks/${selectedTaskForView.id}`}>
                    <Button className="btn-secondary">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                  </Link>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento...</div>
      </div>
    }>
      <TasksPageContent />
    </Suspense>
  )
}
