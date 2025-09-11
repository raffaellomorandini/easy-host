'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle, 
  X,
  Filter,
  Search,
  CalendarDays,
  AlertCircle,
  Phone,
  Mail,
  Edit,
  Eye,
  Trash2,
  Star,
  TrendingUp,
  ExternalLink
} from 'lucide-react'

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

export default function AppuntamentiPage() {
  const { data: session } = useSession()
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [filteredAppuntamenti, setFilteredAppuntamenti] = useState<Appuntamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'overdue'>('all')
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; appuntamento: Appuntamento | null }>({
    isOpen: false,
    appuntamento: null
  })
  const [deleting, setDeleting] = useState(false)
  const [editModal, setEditModal] = useState<{ isOpen: boolean; appuntamento: Appuntamento | null }>({
    isOpen: false,
    appuntamento: null
  })
  const [updating, setUpdating] = useState(false)
  const [selectedAppForView, setSelectedAppForView] = useState<Appuntamento | null>(null)

  useEffect(() => {
    if (session) {
      fetchAppuntamenti()
    }
  }, [session])

  useEffect(() => {
    filterAppuntamenti()
  }, [appuntamenti, filter, search])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteModal.isOpen) {
          handleDeleteCancel()
        } else if (editModal.isOpen) {
          handleEditCancel()
        }
      }
    }

    if (deleteModal.isOpen || editModal.isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Previene lo scroll del body
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [deleteModal.isOpen, editModal.isOpen])

  const fetchAppuntamenti = async () => {
    try {
      const response = await fetch('/api/appuntamenti')
      if (response.ok) {
        const data = await response.json()
        setAppuntamenti(data)
      }
    } catch (error) {
      console.error('Error fetching appuntamenti:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppuntamenti = () => {
    let filtered = appuntamenti
    const now = new Date()

    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(a => !a.completato && new Date(a.data) >= now)
        break
      case 'completed':
        filtered = filtered.filter(a => a.completato)
        break
      case 'overdue':
        filtered = filtered.filter(a => !a.completato && new Date(a.data) < now)
        break
    }

    // Ordina per data
    filtered.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    setFilteredAppuntamenti(filtered)
  }

  const toggleCompletato = async (appuntamentoId: number, completato: boolean) => {
    try {
      const response = await fetch('/api/appuntamenti', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appuntamentoId, completato: !completato })
      })

      if (response.ok) {
        fetchAppuntamenti()
        toast.success(completato ? 'Appuntamento riaperto!' : 'Appuntamento completato!')
      } else {
        toast.error('Errore durante l\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating appuntamento:', error)
      toast.error('Errore durante l\'aggiornamento')
    }
  }

  const handleDeleteClick = (appuntamento: Appuntamento) => {
    setDeleteModal({ isOpen: true, appuntamento })
  }

  const handleEditClick = (appuntamento: Appuntamento) => {
    setEditModal({ isOpen: true, appuntamento })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal.appuntamento) return

    const formData = new FormData(e.target as HTMLFormElement)
    const updatedData = {
      id: editModal.appuntamento.id,
      data: new Date(formData.get('data') as string).toISOString(),
      tipo: formData.get('tipo') as string,
      luogo: formData.get('luogo') as string || null,
      note: formData.get('note') as string || null,
      completato: Boolean(formData.get('completato'))
    }

    setUpdating(true)
    try {
      const response = await fetch('/api/appuntamenti', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        fetchAppuntamenti()
        toast.success('Appuntamento aggiornato con successo!')
        setEditModal({ isOpen: false, appuntamento: null })
      } else {
        const errorData = await response.json()
        toast.error(`Errore durante l'aggiornamento: ${errorData.error || 'Errore sconosciuto'}`)
      }
    } catch (error) {
      console.error('Error updating appuntamento:', error)
      toast.error('Errore durante l\'aggiornamento')
    } finally {
      setUpdating(false)
    }
  }

  const handleEditCancel = () => {
    setEditModal({ isOpen: false, appuntamento: null })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.appuntamento) return

    setDeleting(true)
    try {
      const response = await fetch('/api/appuntamenti', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteModal.appuntamento.id })
      })

      if (response.ok) {
        fetchAppuntamenti()
        toast.success('Appuntamento eliminato con successo!')
        setDeleteModal({ isOpen: false, appuntamento: null })
      } else {
        const errorData = await response.json()
        toast.error(`Errore durante l'eliminazione: ${errorData.error || 'Errore sconosciuto'}`)
      }
    } catch (error) {
      console.error('Error deleting appuntamento:', error)
      toast.error('Errore durante l\'eliminazione')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, appuntamento: null })
  }

  const getStatusInfo = (appuntamento: Appuntamento) => {
    const now = new Date()
    const dataAppuntamento = new Date(appuntamento.data)
    
    if (appuntamento.completato) {
      return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Completato', icon: CheckCircle }
    } else if (dataAppuntamento < now) {
      return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Scaduto', icon: X }
    } else {
      return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Programmato', icon: Clock }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Caricamento appuntamenti...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Appuntamenti</h1>
          <p className="text-gray-600 mt-1">
            {appuntamenti.length} appuntamenti totali • {appuntamenti.filter(a => !a.completato && new Date(a.data) >= new Date()).length} prossimi • {appuntamenti.filter(a => a.completato).length} completati
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/calendario">
            <Button className="btn-secondary">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
                </Button>
              </Link>
            <Link href="/dashboard/appuntamenti/new">
            <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Appuntamento
              </Button>
            </Link>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Totale", value: appuntamenti.length, icon: Calendar, color: "blue", change: "+12%" },
            { title: "Prossimi", value: appuntamenti.filter(a => !a.completato && new Date(a.data) >= new Date()).length, icon: Clock, color: "yellow", change: "+8%" },
            { title: "Completati", value: appuntamenti.filter(a => a.completato).length, icon: CheckCircle, color: "green", change: "+15%" },
            { title: "Scaduti", value: appuntamenti.filter(a => !a.completato && new Date(a.data) < new Date()).length, icon: X, color: "red", change: "-5%" }
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
                    stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    stat.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                    stat.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
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

      {/* Advanced Filters */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card mb-6"
      >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ricerca appuntamenti
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca per cliente, tipo, luogo o note..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtra per stato
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'Tutti', count: appuntamenti.length, color: 'gray', icon: CalendarDays },
                    { key: 'upcoming', label: 'Prossimi', count: appuntamenti.filter(a => !a.completato && new Date(a.data) >= new Date()).length, color: 'blue', icon: Clock },
                    { key: 'completed', label: 'Completati', count: appuntamenti.filter(a => a.completato).length, color: 'green', icon: CheckCircle },
                    { key: 'overdue', label: 'Scaduti', count: appuntamenti.filter(a => !a.completato && new Date(a.data) < new Date()).length, color: 'red', icon: AlertCircle }
                  ].map(({ key, label, count, color, icon: Icon }) => (
            <Button
                      key={key}
                      onClick={() => setFilter(key as any)}
              size="sm"
                      className={`relative flex items-center gap-2 ${
                        filter === key 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label} 
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        filter === key 
                          ? 'bg-white/20 text-white' 
                          : `bg-${color}-100 text-${color}-700`
                      }`}>
                        {count}
                      </span>
            </Button>
                  ))}
                </div>
              </div>
          </div>
        </div>
        </motion.div>

        {/* Appuntamenti List */}
        <div className="space-y-4">
          {filteredAppuntamenti.map((appuntamento, index) => {
            const isOverdue = !appuntamento.completato && new Date(appuntamento.data) < new Date()
            const isUpcoming = !appuntamento.completato && new Date(appuntamento.data) >= new Date()
            
            return (
              <motion.div 
                key={appuntamento.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                className={`card card-hover group overflow-hidden border-l-4 ${
                  appuntamento.completato ? 'opacity-75' : ''
                }`}
                style={{ borderLeftColor: isOverdue ? '#ef4444' : appuntamento.completato ? '#10b981' : '#3b82f6' }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
                            appuntamento.completato 
                              ? 'bg-gradient-to-br from-green-500 to-green-600' 
                              : isOverdue 
                              ? 'bg-gradient-to-br from-red-500 to-red-600' 
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {appuntamento.completato ? (
                              <CheckCircle className="h-6 w-6 text-white" />
                            ) : isOverdue ? (
                              <AlertCircle className="h-6 w-6 text-white" />
                            ) : (
                              <Calendar className="h-6 w-6 text-white" />
                            )}
                          </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {appuntamento.leadNome} - {appuntamento.tipo}
                          </h3>
                            <span 
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                appuntamento.completato 
                                  ? 'bg-green-100 text-green-800' 
                                  : isOverdue 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {appuntamento.completato ? '✅ Completato' : isOverdue ? '⚠️ Scaduto' : '📅 In programma'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(appuntamento.data).toLocaleDateString('it-IT', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(appuntamento.data).toLocaleTimeString('it-IT', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {appuntamento.luogo && (
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-50">
                              <MapPin className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Luogo</p>
                              <p className="text-sm text-gray-500">{appuntamento.luogo}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-50">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Cliente</p>
                            <p className="text-sm text-gray-500">{appuntamento.leadLocalita}</p>
                          </div>
                        </div>
                      </div>

                      {appuntamento.note && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-3 text-sm text-gray-700 mb-4 border border-gray-200">
                          <p className="font-medium text-gray-900 mb-1">Note:</p>
                          {appuntamento.note}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appuntamento.completato}
                            onChange={() => toggleCompletato(appuntamento.id, appuntamento.completato)}
                            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <span className={`font-medium transition-colors ${
                            appuntamento.completato ? 'text-green-700' : 'text-gray-600 group-hover:text-gray-900'
                          }`}>
                            {appuntamento.completato ? '✅ Completato' : 'Segna come completato'}
                          </span>
                        </label>

                        <div className="space-y-3">
                          {/* Status Action Button */}
                          <Button
                            size="sm"
                            onClick={() => toggleCompletato(appuntamento.id, appuntamento.completato)}
                            className={`w-full ${
                              appuntamento.completato 
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {appuntamento.completato ? (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Riapri Appuntamento
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completa Appuntamento
                              </>
                            )}
                          </Button>

                          {/* Management Buttons */}
                          <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/dashboard/appuntamenti/${appuntamento.id}`}>
                              <Button 
                                className="btn-secondary group/btn w-full"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                                Dettagli
                              </Button>
                            </Link>
                            <Link href={`/dashboard/leads/${appuntamento.leadId}`}>
                              <Button className="btn-secondary group/btn w-full" size="sm">
                                <MapPin className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                                Lead
                              </Button>
                            </Link>
                            <Link href={`/dashboard/appuntamenti/${appuntamento.id}`}>
                              <Button 
                                className="btn-secondary group/btn w-full"
                                size="sm"
                              >
                                <Edit className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                                Modifica
                              </Button>
                            </Link>
                            <Button 
                              onClick={() => handleDeleteClick(appuntamento)}
                              className="btn-danger group/btn"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                              Elimina
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAppuntamenti.length === 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16"
          >
            <div className="card max-w-md mx-auto">
              <div className="p-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                  <CalendarDays className="h-8 w-8 text-white" />
            </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {filter !== 'all' ? 'Nessun appuntamento trovato' : 'Inizia a programmare'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter !== 'all' 
                    ? 'Prova a modificare i filtri per trovare gli appuntamenti che stai cercando.' 
                    : 'Aggiungi il tuo primo appuntamento per iniziare a organizzare i tuoi incontri con i clienti.'
                  }
                </p>
                <div className="flex gap-3 justify-center">
            <Link href="/dashboard/appuntamenti/new">
                    <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                      {filter !== 'all' ? 'Nuovo Appuntamento' : 'Primo Appuntamento'}
                    </Button>
                  </Link>
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

        {/* Edit Modal */}
        {editModal.isOpen && editModal.appuntamento && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleEditCancel}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <Edit className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Modifica Appuntamento
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editModal.appuntamento.leadNome} - {editModal.appuntamento.leadLocalita}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="edit-data" className="block text-sm font-medium text-gray-700 mb-1">
                        Data e Ora *
                      </label>
                      <input
                        type="datetime-local"
                        id="edit-data"
                        name="data"
                        required
                        defaultValue={new Date(editModal.appuntamento.data).toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-tipo" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo di Appuntamento *
                      </label>
                      <select
                        id="edit-tipo"
                        name="tipo"
                        required
                        defaultValue={editModal.appuntamento.tipo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleziona tipo...</option>
                        <option value="Incontro conoscitivo">Incontro conoscitivo</option>
                        <option value="Incontro conoscitivo + sopralluogo">Incontro conoscitivo + sopralluogo</option>
                        <option value="Incontro di piacere">Incontro di piacere</option>
                        <option value="Firma contratto">Firma contratto</option>
                        <option value="Sistemazione immobile">Sistemazione immobile</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-luogo" className="block text-sm font-medium text-gray-700 mb-1">
                      Luogo
                    </label>
                    <input
                      type="text"
                      id="edit-luogo"
                      name="luogo"
                      defaultValue={editModal.appuntamento.luogo || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Es. Ufficio, Casa del cliente, Video chiamata, ecc."
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-note" className="block text-sm font-medium text-gray-700 mb-1">
                      Note e Dettagli
                    </label>
                    <textarea
                      id="edit-note"
                      name="note"
                      rows={4}
                      defaultValue={editModal.appuntamento.note || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Aggiungi note specifiche per questo appuntamento..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="completato"
                        defaultChecked={editModal.appuntamento.completato}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Appuntamento completato</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      onClick={handleEditCancel}
                      variant="outline"
                      disabled={updating}
                    >
                      Annulla
                    </Button>
                    <Button
                      type="submit"
                      disabled={updating}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Aggiornando...
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Aggiorna Appuntamento
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && deleteModal.appuntamento && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleDeleteCancel}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Elimina Appuntamento
                    </h3>
                    <p className="text-sm text-gray-500">
                      Questa azione non può essere annullata
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Cliente:</span> {deleteModal.appuntamento.leadNome}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Tipo:</span> {deleteModal.appuntamento.tipo}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Data:</span> {' '}
                    {new Date(deleteModal.appuntamento.data).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {deleteModal.appuntamento.luogo && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Luogo:</span> {deleteModal.appuntamento.luogo}
                    </p>
                  )}
                </div>

                <p className="text-gray-700 mb-6">
                  Sei sicuro di voler eliminare questo appuntamento? 
                  <span className="font-medium text-red-600"> Questa azione non può essere annullata.</span>
                </p>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleDeleteCancel}
                    variant="outline"
                    disabled={deleting}
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina Definitivamente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {selectedAppForView && (
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
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
                      selectedAppForView.completato 
                        ? 'bg-gradient-to-br from-green-500 to-green-600' 
                        : new Date(selectedAppForView.data) < new Date()
                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {selectedAppForView.completato ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : new Date(selectedAppForView.data) < new Date() ? (
                        <AlertCircle className="h-6 w-6 text-white" />
                      ) : (
                        <Calendar className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedAppForView.leadNome} - {selectedAppForView.tipo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          selectedAppForView.completato 
                            ? 'bg-green-100 text-green-800' 
                            : new Date(selectedAppForView.data) < new Date()
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedAppForView.completato ? '✅ Completato' : 
                           new Date(selectedAppForView.data) < new Date() ? '⚠️ Scaduto' : 
                           '📅 In programma'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAppForView(null)}
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
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Informazioni Appuntamento</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Cliente</span>
                          <span className="text-sm font-medium text-gray-900">{selectedAppForView.leadNome}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Località</span>
                          <span className="text-sm font-medium text-gray-900">{selectedAppForView.leadLocalita}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Tipo</span>
                          <span className="text-sm font-medium text-gray-900">{selectedAppForView.tipo}</span>
                        </div>
                        {selectedAppForView.luogo && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Luogo</span>
                            <span className="text-sm font-medium text-gray-900">{selectedAppForView.luogo}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Data e Ora</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">
                                {new Date(selectedAppForView.data).toLocaleDateString('it-IT', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-blue-700">
                                ore {new Date(selectedAppForView.data).toLocaleTimeString('it-IT', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Creato il {new Date(selectedAppForView.createdAt).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  {selectedAppForView.note && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Note</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedAppForView.note}</p>
                      </div>
                    </div>
                  )}

                  {/* Lead Association */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Lead Associata</h4>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">{selectedAppForView.leadNome}</p>
                          <p className="text-sm text-green-700">{selectedAppForView.leadLocalita}</p>
                        </div>
                        <Button
                          size="sm"
                          className="btn-secondary"
                          onClick={() => window.open(`/dashboard/leads/${selectedAppForView.leadId}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    {!selectedAppForView.completato && (
                      <Button
                        onClick={() => {
                          toggleCompletato(selectedAppForView.id, selectedAppForView.completato)
                          setSelectedAppForView(null)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completa Appuntamento
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        handleEditClick(selectedAppForView)
                        setSelectedAppForView(null)
                      }}
                      className="btn-secondary"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                  </div>
                  <Button
                    onClick={() => setSelectedAppForView(null)}
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