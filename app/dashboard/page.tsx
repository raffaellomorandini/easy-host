'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Users, 
  Clock, 
  UserCheck, 
  Calendar, 
  CheckSquare, 
  Zap, 
  TrendingUp,
  ArrowUpRight,
  Eye,
  Phone,
  Mail,
  CalendarDays,
  Crown,
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

interface Task {
  id: number
  titolo: string
  stato: string
  priorita: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchLeads()
      fetchTasks()
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

  const leadsCount = leads.length
  const clientiAttesa = leads.filter(lead => lead.status === 'cliente_attesa').length
  const clientiConfermati = leads.filter(lead => lead.status === 'cliente_confermato').length
  const prossimiAppuntamenti = 1 // Placeholder
  const tasksPendenti = tasks.filter(task => task.stato !== 'completato').length
  const tasksUrgenti = tasks.filter(task => task.priorita === 'urgente' && task.stato !== 'completato').length
  
  const recentLeads = leads.slice(0, 5)

  // Mostra la dashboard anche se non ci sono dati
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Caricamento...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Benvenuto, {session?.user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[
          { title: "Totale Leads", value: leadsCount, icon: Users, color: "blue", change: "+12%" },
          { title: "In Attesa", value: clientiAttesa, icon: Clock, color: "yellow", change: "+5%" },
          { title: "Confermati", value: clientiConfermati, icon: UserCheck, color: "green", change: "+8%" },
          { title: "Appuntamenti", value: prossimiAppuntamenti, icon: Calendar, color: "purple", change: "+3%" },
          { title: "Tasks", value: tasksPendenti, icon: CheckSquare, color: "indigo", change: "-2%" },
          { title: "Urgenti", value: tasksUrgenti, icon: Zap, color: "red", change: "0%" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="card card-hover"
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
                <div className={`p-3 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'yellow' ? 'bg-yellow-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  stat.color === 'indigo' ? 'bg-indigo-100' :
                  'bg-red-100'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    stat.color === 'indigo' ? 'text-indigo-600' :
                    'text-red-600'
                  }`} />
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Gestisci Leads", description: "Visualizza e modifica le leads", href: "/dashboard/leads", icon: Users, color: "blue" },
          { title: "Calendario", description: "Vista calendario appuntamenti e task", href: "/dashboard/calendario", icon: CalendarDays, color: "green" },
          { title: "Task Manager", description: "Gestisci task e promemoria", href: "/dashboard/tasks", icon: CheckSquare, color: "purple" },
          { title: "Clienti", description: "Gestisci i clienti confermati", href: "/dashboard/clienti", icon: Crown, color: "yellow" },
          { title: "Appuntamenti", description: "Lista appuntamenti", href: "/dashboard/appuntamenti", icon: Calendar, color: "indigo" },
          { title: "Nuova Lead", description: "Aggiungi una nuova lead", href: "/dashboard/leads/new", icon: Plus, color: "red" }
        ].map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
          >
            <Link href={action.href}>
              <div className="card card-hover group cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      action.color === 'blue' ? 'bg-blue-100' :
                      action.color === 'green' ? 'bg-green-100' :
                      action.color === 'purple' ? 'bg-purple-100' :
                      action.color === 'yellow' ? 'bg-yellow-100' :
                      action.color === 'indigo' ? 'bg-indigo-100' :
                      'bg-red-100'
                    }`}>
                      <action.icon className={`h-6 w-6 ${
                        action.color === 'blue' ? 'text-blue-600' :
                        action.color === 'green' ? 'text-green-600' :
                        action.color === 'purple' ? 'text-purple-600' :
                        action.color === 'yellow' ? 'text-yellow-600' :
                        action.color === 'indigo' ? 'text-indigo-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Leads */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="card"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Leads Recenti</h2>
            <Link href="/dashboard/leads">
              <Button className="btn-secondary text-sm">
                Vedi tutte
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {lead.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {lead.nome}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'cliente_confermato' 
                            ? 'bg-green-100 text-green-800' 
                            : lead.status === 'cliente_attesa'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.status === 'cliente_confermato' ? 'Cliente Confermato' : 
                           lead.status === 'cliente_attesa' ? 'In Attesa' : 'Lead'}
                        </span>
                        <span>{lead.localita}</span>
                        <span>{lead.camere} camera{lead.camere > 1 ? 'e' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {lead.telefono && (
                      <a href={`tel:${lead.telefono}`}>
                        <Button size="sm" className="btn-secondary">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`}>
                        <Button size="sm" className="btn-secondary">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Link href={`/dashboard/leads/${lead.id}`}>
                      <Button size="sm" className="btn-secondary">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nessuna lead presente
                </h3>
                <p className="text-gray-600 mb-4">
                  Inizia aggiungendo la tua prima lead per gestire i contatti
                </p>
                <Link href="/dashboard/leads/new">
                  <Button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Prima Lead
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}