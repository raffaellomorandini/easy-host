'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  List, 
  Filter,
  Settings,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Eye,
  Edit3,
  Trash2,
  CheckSquare,
  Info,
  Circle,
  Square
} from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import { EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core'

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
  titolo: string
  descrizione?: string
  tipo: string
  priorita: string
  stato: string
  dataScadenza?: string
  completato: boolean
  colore: string
  leadNome?: string
  leadLocalita?: string
  leadStatus?: string
}

export default function CalendarioPage() {
  const { data: session } = useSession()
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [showFilters, setShowFilters] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const calendarRef = useRef<FullCalendar>(null)

  // Filtri
  const [filters, setFilters] = useState({
    showAppuntamenti: true,
    showTasks: true,
    showCompleted: false,
    showOverdue: true,
    showWithLead: true,
    showWithoutLead: true,
    priorita: 'all' as 'all' | 'bassa' | 'media' | 'alta' | 'urgente',
    tipoAppuntamento: 'all' as 'all' | 'Incontro conoscitivo' | 'Incontro conoscitivo + sopralluogo' | 'Incontro di piacere' | 'Firma contratto' | 'Sistemazione immobile',
    tipoTask: 'all' as 'all' | 'prospetti_da_fare' | 'chiamate_da_fare' | 'task_importanti' | 'task_generiche',
    search: ''
  })

  useEffect(() => {
    if (session) {
      fetchAppuntamenti()
      fetchTasks()
    }
  }, [session])

  const fetchAppuntamenti = async () => {
    try {
      const response = await fetch('/api/appuntamenti')
      if (response.ok) {
        const data = await response.json()
        setAppuntamenti(data)
      }
    } catch (error) {
      console.error('Error fetching appuntamenti:', error)
    }
  }

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

  const getCalendarEvents = (): EventInput[] => {
    const events: EventInput[] = []

    if (filters.showAppuntamenti) {
      appuntamenti
        .filter(app => {
          if (!filters.showCompleted && app.completato) return false
          if (!filters.showOverdue && !app.completato && new Date(app.data) < new Date()) return false
          if (filters.tipoAppuntamento !== 'all' && app.tipo !== filters.tipoAppuntamento) return false
          if (filters.search && !app.leadNome.toLowerCase().includes(filters.search.toLowerCase()) &&
              !app.tipo.toLowerCase().includes(filters.search.toLowerCase())) return false
          return true
        })
        .forEach(app => {
          events.push({
            id: `app-${app.id}`,
            title: `${app.leadNome} - ${app.tipo}`,
            start: app.data,
            backgroundColor: app.completato ? '#10b981' : '#3b82f6',
            borderColor: app.completato ? '#059669' : '#2563eb',
            extendedProps: {
              type: 'appuntamento',
              data: app
            }
          })
        })
    }

    if (filters.showTasks) {
      tasks
        .filter(task => {
          if (!filters.showCompleted && task.completato) return false
          if (filters.priorita !== 'all' && task.priorita !== filters.priorita) return false
          if (filters.tipoTask !== 'all' && task.tipo !== filters.tipoTask) return false
          if (!filters.showWithLead && task.leadNome) return false
          if (!filters.showWithoutLead && !task.leadNome) return false
          if (filters.search && !task.titolo.toLowerCase().includes(filters.search.toLowerCase()) &&
              !(task.leadNome && task.leadNome.toLowerCase().includes(filters.search.toLowerCase()))) return false
          return true
        })
        .forEach(task => {
          if (task.dataScadenza) {
            events.push({
              id: `task-${task.id}`,
              title: task.titolo,
              start: task.dataScadenza,
              backgroundColor: task.colore,
              borderColor: task.colore,
              extendedProps: {
                type: 'task',
                data: task
              }
            })
          }
        })
    }

    return events
  }

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info.event)
    setShowEventModal(true)
  }

  const handleDateSelect = (info: DateSelectArg) => {
    // TODO: Implementare creazione nuovo evento
    console.log('Selected date:', info.start)
  }

  const handleEventDrop = async (info: any) => {
    const event = info.event
    const newDate = event.start
    const eventType = event.extendedProps?.type
    const eventData = event.extendedProps?.data

    try {
      if (eventType === 'appuntamento') {
        const response = await fetch('/api/appuntamenti', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: eventData.id, data: newDate.toISOString().slice(0, 19) })
        })
        if (response.ok) {
          toast.success('Appuntamento spostato!')
          fetchAppuntamenti()
        }
      } else if (eventType === 'task') {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: eventData.id, dataScadenza: newDate.toISOString().slice(0, 19) })
        })
        if (response.ok) {
          toast.success('Task spostato!')
          fetchTasks()
        }
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Errore durante lo spostamento')
      info.revert()
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

  const handleEditEvent = (event: any) => {
    const eventType = event.extendedProps?.type
    const eventData = event.extendedProps?.data
    
    if (eventType === 'appuntamento') {
      // Reindirizza alla pagina di modifica appuntamenti
      window.location.href = `/dashboard/appuntamenti`
    } else if (eventType === 'task') {
      // Reindirizza alla pagina di modifica task
      window.location.href = `/dashboard/tasks`
    }
    setShowEventModal(false)
  }

  const handleDeleteEvent = async (event: any) => {
    const eventType = event.extendedProps?.type
    const eventData = event.extendedProps?.data
    
    if (!eventData?.id) return
    
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare ${eventType === 'appuntamento' ? "l'appuntamento" : 'il task'} "${event.title}"?`
    )
    
    if (!confirmed) return
    
    try {
      const endpoint = eventType === 'appuntamento' ? '/api/appuntamenti' : '/api/tasks'
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventData.id })
      })
      
      if (response.ok) {
        toast.success(`${eventType === 'appuntamento' ? 'Appuntamento' : 'Task'} eliminato con successo!`)
        setShowEventModal(false)
        // Ricarica i dati
        if (eventType === 'appuntamento') {
          fetchAppuntamenti()
        } else {
          fetchTasks()
        }
      } else {
        toast.error('Errore durante l\'eliminazione')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Errore durante l\'eliminazione')
    }
  }

  const exportCalendar = () => {
    const events = getCalendarEvents()
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Titolo,Data,Tipo\n" +
      events.map(e => `"${e.title}","${e.start}","${e.extendedProps?.type || 'evento'}"`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "calendario.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Calendario esportato!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Caricamento calendario...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario & Task Manager</h1>
          <p className="text-gray-600 mt-1">
            Vista unificata di appuntamenti e task • {getCalendarEvents().length} eventi totali
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`${showFilters ? 'btn-primary' : 'btn-secondary'} group`}
          >
            <Filter className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            {showFilters ? 'Nascondi Filtri' : 'Mostra Filtri'}
          </Button>
          <Button onClick={exportCalendar} className="btn-secondary group">
            <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Esporta CSV
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.open('/dashboard/appuntamenti/new', '_blank')} 
              className="btn-secondary group"
            >
              <CalendarIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Appuntamento
            </Button>
            <Button 
              onClick={() => window.open('/dashboard/tasks', '_blank')} 
              className="btn-primary group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Nuovo Task
            </Button>
          </div>
        </div>
      </motion.div>

      {/* View Toggle & Controls */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
            <Button
              onClick={() => setView('calendar')}
              size="sm"
              className={`${view === 'calendar' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600 hover:text-gray-900'} transition-all duration-200`}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendario
            </Button>
            <Button
              onClick={() => setView('list')}
              size="sm"
              className={`${view === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600 hover:text-gray-900'} transition-all duration-200`}
            >
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
          </div>

          {/* Calendar View Controls */}
          {view === 'calendar' && (
            <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <Button
                onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')}
                size="sm"
                className="btn-secondary"
              >
                📅 Mese
              </Button>
              <Button
                onClick={() => calendarRef.current?.getApi().changeView('timeGridWeek')}
                size="sm"
                className="btn-secondary"
              >
                📊 Settimana
              </Button>
              <Button
                onClick={() => calendarRef.current?.getApi().changeView('timeGridDay')}
                size="sm"
                className="btn-secondary"
              >
                🗓️ Giorno
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{appuntamenti.length} Appuntamenti</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>{tasks.length} Tasks</span>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="card mb-6"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Legenda Colori</h3>
            </div>
            <div className="text-sm text-gray-500">
              {getCalendarEvents().length} eventi visualizzati
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Appuntamenti */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">📅 Appuntamenti</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Programmati</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-green-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Completati</span>
                </div>
              </div>
            </div>

            {/* Tasks per Priorità */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">🎯 Task per Priorità</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-red-600 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Urgenti</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-orange-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Alta</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-yellow-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Media</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-green-600 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Bassa</span>
                </div>
              </div>
            </div>

            {/* Tasks per Tipo */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Task per Tipo</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-purple-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Prospetti</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-blue-600 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Chiamate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-red-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Importanti</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-gray-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700">Generiche</span>
                </div>
              </div>
            </div>

            {/* Collegamenti */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">🔗 Collegamenti</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Circle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Con Lead</span>
                </div>
                <div className="flex items-center gap-3">
                  <Square className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Senza Lead</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="card mb-6 overflow-hidden"
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cerca eventi</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipi di evento</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showAppuntamenti}
                      onChange={(e) => setFilters(prev => ({ ...prev, showAppuntamenti: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Appuntamenti</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showTasks}
                      onChange={(e) => setFilters(prev => ({ ...prev, showTasks: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Tasks</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorità Task</label>
                <select
                  value={filters.priorita}
                  onChange={(e) => setFilters(prev => ({ ...prev, priorita: e.target.value as any }))}
                  className="form-input"
                >
                  <option value="all">Tutte</option>
                  <option value="bassa">Bassa</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stati eventi</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showCompleted}
                      onChange={(e) => setFilters(prev => ({ ...prev, showCompleted: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Includi completati</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showOverdue}
                      onChange={(e) => setFilters(prev => ({ ...prev, showOverdue: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Includi scaduti</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Associazione Lead</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showWithLead}
                      onChange={(e) => setFilters(prev => ({ ...prev, showWithLead: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Con lead associata</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showWithoutLead}
                      onChange={(e) => setFilters(prev => ({ ...prev, showWithoutLead: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Senza lead</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Appuntamento</label>
                <select
                  value={filters.tipoAppuntamento}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipoAppuntamento: e.target.value as any }))}
                  className="form-input text-sm"
                >
                  <option value="all">Tutti i tipi</option>
                  <option value="Incontro conoscitivo">Incontro conoscitivo</option>
                  <option value="Incontro conoscitivo + sopralluogo">Incontro + sopralluogo</option>
                  <option value="Incontro di piacere">Incontro di piacere</option>
                  <option value="Firma contratto">Firma contratto</option>
                  <option value="Sistemazione immobile">Sistemazione immobile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Task</label>
                <select
                  value={filters.tipoTask}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipoTask: e.target.value as any }))}
                  className="form-input text-sm"
                >
                  <option value="all">Tutti i tipi</option>
                  <option value="prospetti_da_fare">Prospetti da fare</option>
                  <option value="chiamate_da_fare">Chiamate da fare</option>
                  <option value="task_importanti">Task importanti</option>
                  <option value="task_generiche">Task generiche</option>
                </select>
              </div>
            </div>
            
            {/* Reset Filters Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button 
                onClick={() => setFilters({
                  showAppuntamenti: true,
                  showTasks: true,
                  showCompleted: false,
                  showOverdue: true,
                  showWithLead: true,
                  showWithoutLead: true,
                  priorita: 'all',
                  tipoAppuntamento: 'all',
                  tipoTask: 'all',
                  search: ''
                })}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filtri
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Calendar Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="card"
      >
        <div className="p-6">
          {view === 'calendar' ? (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              events={getCalendarEvents()}
              eventClick={handleEventClick}
              selectable={true}
              selectMirror={true}
              select={handleDateSelect}
              editable={true}
              droppable={true}
              eventDrop={handleEventDrop}
              height="auto"
              locale="it"
              firstDay={1}
              eventDisplay="block"
              dayMaxEventRows={4}
              moreLinkText="altri"
              buttonText={{
                today: 'Oggi',
                month: 'Mese',
                week: 'Settimana',
                day: 'Giorno',
                list: 'Lista'
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              allDayText="Tutto il giorno"
              noEventsText="Nessun evento"
              eventClassNames="cursor-pointer transition-all duration-200 hover:scale-105"
            />
          ) : (
            <div className="space-y-4">
              {getCalendarEvents().map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: event.backgroundColor }}
                    />
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.start as string).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="btn-secondary">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="btn-secondary">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedEvent.extendedProps?.type === 'appuntamento' ? (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Dettagli Appuntamento</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Cliente:</strong> {selectedEvent.extendedProps?.data?.leadNome}</p>
                      <p><strong>Località:</strong> {selectedEvent.extendedProps?.data?.leadLocalita}</p>
                      <p><strong>Tipo:</strong> {selectedEvent.extendedProps?.data?.tipo}</p>
                      {selectedEvent.extendedProps?.data?.luogo && (
                        <p><strong>Luogo:</strong> {selectedEvent.extendedProps?.data?.luogo}</p>
                      )}
                      {selectedEvent.extendedProps?.data?.note && (
                        <p><strong>Note:</strong> {selectedEvent.extendedProps?.data?.note}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Dettagli Task</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Tipo:</strong> {getTaskTypeText(selectedEvent.extendedProps?.data?.tipo)}</p>
                      <p><strong>Priorità:</strong> {selectedEvent.extendedProps?.data?.priorita}</p>
                      <p><strong>Stato:</strong> {selectedEvent.extendedProps?.data?.stato}</p>
                      {selectedEvent.extendedProps?.data?.leadNome && (
                        <p><strong>Lead Associata:</strong> {selectedEvent.extendedProps?.data?.leadNome}
                          {selectedEvent.extendedProps?.data?.leadLocalita && (
                            <span> - {selectedEvent.extendedProps?.data?.leadLocalita}</span>
                          )}
                        </p>
                      )}
                      {selectedEvent.extendedProps?.data?.descrizione && (
                        <p><strong>Descrizione:</strong> {selectedEvent.extendedProps?.data?.descrizione}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => handleEditEvent(selectedEvent)}
                  className="btn-primary"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
                <Button 
                  onClick={() => handleDeleteEvent(selectedEvent)}
                  className="btn-danger"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}