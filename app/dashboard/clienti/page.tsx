'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Crown, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Eye, 
  Trophy,
  Users,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Filter,
  Search,
  Plus
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

interface Appuntamento {
  id: number
  leadId: number
  data: string
  tipo: string
  completato: boolean
}

export default function ClientiPage() {
  const { data: session } = useSession()
  const [clienti, setClienti] = useState<Lead[]>([])
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'cliente_attesa' | 'cliente_confermato'>('all')
  const [search, setSearch] = useState('')
  const [filteredClienti, setFilteredClienti] = useState<Lead[]>([])

  useEffect(() => {
    filterClienti()
  }, [clienti, filter, search])

  const filterClienti = () => {
    let filtered = clienti

    if (filter !== 'all') {
      filtered = filtered.filter(cliente => cliente.status === filter)
    }

    if (search) {
      filtered = filtered.filter(cliente => 
        cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
        cliente.localita.toLowerCase().includes(search.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(search.toLowerCase()) ||
        cliente.telefono?.includes(search)
      )
    }

    setFilteredClienti(filtered)
  }

  useEffect(() => {
    if (session) {
      fetchClienti()
      fetchAppuntamenti()
    }
  }, [session])

  const fetchClienti = async () => {
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        // Filtra solo clienti (in attesa e confermati)
        const clientiData = data.filter((lead: Lead) => 
          lead.status === 'cliente_attesa' || lead.status === 'cliente_confermato'
        )
        setClienti(clientiData)
      }
    } catch (error) {
      console.error('Error fetching clienti:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const updateClienteStatus = async (clienteId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clienteId, status: newStatus })
      })

      if (response.ok) {
        fetchClienti()
      }
    } catch (error) {
      console.error('Error updating cliente:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'bg-green-100 text-green-800 border-green-200'
      case 'cliente_attesa': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'Cliente Confermato'
      case 'cliente_attesa': return 'Cliente in Attesa'
      default: return 'Lead'
    }
  }

  const getClienteAppuntamenti = (clienteId: number) => {
    return appuntamenti.filter(a => a.leadId === clienteId)
  }

  const filteredClienti = filter === 'all' ? clienti : clienti.filter(c => c.status === filter)
  const clientiConfermati = clienti.filter(c => c.status === 'cliente_confermato')
  const clientiInAttesa = clienti.filter(c => c.status === 'cliente_attesa')

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Caricamento clienti...</div>
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
                  Gestione Clienti
                </h1>
                <p className="text-gray-600">Clienti in attesa e confermati</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/leads">
                <Button variant="outline">
                  Vedi tutte le Leads
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-purple-400" />
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Totale Clienti
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {clienti.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Attesa
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {clientiInAttesa.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-green-400" />
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Confermati
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {clientiConfermati.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Tutti i Clienti ({clienti.length})
            </Button>
            <Button
              variant={filter === 'cliente_attesa' ? 'default' : 'outline'}
              onClick={() => setFilter('cliente_attesa')}
              size="sm"
            >
              In Attesa ({clientiInAttesa.length})
            </Button>
            <Button
              variant={filter === 'cliente_confermato' ? 'default' : 'outline'}
              onClick={() => setFilter('cliente_confermato')}
              size="sm"
            >
              Confermati ({clientiConfermati.length})
            </Button>
          </div>
        </div>

        {/* Clienti Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClienti.map((cliente) => {
            const clienteAppuntamenti = getClienteAppuntamenti(cliente.id)
            const prossimiAppuntamenti = clienteAppuntamenti.filter(a => 
              !a.completato && new Date(a.data) >= new Date()
            ).length
            
            return (
              <div key={cliente.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        {cliente.status === 'cliente_confermato' && (
                          <Trophy className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        {cliente.nome}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {cliente.localita} • {cliente.camere} camera{cliente.camere > 1 ? 'e' : ''}
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(cliente.status)}`}>
                      {getStatusText(cliente.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {cliente.telefono && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${cliente.telefono}`} className="hover:text-blue-600">
                          {cliente.telefono}
                        </a>
                      </div>
                    )}
                    
                    {cliente.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${cliente.email}`} className="hover:text-blue-600 truncate">
                          {cliente.email}
                        </a>
                      </div>
                    )}

                    {prossimiAppuntamenti > 0 && (
                      <div className="flex items-center text-blue-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {prossimiAppuntamenti} prossim{prossimiAppuntamenti === 1 ? 'o' : 'i'} appuntament{prossimiAppuntamenti === 1 ? 'o' : 'i'}
                      </div>
                    )}
                  </div>

                  {/* Note Preview */}
                  {cliente.note && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <div className="line-clamp-2">
                        {cliente.note.length > 100 ? `${cliente.note.substring(0, 100)}...` : cliente.note}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>Cliente dal {new Date(cliente.createdAt).toLocaleDateString('it-IT')}</span>
                    <span>{clienteAppuntamenti.length} appuntament{clienteAppuntamenti.length === 1 ? 'o' : 'i'}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  {/* Status Actions */}
                  {cliente.status === 'cliente_attesa' && (
                    <div className="flex gap-2 mb-4">
                      <Button
                        size="sm"
                        onClick={() => updateClienteStatus(cliente.id, 'cliente_confermato')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Trophy className="h-4 w-4 mr-1" />
                        Conferma Cliente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateClienteStatus(cliente.id, 'lead')}
                      >
                        Riporta a Lead
                      </Button>
                    </div>
                  )}

                  {cliente.status === 'cliente_confermato' && (
                    <div className="flex gap-2 mb-4">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        Cliente Confermato
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateClienteStatus(cliente.id, 'cliente_attesa')}
                      >
                        Riporta in Attesa
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/leads/${cliente.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Dettagli
                      </Button>
                    </Link>
                    
                    {cliente.telefono && (
                      <a href={`tel:${cliente.telefono}`}>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    
                    {cliente.email && (
                      <a href={`mailto:${cliente.email}`}>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    
                    <Link href={`/dashboard/appuntamenti/new?leadId=${cliente.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredClienti.length === 0 && (
          <div className="text-center py-12">
            <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <div className="text-gray-500 text-lg mb-4">
              {filter === 'all' ? 'Nessun cliente presente' : 
               filter === 'cliente_attesa' ? 'Nessun cliente in attesa' :
               'Nessun cliente confermato'}
            </div>
            <p className="text-gray-400 mb-4">
              I clienti sono leads che hanno progredito oltre il primo contatto.
            </p>
            <Link href="/dashboard/leads">
              <Button>
                Gestisci le Leads
              </Button>
            </Link>
          </div>
        )}

        {/* Success Stories */}
        {clientiConfermati.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Congratulazioni! 🎉
            </h3>
            <div className="text-green-800">
              <p className="mb-2">
                <strong>{clientiConfermati.length}</strong> client{clientiConfermati.length === 1 ? 'e' : 'i'} 
                {clientiConfermati.length === 1 ? ' ha' : ' hanno'} confermato il servizio!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{clientiConfermati.length}</div>
                  <div className="text-xs text-gray-600">Clienti Confermati</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {clientiConfermati.reduce((sum, c) => sum + c.camere, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Camere Totali</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((clientiConfermati.length / (clienti.length || 1)) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">Tasso di Conversione</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}