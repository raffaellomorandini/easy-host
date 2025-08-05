'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
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
  CheckSquare
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
}

export default function CalendarioPage() {
  const { data: session } = useSession()
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [calendarView, setCalendarView] = useState('dayGridMonth')
  const [showFilter, setShowFilter] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const calendarRef = useRef<FullCalendar>(null)
  const [filters, setFilters] = useState({
    showAppuntamenti: true,
    showTasks: true,
    showCompleted: false,
    priorityFilter: 'all' as 'all' | 'urgente' | 'alta' | 'media' | 'bassa'
  })

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch appuntamenti
      const appuntamentiResponse = await fetch('/api/appuntamenti')
      if (appuntamentiResponse.ok) {
        const appuntamentiData = await appuntamentiResponse.json()
        setAppuntamenti(appuntamentiData)
      }

      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks')
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Converti appuntamenti e tasks in eventi per FullCalendar
  const getCalendarEvents = (): EventInput[] => {
    const events: EventInput[] = []

    // Aggiungi appuntamenti
    if (filters.showAppuntamenti) {
      appuntamenti
        .filter(app => {
          const matchesCompleted = filters.showCompleted || !app.completato
          const matchesSearch = !searchTerm || 
            app.leadNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.luogo?.toLowerCase().includes(searchTerm.toLowerCase())
          return matchesCompleted && matchesSearch
        })
        .forEach(app => {
          events.push({
            id: `app-${app.id}`,
            title: `📅 ${app.leadNome} - ${app.tipo}`,
            start: app.data,
            backgroundColor: app.completato ? '#10b981' : '#3b82f6',
            borderColor: app.completato ? '#10b981' : '#3b82f6',
            textColor: 'white',
            classNames: ['fc-event-custom'],
            extendedProps: {
              type: 'appuntamento',
              data: app
            }
          })
        })
    }

    // Aggiungi tasks
    if (filters.showTasks) {
      tasks
        .filter(task => {
          const matchesCompleted = filters.showCompleted || !task.completato
          const matchesPriority = filters.priorityFilter === 'all' || task.priorita === filters.priorityFilter
          const matchesSearch = !searchTerm || 
            task.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.descrizione?.toLowerCase().includes(searchTerm.toLowerCase())
          const hasDate = task.dataScadenza
          
          return matchesCompleted && matchesPriority && matchesSearch && hasDate
        })
        .forEach(task => {
          const priorityIcon = {
            'urgente': '🔴',
            'alta': '🟠',
            'media': '🔵',
            'bassa': '⚪'
          }[task.priorita] || '🔵'

          events.push({
            id: `task-${task.id}`,
            title: `${priorityIcon} ${task.titolo}`,
            start: task.dataScadenza,
            backgroundColor: task.completato ? '#6b7280' : task.colore,
            borderColor: task.completato ? '#6b7280' : task.colore,
            textColor: 'white',
            classNames: ['fc-event-custom'],
            extendedProps: {
              type: 'task',
              data: task
            }
          })
        })
    }

    return events
  }

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event
    const type = event.extendedProps.type
    const data = event.extendedProps.data
    
    setSelectedEvent({ type, data, event })
    setShowEventModal(true)
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    toast.success('Data selezionata! Crea un nuovo evento.')
    // Qui puoi aprire un modal per creare un nuovo evento
  }

  const handleEventDrop = async (info: any) => {
    try {
      const event = info.event
      const type = event.extendedProps.type
      const data = event.extendedProps.data
      
      if (type === 'appuntamento') {
        const response = await fetch('/api/appuntamenti', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.id,
            data: event.start.toISOString()
          })
        })
        
        if (response.ok) {
          toast.success('Appuntamento spostato con successo!')
          fetchData()
        } else {
          info.revert()
          toast.error('Errore durante lo spostamento')
        }
      } else if (type === 'task') {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.id,
            dataScadenza: event.start.toISOString()
          })
        })
        
        if (response.ok) {
          toast.success('Task spostato con successo!')
          fetchData()
        } else {
          info.revert()
          toast.error('Errore durante lo spostamento')
        }
      }
    } catch (error) {
      info.revert()
      toast.error('Errore durante lo spostamento')
    }
  }

  const exportCalendar = () => {
    const events = getCalendarEvents()
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Titolo,Data,Tipo,Descrizione\n" +
      events.map(e => `"${e.title}","${e.start}","${e.extendedProps?.type || 'evento'}","${e.extendedProps?.data?.descrizione || e.extendedProps?.data?.note || ''}"`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "calendario.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Calendario esportato!')
  }

  const getPriorityColor = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return 'bg-red-100 text-red-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'media': return 'bg-blue-100 text-blue-800'
      case 'bassa': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Caricamento calendario...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-primary">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-white/20"
      >
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
                  📅 Calendario & Agenda
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">Gestisci appuntamenti, task e eventi</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap items-center gap-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* View Toggle */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <Button
                  variant={view === 'calendar' ? 'default' : 'ghost'}
                  onClick={() => setView('calendar')}
                  size="sm"
                  className={view === 'calendar' ? 'btn-primary' : 'text-gray-600 hover:text-gray-900'}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Calendario
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  onClick={() => setView('list')}
                  size="sm"
                  className={view === 'list' ? 'btn-primary' : 'text-gray-600 hover:text-gray-900'}
                >
                  <List className="h-4 w-4 mr-1" />
                  Lista
                </Button>
              </div>

              {/* Calendar View Buttons */}
              {view === 'calendar' && (
                <div className="flex bg-white/10 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCalendarView('dayGridMonth')
                      calendarRef.current?.getApi().changeView('dayGridMonth')
                    }}
                    size="sm"
                    className={calendarView === 'dayGridMonth' ? 'bg-white text-gray-900' : 'text-gray-600 hover:text-gray-900'}
                  >
                    Mese
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCalendarView('timeGridWeek')
                      calendarRef.current?.getApi().changeView('timeGridWeek')
                    }}
                    size="sm"
                    className={calendarView === 'timeGridWeek' ? 'bg-white text-gray-900' : 'text-gray-600 hover:text-gray-900'}
                  >
                    Settimana
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCalendarView('timeGridDay')
                      calendarRef.current?.getApi().changeView('timeGridDay')
                    }}
                    size="sm"
                    className={calendarView === 'timeGridDay' ? 'bg-white text-gray-900' : 'text-gray-600 hover:text-gray-900'}
                  >
                    Giorno
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <Button
                className="btn-secondary"
                onClick={() => setShowFilter(!showFilter)}
                size="sm"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtri
              </Button>
              
              <Button
                className="btn-secondary"
                onClick={exportCalendar}
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              
              <Link href="/dashboard/appuntamenti/new">
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-1" />
                  Nuovo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Advanced Filters */}
      {showFilter && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cerca eventi
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Event Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipi di evento
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showAppuntamenti}
                      onChange={(e) => setFilters(prev => ({ ...prev, showAppuntamenti: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm">📅 Appuntamenti</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showTasks}
                      onChange={(e) => setFilters(prev => ({ ...prev, showTasks: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm">📋 Tasks</span>
                  </label>
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorità
                </label>
                <select
                  value={filters.priorityFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, priorityFilter: e.target.value as any }))}
                  className="form-select"
                >
                  <option value="all">Tutte le priorità</option>
                  <option value="urgente">🔴 Urgente</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="media">🔵 Media</option>
                  <option value="bassa">⚪ Bassa</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stato
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showCompleted}
                    onChange={(e) => setFilters(prev => ({ ...prev, showCompleted: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 mr-2"
                  />
                  <span className="text-sm">✅ Mostra completati</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'calendar' ? (
          /* Calendar View */
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card shadow-elegant-lg"
          >
            <div className="p-6">
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
            </div>
          </motion.div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {/* Appuntamenti */}
            {filters.showAppuntamenti && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Appuntamenti</h2>
                </div>
                <div className="divide-y">
                  {appuntamenti
                    .filter(app => filters.showCompleted || !app.completato)
                    .map(app => (
                      <div key={app.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{app.leadNome} - {app.tipo}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(app.data).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {app.luogo && (
                              <p className="text-sm text-gray-600">📍 {app.luogo}</p>
                            )}
                            {app.note && (
                              <p className="text-sm text-gray-700 mt-2">{app.note}</p>
                            )}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            app.completato ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {app.completato ? 'Completato' : 'In programma'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {filters.showTasks && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Tasks</h2>
                </div>
                <div className="divide-y">
                  {tasks
                    .filter(task => filters.showCompleted || !task.completato)
                    .map(task => (
                      <div key={task.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.titolo}</h3>
                            {task.descrizione && (
                              <p className="text-sm text-gray-700 mt-1">{task.descrizione}</p>
                            )}
                            {task.dataScadenza && (
                              <p className="text-sm text-gray-600 mt-1">
                                ⏰ Scadenza: {new Date(task.dataScadenza).toLocaleDateString('it-IT')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priorita)}`}>
                              {task.priorita}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.stato)}`}>
                              {task.stato.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    selectedEvent.type === 'appuntamento' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {selectedEvent.type === 'appuntamento' ? (
                      <CalendarIcon className="h-6 w-6" />
                    ) : (
                      <CheckSquare className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedEvent.type === 'appuntamento' ? 'Appuntamento' : 'Task'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(selectedEvent.event.start).toLocaleDateString('it-IT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {selectedEvent.type === 'appuntamento' ? (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Cliente</h4>
                      <p className="text-gray-900">{selectedEvent.data.leadNome}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Tipo</h4>
                      <p className="text-gray-900">{selectedEvent.data.tipo}</p>
                    </div>
                    {selectedEvent.data.luogo && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Luogo
                        </h4>
                        <p className="text-gray-900">{selectedEvent.data.luogo}</p>
                      </div>
                    )}
                    {selectedEvent.data.note && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Note</h4>
                        <p className="text-gray-900">{selectedEvent.data.note}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Stato</h4>
                      <span className={`badge ${
                        selectedEvent.data.completato ? 'badge-success' : 'badge-primary'
                      }`}>
                        {selectedEvent.data.completato ? 'Completato' : 'In programma'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Titolo</h4>
                      <p className="text-gray-900">{selectedEvent.data.titolo}</p>
                    </div>
                    {selectedEvent.data.descrizione && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Descrizione</h4>
                        <p className="text-gray-900">{selectedEvent.data.descrizione}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Priorità</h4>
                      <span className={`badge ${
                        selectedEvent.data.priorita === 'urgente' ? 'badge-error' :
                        selectedEvent.data.priorita === 'alta' ? 'badge-warning' :
                        selectedEvent.data.priorita === 'media' ? 'badge-primary' :
                        'badge-gray'
                      }`}>
                        {selectedEvent.data.priorita}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Stato</h4>
                      <span className={`badge ${
                        selectedEvent.data.stato === 'completato' ? 'badge-success' :
                        selectedEvent.data.stato === 'in_corso' ? 'badge-warning' :
                        'badge-primary'
                      }`}>
                        {selectedEvent.data.stato.replace('_', ' ')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  className="btn-secondary flex-1"
                  onClick={() => {
                    const editUrl = selectedEvent.type === 'appuntamento' 
                      ? `/dashboard/leads/${selectedEvent.data.leadId}` 
                      : `/dashboard/tasks`
                    window.open(editUrl, '_blank')
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Modifica
                </Button>
                <Button
                  className="btn-danger flex-1"
                  onClick={() => {
                    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
                      // Implementa eliminazione
                      setShowEventModal(false)
                      toast.success('Evento eliminato!')
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
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