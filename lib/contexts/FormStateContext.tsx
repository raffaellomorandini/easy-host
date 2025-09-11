'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface LeadFormData {
  nome: string
  localita: string
  camere: number
  telefono: string
  email: string
  contattato: boolean
  note: string
  status: string
}

interface TaskFormData {
  titolo: string
  descrizione: string
  tipo: string
  priorita: string
  stato: string
  dataScadenza: string
  leadId: number | null
  colore: string
}

interface AppuntamentoFormData {
  leadId: number
  data: string
  tipo: string
  luogo: string
  note: string
  completato: boolean
}

interface FormStateContextType {
  // Lead Form
  leadFormData: Partial<LeadFormData>
  setLeadFormData: (data: Partial<LeadFormData>) => void
  clearLeadForm: () => void

  // Task Form
  taskFormData: Partial<TaskFormData>
  setTaskFormData: (data: Partial<TaskFormData>) => void
  clearTaskForm: () => void

  // Appuntamento Form
  appuntamentoFormData: Partial<AppuntamentoFormData>
  setAppuntamentoFormData: (data: Partial<AppuntamentoFormData>) => void
  clearAppuntamentoForm: () => void
}

const FormStateContext = createContext<FormStateContextType | null>(null)

export function FormStateProvider({ children }: { children: React.ReactNode }) {
  const [leadFormData, setLeadFormDataState] = useState<Partial<LeadFormData>>({})
  const [taskFormData, setTaskFormDataState] = useState<Partial<TaskFormData>>({})
  const [appuntamentoFormData, setAppuntamentoFormDataState] = useState<Partial<AppuntamentoFormData>>({})

  // Carica i dati dal localStorage al mount
  useEffect(() => {
    const savedLeadData = localStorage.getItem('leadFormData')
    const savedTaskData = localStorage.getItem('taskFormData')
    const savedAppuntamentoData = localStorage.getItem('appuntamentoFormData')

    if (savedLeadData) {
      try {
        setLeadFormDataState(JSON.parse(savedLeadData))
      } catch (e) {
        console.error('Error parsing saved lead form data:', e)
      }
    }

    if (savedTaskData) {
      try {
        setTaskFormDataState(JSON.parse(savedTaskData))
      } catch (e) {
        console.error('Error parsing saved task form data:', e)
      }
    }

    if (savedAppuntamentoData) {
      try {
        setAppuntamentoFormDataState(JSON.parse(savedAppuntamentoData))
      } catch (e) {
        console.error('Error parsing saved appuntamento form data:', e)
      }
    }
  }, [])

  const setLeadFormData = (data: Partial<LeadFormData>) => {
    const newData = { ...leadFormData, ...data }
    setLeadFormDataState(newData)
    localStorage.setItem('leadFormData', JSON.stringify(newData))
  }

  const setTaskFormData = (data: Partial<TaskFormData>) => {
    const newData = { ...taskFormData, ...data }
    setTaskFormDataState(newData)
    localStorage.setItem('taskFormData', JSON.stringify(newData))
  }

  const setAppuntamentoFormData = (data: Partial<AppuntamentoFormData>) => {
    const newData = { ...appuntamentoFormData, ...data }
    setAppuntamentoFormDataState(newData)
    localStorage.setItem('appuntamentoFormData', JSON.stringify(newData))
  }

  const clearLeadForm = () => {
    setLeadFormDataState({})
    localStorage.removeItem('leadFormData')
  }

  const clearTaskForm = () => {
    setTaskFormDataState({})
    localStorage.removeItem('taskFormData')
  }

  const clearAppuntamentoForm = () => {
    setAppuntamentoFormDataState({})
    localStorage.removeItem('appuntamentoFormData')
  }

  return (
    <FormStateContext.Provider
      value={{
        leadFormData,
        setLeadFormData,
        clearLeadForm,
        taskFormData,
        setTaskFormData,
        clearTaskForm,
        appuntamentoFormData,
        setAppuntamentoFormData,
        clearAppuntamentoForm,
      }}
    >
      {children}
    </FormStateContext.Provider>
  )
}

export function useFormState() {
  const context = useContext(FormStateContext)
  if (!context) {
    throw new Error('useFormState must be used within a FormStateProvider')
  }
  return context
}
