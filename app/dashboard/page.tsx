'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Calendar, 
  UserCheck, 
  Clock, 
  Plus, 
  CheckSquare, 
  CalendarDays,
  TrendingUp,
  Award,
  Target,
  Zap,
  ArrowUpRight,
  Eye,
  Phone,
  Mail
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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchLeads()
      fetchAppuntamenti()
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

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
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
  const tasksPendenti = tasks.filter(t => t.stato !== 'completato').length
  const tasksUrgenti = tasks.filter(t => t.priorita === 'urgente' && t.stato !== 'completato').length

  return (
    <div className="min-h-screen gradient-primary">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-gradient text-3xl lg:text-4xl font-bold">
                EasyHost CRM
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="status-indicator online">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <p className="text-gray-600">Benvenuto, {session.user?.name}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button 
                onClick={() => {
                  toast.success('Logout effettuato con successo')
                  signOut()
                }} 
                className="btn-secondary shadow-elegant"
              >
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {[
            {
              title: "Totale Leads",
              value: leadsCount,
              icon: Users,
              color: "blue",
              change: "+12%",
              bgGradient: "from-blue-500 to-blue-600"
            },
            {
              title: "In Attesa",
              value: clientiAttesa,
              icon: Clock,
              color: "yellow",
              change: "+5%",
              bgGradient: "from-yellow-500 to-yellow-600"
            },
            {
              title: "Confermati",
              value: clientiConfermati,
              icon: UserCheck,
              color: "green",
              change: "+8%",
              bgGradient: "from-green-500 to-green-600"
            },
            {
              title: "Appuntamenti",
              value: prossimiAppuntamenti,
              icon: Calendar,
              color: "purple",
              change: "+3%",
              bgGradient: "from-purple-500 to-purple-600"
            },
            {
              title: "Tasks",
              value: tasksPendenti,
              icon: CheckSquare,
              color: "indigo",
              change: "-2%",
              bgGradient: "from-indigo-500 to-indigo-600"
            },
            {
              title: "Urgenti",
              value: tasksUrgenti,
              icon: Zap,
              color: "red",
              change: "0%",
              bgGradient: "from-red-500 to-red-600"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="card card-hover group"
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
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
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

        {/* Quick Actions */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              href: "/dashboard/leads",
              icon: Users,
              title: "Gestisci Leads",
              description: "Visualizza e modifica le leads",
              bgGradient: "from-blue-500 to-blue-600",
              delay: 0
            },
            {
              href: "/dashboard/calendario", 
              icon: CalendarDays,
              title: "Calendario",
              description: "Vista calendario appuntamenti e task",
              bgGradient: "from-orange-500 to-orange-600",
              delay: 0.1
            },
            {
              href: "/dashboard/tasks",
              icon: CheckSquare,
              title: "Task Manager", 
              description: "Gestisci task e promemoria",
              bgGradient: "from-purple-500 to-purple-600",
              delay: 0.2
            },
            {
              href: "/dashboard/clienti",
              icon: UserCheck,
              title: "Clienti",
              description: "Gestisci i clienti confermati", 
              bgGradient: "from-green-500 to-green-600",
              delay: 0.3
            },
            {
              href: "/dashboard/appuntamenti",
              icon: Calendar,
              title: "Appuntamenti",
              description: "Lista appuntamenti",
              bgGradient: "from-indigo-500 to-indigo-600", 
              delay: 0.4
            },
            {
              href: "/dashboard/leads/new",
              icon: Plus,
              title: "Nuova Lead",
              description: "Aggiungi una nuova lead",
              bgGradient: "from-pink-500 to-pink-600",
              delay: 0.5
            }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 + action.delay, duration: 0.5 }}
            >
              <Link href={action.href}>
                <div className="card card-hover group cursor-pointer overflow-hidden">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.bgGradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                {action.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Leads */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Leads Recenti
                </h3>
              </div>
              <Link href="/dashboard/leads">
                <Button className="btn-secondary text-sm">
                  Vedi tutte
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.6 + index * 0.1, duration: 0.4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {lead.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead.nome}
                        </p>
                        <span className={`badge ${
                          lead.status === 'cliente_confermato' ? 'badge-success' :
                          lead.status === 'cliente_attesa' ? 'badge-warning' :
                          'badge-gray'
                        }`}>
                          {lead.status === 'cliente_confermato' ? 'Confermato' :
                           lead.status === 'cliente_attesa' ? 'In Attesa' : 'Lead'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {lead.localita}
                        </span>
                        <span className="text-xs text-gray-500">
                          {lead.camere} camera{lead.camere > 1 ? 'e' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {lead.telefono && (
                        <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                          <Phone className="h-4 w-4" />
                        </button>
                      )}
                      {lead.email && (
                        <button className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                          <Mail className="h-4 w-4" />
                        </button>
                      )}
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors group-hover:scale-105">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                    
                    <div className={`h-2 w-2 rounded-full ${
                      lead.contattato ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {leads.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nessuna lead ancora presente</p>
                <Link href="/dashboard/leads/new">
                  <Button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Prima Lead
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}