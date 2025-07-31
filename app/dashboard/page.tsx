'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, UserCheck, Clock, Plus } from 'lucide-react'

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
}

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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchLeads()
      fetchAppuntamenti()
    }
  }, [session])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
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

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Caricamento...</div>
    </div>
  }

  if (!session) return null

  const leadsCount = leads.length
  const clientiAttesa = leads.filter(l => l.status === 'cliente_attesa').length
  const clientiConfermati = leads.filter(l => l.status === 'cliente_confermato').length
  const prossimiAppuntamenti = appuntamenti.filter(a => !a.completato && new Date(a.data) >= new Date()).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestionale Leads - EasyHost
              </h1>
              <p className="text-gray-600">Benvenuto, {session.user?.name}</p>
            </div>
            <Button onClick={() => signOut()} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Totale Leads
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {leadsCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Clienti in Attesa
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {clientiAttesa}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Clienti Confermati
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {clientiConfermati}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Prossimi Appuntamenti
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {prossimiAppuntamenti}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/leads">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Gestisci Leads</h3>
                  <p className="text-gray-600">Visualizza e modifica le leads</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/clienti">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Clienti</h3>
                  <p className="text-gray-600">Gestisci i clienti confermati</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/appuntamenti">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Appuntamenti</h3>
                  <p className="text-gray-600">Gestisci gli appuntamenti</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/leads/new">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Nuova Lead</h3>
                  <p className="text-gray-600">Aggiungi una nuova lead</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Leads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Leads Recenti
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Località
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Camere
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contattato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.slice(0, 5).map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.localita}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.camere}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.contattato 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {lead.contattato ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'cliente_confermato' ? 'bg-green-100 text-green-800' :
                          lead.status === 'cliente_attesa' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status === 'cliente_confermato' ? 'Confermato' :
                           lead.status === 'cliente_attesa' ? 'In Attesa' : 'Lead'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leads.length > 5 && (
              <div className="mt-4">
                <Link href="/dashboard/leads">
                  <Button variant="outline">Vedi tutte le leads</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}