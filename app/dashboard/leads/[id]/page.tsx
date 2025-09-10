'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, Clock, User, CheckCircle } from 'lucide-react'

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
  luogo?: string
  note?: string
  completato: boolean
  leadNome: string
  leadLocalita: string
}

export default function LeadDetailsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && params.id) {
      fetchLead()
      fetchAppuntamenti()
    }
  }, [session, params.id])

  const fetchLead = async () => {
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        const foundLead = data.find((l: Lead) => l.id === parseInt(params.id as string))
        setLead(foundLead || null)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppuntamenti = async () => {
    try {
      const response = await fetch('/api/appuntamenti')
      if (response.ok) {
        const data = await response.json()
        const leadAppuntamenti = data.filter((a: Appuntamento) => a.leadId === parseInt(params.id as string))
        setAppuntamenti(leadAppuntamenti)
      }
    } catch (error) {
      console.error('Error fetching appuntamenti:', error)
    }
  }

  const updateLeadStatus = async (newStatus: string) => {
    if (!lead) return
    
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status: newStatus })
      })

      if (response.ok) {
        fetchLead()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const toggleContattato = async () => {
    if (!lead) return
    
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, contattato: !lead.contattato })
      })

      if (response.ok) {
        fetchLead()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'bg-green-100 text-green-800 border-green-200'
      case 'cliente_attesa': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'foto': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'appuntamento': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ghost': return 'bg-red-100 text-red-800 border-red-200'
      case 'ricontattare': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Caricamento dettagli...</div>
    </div>
  }

  if (!lead) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-gray-600 mb-4">Lead non trovata</div>
        <Link href="/dashboard/leads">
          <Button>Torna alle Leads</Button>
        </Link>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard/leads">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutte le Leads
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lead.nome}</h1>
                <p className="text-gray-600">Dettagli completi della lead</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/leads/${lead.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
              </Link>
              <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`}>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Nuovo Appuntamento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informazioni Principali */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Informazioni Generali</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(lead.status)}`}>
                  {getStatusText(lead.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Nome Completo</div>
                      <div className="font-medium">{lead.nome}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Località</div>
                      <div className="font-medium">{lead.localita}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Stato Contatto</div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={lead.contattato}
                          onChange={toggleContattato}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={lead.contattato ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {lead.contattato ? 'Contattato' : 'Non contattato'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-gray-400 mr-3 flex items-center justify-center text-sm font-semibold">
                      #
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Numero Camere</div>
                      <div className="font-medium">{lead.camere} camera{lead.camere > 1 ? 'e' : ''}</div>
                    </div>
                  </div>

                  {lead.telefono && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Telefono</div>
                        <a href={`tel:${lead.telefono}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {lead.telefono}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <a href={`mailto:${lead.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note */}
            {lead.note && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Note</h2>
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                    {lead.note}
                  </div>
                </div>
              </div>
            )}

            {/* Appuntamenti */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Appuntamenti</h2>
                <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`}>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nuovo
                  </Button>
                </Link>
              </div>

              {appuntamenti.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <div>Nessun appuntamento programmato</div>
                  <Link href={`/dashboard/appuntamenti/new?leadId=${lead.id}`}>
                    <Button variant="outline" className="mt-2">
                      Crea primo appuntamento
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appuntamenti.map((appuntamento) => (
                    <div key={appuntamento.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">
                              {new Date(appuntamento.data).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div><strong>Tipo:</strong> {appuntamento.tipo}</div>
                            {appuntamento.luogo && (
                              <div><strong>Luogo:</strong> {appuntamento.luogo}</div>
                            )}
                            {appuntamento.note && (
                              <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                                {appuntamento.note}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          appuntamento.completato 
                            ? 'bg-green-100 text-green-800' 
                            : new Date(appuntamento.data) < new Date()
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {appuntamento.completato 
                            ? 'Completato' 
                            : new Date(appuntamento.data) < new Date()
                              ? 'Scaduto'
                              : 'Programmato'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Azioni Rapide */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
              
              <div className="space-y-3">
                {/* Status Actions */}
                {lead.status === 'lead' && (
                  <>
                    <Button
                      onClick={() => updateLeadStatus('foto')}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      📸 Sposta a "Foto"
                    </Button>
                    <Button
                      onClick={() => updateLeadStatus('appuntamento')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      📅 Sposta a "Appuntamento"
                    </Button>
                    <Button
                      onClick={() => updateLeadStatus('ghost')}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      👻 Marca come "Ghost"
                    </Button>
                  </>
                )}
                
                {(lead.status === 'foto' || lead.status === 'appuntamento' || lead.status === 'ricontattare') && (
                  <>
                    <Button
                      onClick={() => updateLeadStatus('cliente_attesa')}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      → Sposta in "Cliente in Attesa"
                    </Button>
                    <Button
                      onClick={() => updateLeadStatus('ricontattare')}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={lead.status === 'ricontattare'}
                    >
                      📞 Marca "Da Ricontattare"
                    </Button>
                    <Button
                      onClick={() => updateLeadStatus('lead')}
                      variant="outline"
                      className="w-full"
                    >
                      ← Riporta a Lead
                    </Button>
                  </>
                )}
                
                {lead.status === 'ghost' && (
                  <>
                    <Button
                      onClick={() => updateLeadStatus('ricontattare')}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      📞 Sposta a "Ricontattare"
                    </Button>
                    <Button
                      onClick={() => updateLeadStatus('lead')}
                      variant="outline"
                      className="w-full"
                    >
                      ← Riporta a Lead
                    </Button>
                  </>
                )}
                
                {lead.status === 'cliente_attesa' && (
                  <>
                    <Button
                      onClick={() => updateLeadStatus('cliente_confermato')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      ✓ Conferma Cliente
                    </Button>
                    <Button
                      onClick={() => updateLeadStatus('lead')}
                      variant="outline"
                      className="w-full"
                    >
                      Riporta a Lead
                    </Button>
                  </>
                )}
                
                {lead.status === 'cliente_confermato' && (
                  <Button
                    onClick={() => updateLeadStatus('cliente_attesa')}
                    variant="outline"
                    className="w-full"
                  >
                    ← Riporta in "Attesa"
                  </Button>
                )}

                {/* Quick Contact */}
                {lead.telefono && (
                  <a href={`tel:${lead.telefono}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Chiama ora
                    </Button>
                  </a>
                )}
                
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Invia Email
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <div className="text-gray-900">Lead creata</div>
                    <div className="text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                {lead.updatedAt !== lead.createdAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="text-gray-900">Ultima modifica</div>
                      <div className="text-gray-500">
                        {new Date(lead.updatedAt).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {appuntamenti.length > 0 && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="text-gray-900">{appuntamenti.length} appuntamento{appuntamenti.length > 1 ? 'i' : ''}</div>
                      <div className="text-gray-500">Programmati</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}