'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Eye, Phone, Mail, MapPin, Calendar, Plus, Filter, Search } from 'lucide-react'

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
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (session) {
      fetchLeads()
    }
  }, [session])

  useEffect(() => {
    filterLeads()
  }, [leads, filter, search])

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
      }
    } catch (error) {
      console.error('Error updating lead:', error)
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
      }
    } catch (error) {
      console.error('Error updating lead:', error)
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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Caricamento leads...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestione Leads
                </h1>
                <p className="text-gray-600">Visualizza e gestisci tutte le leads</p>
              </div>
            </div>
            <Link href="/dashboard/leads/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuova Lead
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cerca per nome, località, email o telefono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Tutti ({leads.length})
              </Button>
              <Button
                variant={filter === 'lead' ? 'default' : 'outline'}
                onClick={() => setFilter('lead')}
                size="sm"
              >
                Leads ({leads.filter(l => l.status === 'lead').length})
              </Button>
              <Button
                variant={filter === 'cliente_attesa' ? 'default' : 'outline'}
                onClick={() => setFilter('cliente_attesa')}
                size="sm"
              >
                In Attesa ({leads.filter(l => l.status === 'cliente_attesa').length})
              </Button>
              <Button
                variant={filter === 'cliente_confermato' ? 'default' : 'outline'}
                onClick={() => setFilter('cliente_confermato')}
                size="sm"
              >
                Confermati ({leads.filter(l => l.status === 'cliente_confermato').length})
              </Button>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{lead.nome}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                    {getStatusText(lead.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {lead.localita} • {lead.camere} camera{lead.camere > 1 ? 'e' : ''}
                  </div>
                  
                  {lead.telefono && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${lead.telefono}`} className="hover:text-blue-600">
                        {lead.telefono}
                      </a>
                    </div>
                  )}
                  
                  {lead.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${lead.email}`} className="hover:text-blue-600 truncate">
                        {lead.email}
                      </a>
                    </div>
                  )}
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
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={lead.contattato}
                      onChange={() => toggleContattato(lead.id, lead.contattato)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Contattato
                  </label>
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
                <div className="flex gap-2">
                  <Link href={`/dashboard/leads/${lead.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      Dettagli
                    </Button>
                  </Link>
                  <Link href={`/dashboard/leads/${lead.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifica
                    </Button>
                  </Link>
                  <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {search || filter !== 'all' ? 'Nessuna lead trovata con i filtri selezionati' : 'Nessuna lead presente'}
            </div>
            <Link href="/dashboard/leads/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Prima Lead
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}