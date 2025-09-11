import { z } from 'zod'

export const leadFormSchema = z.object({
  nome: z.string().min(1, 'Nome è richiesto').max(255, 'Nome troppo lungo'),
  localita: z.string().min(1, 'Località è richiesta').max(255, 'Località troppo lunga'),
  camere: z.number().min(1, 'Minimo 1 camera').max(10, 'Massimo 10 camere'),
  telefono: z.string().optional().or(z.literal('')),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  contattato: z.boolean(),
  note: z.string().optional().or(z.literal('')),
  status: z.enum(['lead', 'foto', 'appuntamento', 'ghost', 'ricontattare', 'cliente_attesa', 'cliente_confermato'])
})

export const taskFormSchema = z.object({
  titolo: z.string().min(1, 'Titolo è richiesto').max(255, 'Titolo troppo lungo'),
  descrizione: z.string().optional(),
  tipo: z.enum(['prospetti_da_fare', 'chiamate_da_fare', 'task_importanti', 'task_generiche']),
  priorita: z.enum(['bassa', 'media', 'alta', 'urgente']).default('media'),
  stato: z.enum(['da_fare', 'in_corso', 'completato']).default('da_fare'),
  dataScadenza: z.string().optional(),
  leadId: z.number().nullable().optional(),
  colore: z.string().default('#3b82f6')
})

export const appuntamentoFormSchema = z.object({
  leadId: z.number().min(1, 'Lead è richiesta'),
  data: z.string().min(1, 'Data è richiesta'),
  tipo: z.enum(['Incontro conoscitivo', 'Incontro conoscitivo + sopralluogo', 'Incontro di piacere', 'Firma contratto', 'Sistemazione immobile']),
  luogo: z.string().optional(),
  note: z.string().optional(),
  completato: z.boolean().default(false)
})

export type LeadFormData = z.infer<typeof leadFormSchema>
export type TaskFormData = z.infer<typeof taskFormSchema>
export type AppuntamentoFormData = z.infer<typeof appuntamentoFormSchema>
