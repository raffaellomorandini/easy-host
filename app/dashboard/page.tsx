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
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Filter
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

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
  dataScadenza?: string
  createdAt: string
}

interface Appuntamento {
  id: number
  leadId: number
  data: string
  tipo: string
  completato: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchLeads()
      fetchTasks()
      fetchAppuntamenti()
    }
  }, [session])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || data) // Handle both old and new API response
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchAppuntamenti = async () => {
    try {
      const response = await fetch('/api/appuntamenti?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setAppuntamenti(data.appuntamenti || data) // Handle both old and new API response
      }
    } catch (error) {
      console.error('Error fetching appuntamenti:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcoli KPI principali
  const leadsCount = leads.length
  const leadsPure = leads.filter(lead => lead.status === 'lead').length
  const leadsFoto = leads.filter(lead => lead.status === 'foto').length
  const leadsAppuntamento = leads.filter(lead => lead.status === 'appuntamento').length
  const leadsGhost = leads.filter(lead => lead.status === 'ghost').length
  const leadsRicontattare = leads.filter(lead => lead.status === 'ricontattare').length
  const clientiAttesa = leads.filter(lead => lead.status === 'cliente_attesa').length
  const clientiConfermati = leads.filter(lead => lead.status === 'cliente_confermato').length
  
  const appuntamentiTotali = appuntamenti.length
  const appuntamentiCompletati = appuntamenti.filter(a => a.completato).length
  const prossimiAppuntamenti = appuntamenti.filter(a => !a.completato && new Date(a.data) >= new Date()).length
  const appuntamentiScaduti = appuntamenti.filter(a => !a.completato && new Date(a.data) < new Date()).length
  
  const tasksTotali = tasks.length
  const tasksCompletati = tasks.filter(task => task.stato === 'completato').length
  const tasksPendenti = tasks.filter(task => task.stato !== 'completato').length
  const tasksUrgenti = tasks.filter(task => task.priorita === 'urgente' && task.stato !== 'completato').length
  const tasksScaduti = tasks.filter(task => 
    task.stato !== 'completato' && 
    task.dataScadenza && 
    new Date(task.dataScadenza) < new Date()
  ).length

  // Tasso di conversione
  const conversionRate = leadsCount > 0 ? Math.round((clientiConfermati / leadsCount) * 100) : 0
  
  // Preparazione dati per grafici
  const statusData = [
    { name: 'Leads', value: leadsPure, color: '#6B7280' },
    { name: 'Foto', value: leadsFoto, color: '#8B5CF6' },
    { name: 'Appuntamento', value: leadsAppuntamento, color: '#3B82F6' },
    { name: 'Ghost', value: leadsGhost, color: '#EF4444' },
    { name: 'Ricontattare', value: leadsRicontattare, color: '#F59E0B' },
    { name: 'In Attesa', value: clientiAttesa, color: '#EAB308' },
    { name: 'Confermati', value: clientiConfermati, color: '#10B981' }
  ].filter(item => item.value > 0)

  // Dati per grafico temporale (ultimi 7 giorni)
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
        leads: leads.filter(l => new Date(l.createdAt).toDateString() === date.toDateString()).length,
        appuntamenti: appuntamenti.filter(a => new Date(a.createdAt).toDateString() === date.toDateString()).length,
        tasks: tasks.filter(t => new Date(t.createdAt).toDateString() === date.toDateString()).length
      })
    }
    return days
  }

  const weeklyData = getLast7Days()

  // Dati per grafico task per priorità
  const priorityData = [
    { name: 'Urgente', value: tasks.filter(t => t.priorita === 'urgente' && t.stato !== 'completato').length, color: '#EF4444' },
    { name: 'Alta', value: tasks.filter(t => t.priorita === 'alta' && t.stato !== 'completato').length, color: '#F59E0B' },
    { name: 'Media', value: tasks.filter(t => t.priorita === 'media' && t.stato !== 'completato').length, color: '#EAB308' },
    { name: 'Bassa', value: tasks.filter(t => t.priorita === 'bassa' && t.stato !== 'completato').length, color: '#10B981' }
  ].filter(item => item.value > 0)

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
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Analytics</h1>
            <p className="text-gray-600 mt-1">
              Benvenuto, {session?.user?.name} • Panoramica completa delle tue attività
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Aggiornato in tempo reale</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: "Leads Totali", 
            value: leadsCount, 
            icon: Users, 
            color: "blue", 
            change: "+12%", 
            description: "Contatti acquisiti",
            trend: "up"
          },
          { 
            title: "Tasso Conversione", 
            value: `${conversionRate}%`, 
            icon: Target, 
            color: "green", 
            change: "+5%", 
            description: "Lead → Cliente",
            trend: "up"
          },
          { 
            title: "Appuntamenti", 
            value: prossimiAppuntamenti, 
            icon: Calendar, 
            color: "purple", 
            change: "+8%", 
            description: "Prossimi incontri",
            trend: "up"
          },
          { 
            title: "Tasks Urgenti", 
            value: tasksUrgenti, 
            icon: AlertTriangle, 
            color: "red", 
            change: tasksUrgenti > 0 ? "-2%" : "0%", 
            description: "Richiedono attenzione",
            trend: tasksUrgenti > 0 ? "down" : "neutral"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="card card-hover overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      stat.trend === 'up' 
                        ? 'bg-green-100 text-green-700' 
                        : stat.trend === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                      {stat.trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-4 rounded-xl shadow-lg ${
                  stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  stat.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  stat.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              
              {/* Mini progress bar or indicator */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      stat.color === 'blue' ? 'bg-blue-500' :
                      stat.color === 'green' ? 'bg-green-500' :
                      stat.color === 'purple' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: stat.title === 'Tasso Conversione' ? `${conversionRate}%` : 
                             stat.title === 'Tasks Urgenti' ? `${Math.min((tasksUrgenti / tasksTotali) * 100, 100)}%` :
                             '75%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lead Status Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <PieChart className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Distribuzione Leads</h3>
              </div>
              <div className="text-sm text-gray-500">
                {leadsCount} totali
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Attività Settimanale</h3>
              </div>
              <div className="text-sm text-gray-500">
                Ultimi 7 giorni
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px' 
                    }}
                  />
                  <Bar dataKey="leads" fill="#3B82F6" name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="appuntamenti" fill="#10B981" name="Appuntamenti" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasks" fill="#8B5CF6" name="Tasks" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Task Priority Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-100">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tasks per Priorità</h3>
            </div>
            <div className="space-y-3">
              {priorityData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          backgroundColor: item.color,
                          width: `${(item.value / Math.max(...priorityData.map(p => p.value))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100">
                <CheckSquare className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Riepilogo</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Appuntamenti</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-blue-600">{prossimiAppuntamenti}</span> prossimi
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Tasks Completati</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-green-600">{tasksCompletati}</span>/{tasksTotali}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Clienti Confermati</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-yellow-600">{clientiConfermati}</span> attivi
                </div>
              </div>
              {tasksScaduti > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Tasks Scaduti</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-red-600">{tasksScaduti}</span> urgenti
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Azioni Rapide</h3>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard/leads/new">
                <Button className="w-full btn-primary group">
                  <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Nuova Lead
                </Button>
              </Link>
              <Link href="/dashboard/appuntamenti/new">
                <Button className="w-full btn-secondary group">
                  <Calendar className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Nuovo Appuntamento
                </Button>
              </Link>
              <Link href="/dashboard/tasks">
                <Button className="w-full btn-secondary group">
                  <CheckSquare className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Gestione Tasks
                </Button>
              </Link>
              <Link href="/dashboard/calendario">
                <Button className="w-full btn-secondary group">
                  <CalendarDays className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Calendario
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}