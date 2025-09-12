'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft, Save, X, User, Phone, Mail, MapPin } from 'lucide-react'
import { useFormState } from '@/lib/contexts/FormStateContext'
import { leadFormSchema, type LeadFormData } from '@/lib/schemas/forms'
import { toast } from 'react-hot-toast'

export default function NewLeadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { leadFormData, setLeadFormData, clearLeadForm } = useFormState()

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      nome: '',
      localita: '',
      camere: 1,
      telefono: '',
      email: '',
      contattato: false,
      note: '',
      status: 'lead' as const
    }
  })

  // Carica i dati salvati quando il componente si monta
  useEffect(() => {
    if (Object.keys(leadFormData).length > 0) {
      form.reset({ 
        ...form.getValues(), 
        ...leadFormData,
        status: (leadFormData.status as any) || 'lead'
      })
    }
  }, [leadFormData, form])

  // Salva automaticamente i dati quando cambiano
  useEffect(() => {
    const subscription = form.watch((value: Partial<LeadFormData>) => {
      setLeadFormData(value)
    })
    return () => subscription.unsubscribe()
  }, [form, setLeadFormData])

  const handleSubmit = async (data: LeadFormData) => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        clearLeadForm() // Pulisce i dati salvati dopo il successo
        toast.success('Lead creata con successo!')
        router.push('/dashboard/leads')
      } else {
        const errorData = await response.json()
        toast.error(`Errore: ${errorData.error || 'Errore durante il salvataggio'}`)
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      toast.error('Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  const handleClearForm = () => {
    clearLeadForm()
    form.reset({
      nome: '',
      localita: '',
      camere: 1,
      telefono: '',
      email: '',
      contattato: false,
      note: '',
      status: 'lead' as const
    })
    toast.success('Form svuotato!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/leads">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutte le Leads
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Nuova Lead</h1>
                  <div className="flex items-center gap-3">
                    <p className="text-gray-600">Aggiungi una nuova lead al sistema</p>
                    {Object.keys(leadFormData).length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600">Bozza salvata</span>
                        <button
                          onClick={handleClearForm}
                          type="button"
                          className="text-xs text-gray-500 hover:text-red-600 underline"
                        >
                          Svuota
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
            {/* Informazioni Base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informazioni Base
                </CardTitle>
                <CardDescription>
                  Dettagli principali della lead
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    {...form.register('nome')}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      form.formState.errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Es. Mario Rossi"
                  />
                  {form.formState.errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="localita" className="block text-sm font-medium text-gray-700 mb-1">
                    Località *
                  </label>
                  <input
                    type="text"
                    id="localita"
                    {...form.register('localita')}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      form.formState.errors.localita ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Es. Milano, Roma, Napoli"
                  />
                  {form.formState.errors.localita && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.localita.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="camere" className="block text-sm font-medium text-gray-700 mb-2">
                    Numero Camere *
                  </label>
                  <Select 
                    value={form.watch('camere')?.toString()} 
                    onValueChange={(value) => form.setValue('camere', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona numero camere..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 camera</SelectItem>
                      <SelectItem value="2">2 camere</SelectItem>
                      <SelectItem value="3">3 camere</SelectItem>
                      <SelectItem value="4">4 camere</SelectItem>
                      <SelectItem value="5">5+ camere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Stato Iniziale
                  </label>
                  <Select 
                    value={form.watch('status')} 
                    onValueChange={(value) => form.setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona stato..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="foto">Foto</SelectItem>
                      <SelectItem value="appuntamento">Appuntamento</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="ricontattare">Ricontattare</SelectItem>
                      <SelectItem value="cliente_attesa">Cliente in Attesa</SelectItem>
                      <SelectItem value="cliente_confermato">Cliente Confermato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Contatti */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Informazioni di Contatto
                </CardTitle>
                <CardDescription>
                  Dettagli per contattare la lead
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Numero di Telefono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    {...form.register('telefono')}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      form.formState.errors.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Es. 3333333333"
                  />
                  {form.formState.errors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.telefono.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...form.register('email')}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      form.formState.errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Es. mario.rossi@email.com"
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...form.register('contattato')}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">È già stato contattato</span>
                </label>
              </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Note e Dettagli
                </CardTitle>
                <CardDescription>
                  Informazioni aggiuntive sulla lead
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...form.register('note')}
                  placeholder="Aggiungi note, dettagli della conversazione, preferenze specifiche..."
                  className="min-h-[100px]"
                />
                {form.formState.errors.note && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.note.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Link href="/dashboard/leads">
                <Button type="button" variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Annulla
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salva Lead
                  </>
                )}
              </Button>
            </div>
          </form>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Consigli per l&apos;inserimento</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Inserisci sempre il nome completo per una migliore identificazione</li>
              <li>• La località dovrebbe includere città e eventualmente zona/quartiere</li>
            <li>• Nelle note puoi inserire dettagli su esigenze specifiche, budget, tempistiche</li>
            <li>• Marca come &quot;contattato&quot; se hai già avuto un primo contatto</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}