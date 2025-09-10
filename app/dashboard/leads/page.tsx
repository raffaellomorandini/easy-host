'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  Trash2,
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MoreVertical,
  ExternalLink,
  PhoneCall,
  PhoneOff,
  X
} from 'lucide-react'

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

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  hasMore: boolean
  totalPages: number
}

export default function LeadsPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([]) // Per i conteggi dei filtri
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    hasMore: true,
    totalPages: 0
  })
  const [filter, setFilter] = useState<'all' | 'lead' | 'foto' | 'appuntamento' | 'ghost' | 'ricontattare' | 'cliente_attesa' | 'cliente_confermato'>('all')
  const [contactFilter, setContactFilter] = useState<'all' | 'contattato' | 'non_contattato'>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session) {
      fetchLeads(true) // Reset on first load
      fetchAllLeadsForCounts() // Per i conteggi dei filtri
    }
  }, [session])

  useEffect(() => {
    if (session) {
      fetchLeads(true) // Reset quando cambiano i filtri
    }
  }, [filter, contactFilter, search])

  // Intersection Observer per infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !loading && !loadingMore) {
          loadMoreLeads()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [pagination.hasMore, loading, loadingMore])

  const fetchLeads = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setLeads([])
      setPagination(prev => ({ ...prev, page: 1 }))
    }

    try {
      const params = new URLSearchParams({
        page: reset ? '1' : pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(filter !== 'all' && { status: filter }),
        ...(contactFilter !== 'all' && { contattato: contactFilter })
      })

      const response = await fetch(`/api/leads?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        if (reset) {
          setLeads(data.leads)
        } else {
          setLeads(prev => [...prev, ...data.leads])
        }
        
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreLeads = async () => {
    if (!pagination.hasMore || loadingMore) return
    
    setLoadingMore(true)
    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    
    try {
      const params = new URLSearchParams({
        page: (pagination.page + 1).toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(filter !== 'all' && { status: filter }),
        ...(contactFilter !== 'all' && { contattato: contactFilter })
      })

      const response = await fetch(`/api/leads?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLeads(prev => [...prev, ...data.leads])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error loading more leads:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const fetchAllLeadsForCounts = async () => {
    try {
      const response = await fetch('/api/leads?limit=1000') // Carica più leads per i conteggi
      if (response.ok) {
        const data = await response.json()
        setAllLeads(data.leads)
      }
    } catch (error) {
      console.error('Error fetching all leads for counts:', error)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
  }

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
  }

  const handleContactFilterChange = (newFilter: typeof contactFilter) => {
    setContactFilter(newFilter)
  }

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      })

      if (response.ok) {
        fetchLeads(true) // Reset per aggiornare i dati
        fetchAllLeadsForCounts() // Aggiorna i conteggi
        toast.success('Status aggiornato con successo!')
      } else {
        toast.error('Errore durante l\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      toast.error('Errore durante l\'aggiornamento')
    }
  }

  const toggleContattato = async (leadId: number, contattato: boolean) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, contattato: !contattato })
      })

      if (response.ok) {
        fetchLeads(true) // Reset per aggiornare i dati
        fetchAllLeadsForCounts() // Aggiorna i conteggi
        toast.success('Contatto aggiornato!')
      } else {
        toast.error('Errore durante l\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      toast.error('Errore durante l\'aggiornamento')
    }
  }

  const deleteLead = async (leadId: number, leadName: string) => {
    // Conferma eliminazione
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare la lead "${leadName}"?\n\nQuesta azione eliminerà anche tutti gli appuntamenti associati e non può essere annullata.`
    )
    
    if (!confirmed) return

    try {
      const response = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId })
      })

      if (response.ok) {
        fetchLeads(true) // Reset per aggiornare i dati
        fetchAllLeadsForCounts() // Aggiorna i conteggi
        toast.success('Lead eliminata con successo!')
      } else {
        const error = await response.json()
        toast.error(`Errore durante l'eliminazione: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('Errore durante l\'eliminazione della lead')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'bg-green-100 text-green-800'
      case 'cliente_attesa': return 'bg-yellow-100 text-yellow-800'
      case 'foto': return 'bg-purple-100 text-purple-800'
      case 'appuntamento': return 'bg-blue-100 text-blue-800'
      case 'ghost': return 'bg-red-100 text-red-800'
      case 'ricontattare': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Caricamento leads...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Leads</h1>
          <p className="text-gray-600 mt-1">
            {allLeads.length} leads totali • {allLeads.filter(l => l.status === 'lead').length} nuove • {allLeads.filter(l => l.status === 'foto').length} foto • {allLeads.filter(l => l.status === 'appuntamento').length} appuntamento • {allLeads.filter(l => l.status === 'cliente_confermato').length} confermati
          </p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Lead
          </Button>
        </Link>
      </div>
      {/* Advanced Filters */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card mb-6"
      >
          <div className="p-6">
            <div className="flex flex-col gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ricerca avanzata
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cerca per nome, località, email o telefono..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="form-input pl-10"
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtra per stato
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'all', label: 'Tutti', count: allLeads.length, color: 'gray' },
                      { key: 'lead', label: 'Leads', count: allLeads.filter(l => l.status === 'lead').length, color: 'blue' },
                      { key: 'foto', label: 'Foto', count: allLeads.filter(l => l.status === 'foto').length, color: 'purple' },
                      { key: 'appuntamento', label: 'Appuntamento', count: allLeads.filter(l => l.status === 'appuntamento').length, color: 'blue' },
                      { key: 'ghost', label: 'Ghost', count: allLeads.filter(l => l.status === 'ghost').length, color: 'red' },
                      { key: 'ricontattare', label: 'Ricontattare', count: allLeads.filter(l => l.status === 'ricontattare').length, color: 'orange' },
                      { key: 'cliente_attesa', label: 'In Attesa', count: allLeads.filter(l => l.status === 'cliente_attesa').length, color: 'yellow' },
                      { key: 'cliente_confermato', label: 'Confermati', count: allLeads.filter(l => l.status === 'cliente_confermato').length, color: 'green' }
                    ].map(({ key, label, count, color }) => (
                      <Button
                        key={key}
                        onClick={() => handleFilterChange(key as any)}
                        size="sm"
                        className={`relative ${
                          filter === key 
                            ? 'btn-primary' 
                            : 'btn-secondary'
                        }`}
                      >
                        {label} 
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
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

                {/* Contact Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stato contatto
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'all', label: 'Tutti', count: allLeads.length, color: 'gray', icon: Users },
                      { key: 'contattato', label: 'Contattati', count: allLeads.filter(l => l.contattato).length, color: 'green', icon: PhoneCall },
                      { key: 'non_contattato', label: 'Non Contattati', count: allLeads.filter(l => !l.contattato).length, color: 'red', icon: PhoneOff }
                    ].map(({ key, label, count, color, icon: Icon }) => (
                      <Button
                        key={key}
                        onClick={() => handleContactFilterChange(key as any)}
                        size="sm"
                        className={`relative ${
                          contactFilter === key 
                            ? 'btn-primary' 
                            : 'btn-secondary'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {label} 
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          contactFilter === key 
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
          </div>
        </motion.div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead, index) => (
            <div 
              key={lead.id}
              className="card card-hover group cursor-pointer overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-lg">
                        {lead.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {lead.nome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge ${getStatusColor(lead.status)}`}>
                          {getStatusText(lead.status)}
                        </span>
                        {lead.contattato && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Location & Rooms */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lead.localita}</p>
                      <p className="text-sm text-gray-500">{lead.camere} camera{lead.camere > 1 ? 'e' : ''}</p>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="flex items-center gap-3">
                    {lead.telefono && (
                      <a 
                        href={`tel:${lead.telefono}`} 
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm font-medium">Chiama</span>
                      </a>
                    )}
                    
                    {lead.email && (
                      <a 
                        href={`mailto:${lead.email}`} 
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-medium">Email</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Note Preview */}
                {lead.note && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                    <div className="line-clamp-3">
                      {lead.note.length > 150 ? `${lead.note.substring(0, 150)}...` : lead.note}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center text-sm group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lead.contattato}
                      onChange={() => toggleContattato(lead.id, lead.contattato)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className={`font-medium transition-colors ${
                      lead.contattato ? 'text-green-700' : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                      {lead.contattato ? '✅ Contattato' : 'Da contattare'}
                    </span>
                  </label>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString('it-IT')}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {lead.status === 'lead' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'foto')}
                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700"
                      >
                        📸 Foto
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'appuntamento')}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700"
                      >
                        📅 Appuntamento
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'ghost')}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-700"
                      >
                        👻 Ghost
                      </Button>
                    </>
                  )}
                  {(lead.status === 'foto' || lead.status === 'appuntamento' || lead.status === 'ricontattare') && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'cliente_attesa')}
                        className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                      >
                        → In Attesa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'ricontattare')}
                        className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700"
                        disabled={lead.status === 'ricontattare'}
                      >
                        📞 Ricontattare
                      </Button>
                    </>
                  )}
                  {lead.status === 'ghost' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLeadStatus(lead.id, 'ricontattare')}
                      className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700"
                    >
                      📞 Ricontattare
                    </Button>
                  )}
                  {lead.status === 'cliente_attesa' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'lead')}
                        className="text-xs"
                      >
                        ← Lead
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateLeadStatus(lead.id, 'cliente_confermato')}
                        className="text-xs bg-green-600 hover:bg-green-700"
                      >
                        ✓ Conferma
                      </Button>
                    </>
                  )}
                  {lead.status === 'cliente_confermato' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLeadStatus(lead.id, 'cliente_attesa')}
                      className="text-xs"
                    >
                      ← In Attesa
                    </Button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/dashboard/leads/${lead.id}`} className="col-span-1">
                    <Button className="btn-secondary w-full group">
                      <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Dettagli
                    </Button>
                  </Link>
                  <Link href={`/dashboard/leads/${lead.id}/edit`} className="col-span-1">
                    <Button className="btn-secondary w-full group">
                      <Edit className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Modifica
                    </Button>
                  </Link>
                  <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`} className="col-span-1">
                    <Button className="btn-primary w-full group">
                      <Calendar className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Appuntamento
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => deleteLead(lead.id, lead.nome)}
                    className="btn-danger w-full group col-span-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Elimina
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            Caricamento altre leads...
          </div>
        </div>
      )}

      {/* Infinite Scroll Observer Target */}
      {pagination.hasMore && !loading && (
        <div ref={observerTarget} className="h-10 flex items-center justify-center">
          <div className="text-sm text-gray-500">Scorri per caricare altre leads...</div>
        </div>
      )}

      {/* Pagination Info */}
      {!loading && leads.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          Mostrati {leads.length} di {pagination.totalCount} leads totali
          {pagination.hasMore && (
            <span> • Pagina {pagination.page} di {pagination.totalPages}</span>
          )}
        </div>
      )}

      {/* Empty State */}
      {leads.length === 0 && !loading && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16"
          >
            <div className="card max-w-md mx-auto">
              <div className="p-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {search || filter !== 'all' ? 'Nessuna lead trovata' : 'Inizia la tua gestione leads'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {search || filter !== 'all' || contactFilter !== 'all'
                    ? 'Nessuna lead trovata con i filtri selezionati. Prova a modificare i criteri di ricerca.' 
                    : 'Aggiungi la tua prima lead per iniziare a gestire i tuoi contatti e clienti potenziali.'
                  }
                </p>
                <Link href="/dashboard/leads/new">
                  <Button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    {search || filter !== 'all' ? 'Aggiungi Nuova Lead' : 'Aggiungi Prima Lead'}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
      )}
    </div>
  )
}