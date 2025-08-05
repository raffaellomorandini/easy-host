'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
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
  PhoneOff
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

export default function LeadsPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'lead' | 'cliente_attesa' | 'cliente_confermato'>('all')
  const [contactFilter, setContactFilter] = useState<'all' | 'contattato' | 'non_contattato'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (session) {
      fetchLeads()
    }
  }, [session])

  useEffect(() => {
    filterLeads()
  }, [leads, filter, contactFilter, search])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = leads

    if (filter !== 'all') {
      filtered = filtered.filter(lead => lead.status === filter)
    }

    if (contactFilter !== 'all') {
      filtered = filtered.filter(lead => 
        contactFilter === 'contattato' ? lead.contattato : !lead.contattato
      )
    }

    if (search) {
      filtered = filtered.filter(lead => 
        lead.nome.toLowerCase().includes(search.toLowerCase()) ||
        lead.localita.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase()) ||
        lead.telefono?.includes(search)
      )
    }

    setFilteredLeads(filtered)
  }

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      })

      if (response.ok) {
        fetchLeads() // Ricarica i dati
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
        fetchLeads()
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
        fetchLeads() // Ricarica i dati
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'Cliente Confermato'
      case 'cliente_attesa': return 'Cliente in Attesa'
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
            {leads.length} leads totali • {leads.filter(l => l.status === 'lead').length} nuove • {leads.filter(l => l.status === 'cliente_attesa').length} in attesa • {leads.filter(l => l.status === 'cliente_confermato').length} confermati
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca per nome, località, email o telefono..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input pl-10"
                  />
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
                      { key: 'all', label: 'Tutti', count: leads.length, color: 'gray' },
                      { key: 'lead', label: 'Leads', count: leads.filter(l => l.status === 'lead').length, color: 'blue' },
                      { key: 'cliente_attesa', label: 'In Attesa', count: leads.filter(l => l.status === 'cliente_attesa').length, color: 'yellow' },
                      { key: 'cliente_confermato', label: 'Confermati', count: leads.filter(l => l.status === 'cliente_confermato').length, color: 'green' }
                    ].map(({ key, label, count, color }) => (
                      <Button
                        key={key}
                        onClick={() => setFilter(key as any)}
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
                      { key: 'all', label: 'Tutti', count: leads.length, color: 'gray', icon: Users },
                      { key: 'contattato', label: 'Contattati', count: leads.filter(l => l.contattato).length, color: 'green', icon: PhoneCall },
                      { key: 'non_contattato', label: 'Non Contattati', count: leads.filter(l => !l.contattato).length, color: 'red', icon: PhoneOff }
                    ].map(({ key, label, count, color, icon: Icon }) => (
                      <Button
                        key={key}
                        onClick={() => setContactFilter(key as any)}
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
          {filteredLeads.map((lead, index) => (
            <motion.div 
              key={lead.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
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
                <div className="flex gap-2 mb-3">
                  {lead.status === 'lead' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLeadStatus(lead.id, 'cliente_attesa')}
                      className="text-xs"
                    >
                      → In Attesa
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
            </motion.div>
          ))}
        </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
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
                  {search || filter !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca per trovare le leads che stai cercando.' 
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