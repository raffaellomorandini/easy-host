# Gestionale Leads - EasyHost

Un sistema completo per la gestione delle leads con autenticazione Google e database Neon.

## Caratteristiche

- ✅ Autenticazione sicura con Google OAuth (solo email autorizzate)
- ✅ Database PostgreSQL con Neon DB
- ✅ ORM con Drizzle per gestione database
- ✅ Dashboard completa per visualizzazione dati
- ✅ Gestione leads con stati (Lead, Cliente in Attesa, Cliente Confermato)
- ✅ Sistema di appuntamenti
- ✅ Interfaccia responsive con Tailwind CSS
- ✅ API RESTful per tutte le operazioni

## Setup Iniziale

### 1. Installa le dipendenze
```bash
pnpm install
```

### 2. Configura il database Neon
1. Vai su [Neon Console](https://console.neon.tech/)
2. Crea un nuovo progetto
3. Copia la connection string

### 3. Configura Google OAuth
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita l'API Google+ 
4. Crea credenziali OAuth 2.0
5. Aggiungi `http://localhost:3000/api/auth/callback/google` nelle URL autorizzate

### 4. Configura le variabili d'ambiente
Crea un file `.env.local` con:

```bash
# Auth
NEXTAUTH_SECRET=il-tuo-secret-super-sicuro-qui
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=il-tuo-google-client-id
GOOGLE_CLIENT_SECRET=il-tuo-google-client-secret

# Database
DATABASE_URL=la-tua-neon-connection-string

# Authorized emails (comma separated)
AUTHORIZED_EMAILS=tua-email@gmail.com,altra-email@gmail.com
```

### 5. Configura il database
```bash
# Genera le migrazioni
pnpm db:generate

# Esegui le migrazioni
pnpm db:migrate

# Importa i dati iniziali
pnpm db:seed
```

### 6. Avvia l'applicazione
```bash
pnpm dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## Struttura del Database

### Tabella `leads`
- `id` - ID univoco
- `nome` - Nome del lead
- `localita` - Località 
- `camere` - Numero di camere
- `telefono` - Numero di telefono
- `email` - Email
- `contattato` - Se è stato contattato (boolean)
- `note` - Note aggiuntive
- `status` - Stato: 'lead', 'cliente_attesa', 'cliente_confermato'
- `createdAt` / `updatedAt` - Timestamp

### Tabella `appuntamenti`
- `id` - ID univoco
- `leadId` - Riferimento al lead
- `data` - Data e ora appuntamento
- `tipo` - Tipo di appuntamento
- `luogo` - Luogo appuntamento
- `note` - Note aggiuntive
- `completato` - Se l'appuntamento è completato
- `createdAt` / `updatedAt` - Timestamp

## API Endpoints

### Leads
- `GET /api/leads` - Lista tutti i leads
- `POST /api/leads` - Crea un nuovo lead
- `PUT /api/leads` - Aggiorna un lead esistente

### Appuntamenti
- `GET /api/appuntamenti` - Lista tutti gli appuntamenti
- `POST /api/appuntamenti` - Crea un nuovo appuntamento  
- `PUT /api/appuntamenti` - Aggiorna un appuntamento esistente

## Tecnologie Utilizzate

- **Next.js 15** - Framework React
- **NextAuth.js 5** - Autenticazione
- **Drizzle ORM** - ORM per database
- **Neon DB** - Database PostgreSQL serverless
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Radix UI** - Componenti UI
- **Lucide React** - Icone

## Sicurezza

- Solo utenti con email autorizzate possono accedere
- Autenticazione gestita tramite Google OAuth
- Tutte le API routes sono protette
- Sessioni sicure con NextAuth.js

## Funzionalità Implementate

✅ Dashboard con statistiche  
✅ Lista leads con filtri per stato  
✅ Form per aggiungere/modificare leads  
✅ Sistema di appuntamenti  
✅ Autenticazione con controllo email  
✅ Database setup e migrazioni  
✅ Dati di esempio precaricati  

## Prossimi Sviluppi

- [ ] Pagine per gestione dettagliata leads
- [ ] Calendario appuntamenti interattivo
- [ ] Sistema di notifiche
- [ ] Export dati in Excel/PDF
- [ ] Analytics avanzati
- [ ] Mobile app companion

## Supporto

Per problemi o domande, consulta la documentazione o contatta il team di sviluppo.
