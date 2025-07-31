'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, User, Plus, CheckCircle, X } from 'lucide-react'

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

  useEffect(() => {
    if (session) {
      fetchAppuntamenti()
    }
  }, [session])

  useEffect(() => {
    filterAppuntamenti()
  }, [appuntamenti, filter])

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
      }
    } catch (error) {
      console.error('Error updating appuntamento:', error)
    }
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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Caricamento appuntamenti...</div>
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
                  Gestione Appuntamenti
                </h1>
                <p className="text-gray-600">Visualizza e gestisci tutti gli appuntamenti</p>
              </div>
            </div>
            <Link href="/dashboard/appuntamenti/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Appuntamento
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-400" />
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Totale Appuntamenti
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {appuntamenti.length}
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
                      Prossimi
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {appuntamenti.filter(a => !a.completato && new Date(a.data) >= new Date()).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completati
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {appuntamenti.filter(a => a.completato).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-400" />
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Scaduti
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {appuntamenti.filter(a => !a.completato && new Date(a.data) < new Date()).length}
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
              Tutti ({appuntamenti.length})
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
              size="sm"
            >
              Prossimi ({appuntamenti.filter(a => !a.completato && new Date(a.data) >= new Date()).length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              size="sm"
            >
              Completati ({appuntamenti.filter(a => a.completato).length})
            </Button>
            <Button
              variant={filter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilter('overdue')}
              size="sm"
            >
              Scaduti ({appuntamenti.filter(a => !a.completato && new Date(a.data) < new Date()).length})
            </Button>
          </div>
        </div>

        {/* Appuntamenti List */}
        <div className="space-y-4">
          {filteredAppuntamenti.map((appuntamento) => {
            const statusInfo = getStatusInfo(appuntamento)
            const Icon = statusInfo.icon
            
            return (
              <div key={appuntamento.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appuntamento.tipo}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <User className="h-4 w-4 mr-1" />
                            <Link 
                              href={`/dashboard/leads/${appuntamento.leadId}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {appuntamento.leadNome}
                            </Link>
                            <span className="mx-2">•</span>
                            <span>{appuntamento.leadLocalita}</span>
                          </div>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${statusInfo.color}`}>
                          <Icon className="h-4 w-4 mr-1" />
                          {statusInfo.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">
                              {new Date(appuntamento.data).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              alle {new Date(appuntamento.data).toLocaleTimeString('it-IT', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>

                        {appuntamento.luogo && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{appuntamento.luogo}</span>
                          </div>
                        )}
                      </div>

                      {appuntamento.note && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4">
                          {appuntamento.note}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={appuntamento.completato}
                            onChange={() => toggleCompletato(appuntamento.id, appuntamento.completato)}
                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={appuntamento.completato ? 'text-green-600 font-medium' : 'text-gray-700'}>
                            {appuntamento.completato ? 'Completato' : 'Marca come completato'}
                          </span>
                        </label>

                        <div className="flex gap-2">
                          <Link href={`/dashboard/leads/${appuntamento.leadId}`}>
                            <Button variant="outline" size="sm">
                              Vedi Lead
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAppuntamenti.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <div className="text-gray-500 text-lg mb-4">
              {filter === 'all' ? 'Nessun appuntamento presente' : 
               filter === 'upcoming' ? 'Nessun appuntamento programmato' :
               filter === 'completed' ? 'Nessun appuntamento completato' :
               'Nessun appuntamento scaduto'}
            </div>
            <Link href="/dashboard/appuntamenti/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crea Primo Appuntamento
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}