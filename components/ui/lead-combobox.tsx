"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

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
}

interface LeadComboboxProps {
  leads: Lead[]
  selectedLead: Lead | null
  onSelectLead: (lead: Lead | null) => void
  onSearch: (searchTerm: string) => void
  searching?: boolean
  placeholder?: string
  emptyMessage?: string
  className?: string
}

export function LeadCombobox({
  leads,
  selectedLead,
  onSelectLead,
  onSearch,
  searching = false,
  placeholder = "Cerca e seleziona una lead...",
  emptyMessage = "Nessuna lead trovata.",
  className
}: LeadComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Debounce search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue, onSearch])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cliente_confermato': return 'bg-green-100 text-green-800'
      case 'cliente_attesa': return 'bg-yellow-100 text-yellow-800'
      case 'foto': return 'bg-purple-100 text-purple-800'
      case 'appuntamento': return 'bg-blue-100 text-blue-800'
      case 'ghost': return 'bg-red-100 text-red-800'
      case 'ricontattare': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[40px] p-3"
          >
            {selectedLead ? (
              <div className="flex items-center gap-2 flex-1 text-left">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{selectedLead.nome}</div>
                  <div className="text-sm text-gray-500">
                    {selectedLead.localita} • {selectedLead.camere} camera{selectedLead.camere > 1 ? 'e' : ''}
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs", getStatusColor(selectedLead.status))}>
                  {getStatusText(selectedLead.status)}
                </Badge>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {selectedLead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectLead(null)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Cerca per nome, località, telefono..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
              />
              {searching && (
                <div className="ml-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                <div className="py-6 text-center text-sm text-gray-500">
                  {searchValue.trim() === '' ? (
                    "Inizia a digitare per cercare le lead..."
                  ) : searching ? (
                    "Ricerca in corso..."
                  ) : (
                    `Nessuna lead trovata per "${searchValue}"`
                  )}
                </div>
              </CommandEmpty>
              
              {/* Opzione per rimuovere selezione */}
              {selectedLead && (
                <CommandGroup heading="Azioni">
                  <CommandItem
                    value="none"
                    onSelect={() => {
                      onSelectLead(null)
                      setOpen(false)
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rimuovi selezione
                  </CommandItem>
                </CommandGroup>
              )}

              {leads.length > 0 && (
                <CommandGroup heading={`Lead trovate (${leads.length})`}>
                  {leads.map((lead) => (
                    <CommandItem
                      key={lead.id}
                      value={`${lead.nome}-${lead.localita}-${lead.id}`}
                      onSelect={() => {
                        onSelectLead(lead)
                        setOpen(false)
                      }}
                      className="p-3"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                          {lead.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{lead.nome}</div>
                              <div className="text-sm text-gray-500">
                                {lead.localita} • {lead.camere} camera{lead.camere > 1 ? 'e' : ''}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-xs", getStatusColor(lead.status))}>
                                {getStatusText(lead.status)}
                              </Badge>
                              {selectedLead?.id === lead.id && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </div>
                          {(lead.telefono || lead.email) && (
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                              {lead.telefono && <span>📞 {lead.telefono}</span>}
                              {lead.email && <span>✉️ {lead.email}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
