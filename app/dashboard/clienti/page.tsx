'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
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
      const response = await fetch('/api/leads?limit=1000')
      if (response.ok) {
        const data = await response.json()
        // Filtra solo clienti (in attesa e confermati) - esclude status intermedi
        const clientiData = data.leads.filter((lead: Lead) => 
          lead.status === 'cliente_attesa' || lead.status === 'cliente_confermato'
        )
        setClienti(clientiData)
      }
    } catch (error) {
      console.error('Error fetching clienti:', error)
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
    } finally {
      setLoading(false)
    }
  }

  const getClienteAppuntamenti = (clienteId: number) => {
    return appuntamenti.filter(app => app.leadId === clienteId)
  }

  const clientiInAttesa = clienti.filter(c => c.status === 'cliente_attesa')
  const clientiConfermati = clienti.filter(c => c.status === 'cliente_confermato')

  const updateClienteStatus = async (clienteId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clienteId, status: newStatus })
      })

      if (response.ok) {
        fetchClienti()
        toast.success('Status aggiornato con successo!')
      } else {
        toast.error('Errore durante l\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating cliente:', error)
      toast.error('Errore durante l\'aggiornamento')
    }
  }

  // Rimosso il loading generale - ora mostriamo sempre il layout

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Clienti</h1>
          <p className="text-gray-600 mt-1">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Caricamento statistiche...</span>
              </div>
            ) : (
              `${clienti.length} clienti totali • ${clienti.filter(c => c.status === 'cliente_attesa').length} in attesa • ${clienti.filter(c => c.status === 'cliente_confermato').length} confermati`
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/leads">
            <Button className="btn-secondary">
              <Eye className="h-4 w-4 mr-2" />
              Tutte le Leads
            </Button>
          </Link>
          <Link href="/dashboard/leads/new">
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nuova Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Confermati", value: clientiConfermati.length, icon: Trophy, color: "green", change: "+12%" },
          { title: "In Attesa", value: clientiInAttesa.length, icon: Clock, color: "yellow", change: "+8%" },
          { title: "Appuntamenti", value: appuntamenti.length, icon: Calendar, color: "blue", change: "+15%" },
          { title: "Conversione", value: `${clienti.length > 0 ? Math.round((clientiConfermati.length / clienti.length) * 100) : 0}%`, icon: TrendingUp, color: "purple", change: "+5%" }
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
                  stat.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  stat.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Vs. mese scorso
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ricerca clienti
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

          {/* Status Filter */}
          <div className="lg:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtra per stato
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                size="sm"
                className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
              >
                Tutti ({clienti.length})
              </Button>
              <Button
                onClick={() => setFilter('cliente_attesa')}
                size="sm"
                className={filter === 'cliente_attesa' ? 'btn-primary' : 'btn-secondary'}
              >
                In Attesa ({clientiInAttesa.length})
              </Button>
              <Button
                onClick={() => setFilter('cliente_confermato')}
                size="sm"
                className={filter === 'cliente_confermato' ? 'btn-primary' : 'btn-secondary'}
              >
                Confermati ({clientiConfermati.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Clienti Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          // Skeleton Loading Cards
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card card-hover animate-pulse">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-300"></div>
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredClienti.map((cliente, index) => {
          const clienteAppuntamenti = getClienteAppuntamenti(cliente.id)
          const prossimiAppuntamenti = clienteAppuntamenti.filter(a => 
            !a.completato && new Date(a.data) >= new Date()
          ).length
          
          return (
            <motion.div 
              key={cliente.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="card card-hover"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                      cliente.status === 'cliente_confermato' 
                        ? 'bg-green-100' 
                        : 'bg-yellow-100'
                    }`}>
                      {cliente.status === 'cliente_confermato' ? (
                        <Crown className="h-7 w-7 text-green-600" />
                      ) : (
                        <Clock className="h-7 w-7 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cliente.nome}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cliente.status === 'cliente_confermato' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cliente.status === 'cliente_confermato' ? 'Cliente Confermato' : 'In Attesa di Conferma'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          cliente.status === 'cliente_confermato' && i < 4 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {cliente.localita} • {cliente.camere} camera{cliente.camere > 1 ? 'e' : ''}
                  </div>
                  
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
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-600">
                    <strong>{clienteAppuntamenti.length}</strong> appuntamenti totali
                    {clienteAppuntamenti.filter(a => a.completato).length > 0 && (
                      <span className="ml-2">• <strong>{clienteAppuntamenti.filter(a => a.completato).length}</strong> completati</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Cliente dal {new Date(cliente.createdAt).toLocaleDateString('it-IT')}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="space-y-3">
                  {/* Main Status Action */}
                  {cliente.status === 'cliente_attesa' && (
                    <Button
                      onClick={() => updateClienteStatus(cliente.id, 'cliente_confermato')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Conferma Cliente
                    </Button>
                  )}
                  {cliente.status === 'cliente_confermato' && (
                    <Button
                      onClick={() => updateClienteStatus(cliente.id, 'cliente_attesa')}
                      className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                      size="sm"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Riporta in Attesa
                    </Button>
                  )}

                  {/* Management Actions */}
                  <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/leads/${cliente.id}`}>
                      <Button className="btn-secondary group/btn w-full" size="sm">
                        <Eye className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                        Dettagli
                      </Button>
                    </Link>
                    <Link href={`/dashboard/appuntamenti/new?leadId=${cliente.id}`}>
                      <Button className="btn-primary group/btn w-full" size="sm">
                        <Calendar className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                        Appuntamento
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })
        )}
      </div>

      {/* Empty State */}
      {filteredClienti.length === 0 && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-16"
        >
          <div className="card max-w-md mx-auto">
            <div className="p-8">
              <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {search || filter !== 'all' ? 'Nessun cliente trovato' : 'Inizia la gestione clienti'}
              </h3>
              <p className="text-gray-600 mb-6">
                {search || filter !== 'all' 
                  ? 'Prova a modificare i filtri per trovare i clienti che stai cercando.' 
                  : 'I clienti sono leads che hanno raggiunto lo stato di "In Attesa" o "Confermato". Inizia convertendo le tue leads in clienti!'
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard/leads">
                  <Button className="btn-primary">
                    <Eye className="h-4 w-4 mr-2" />
                    Vedi Tutte le Leads
                  </Button>
                </Link>
                <Link href="/dashboard/leads/new">
                  <Button className="btn-secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Lead
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}