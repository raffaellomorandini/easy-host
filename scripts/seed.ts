import 'dotenv/config';
import { db } from '../lib/db';
import { leads } from '../lib/db/schema';

const seedLeads = [
  {
    nome: "Laura Liera",
    localita: "Pesaro",
    camere: 2,
    telefono: "3482288325",
    email: "lallybet@gmail.com",
    contattato: false,
    note: "Contattata telefonicamente e messaggio whatsapp, ma nessun riscontro.",
    status: "lead"
  },
  {
    nome: "Daniele Stefanelli",
    localita: "Pesaro", 
    camere: 1,
    telefono: "3294766118",
    email: "danielestefanelli52@gmail.com",
    contattato: false,
    note: "Contattato telefonicamente e rimasti in attesa di foto, ma nessun riscontro.",
    status: "lead"
  },
  {
    nome: "Antonio Aristide Bonetti",
    localita: "Milano",
    camere: 1, 
    telefono: "3337323545",
    email: "acpervinca@gmail.com",
    contattato: false,
    note: "",
    status: "lead"
  },
  {
    nome: "Daniele Giovagnoni",
    localita: "Bologna",
    camere: 1,
    telefono: "3472824126", 
    email: "giovagnonidaniele@gmail.com",
    contattato: true,
    note: "Incontro fissato per il 12/08, effettuato il prospetto.",
    status: "cliente_attesa"
  },
  {
    nome: "Daniele Pili",
    localita: "Como",
    camere: 2,
    telefono: "3801096691",
    email: "daniele.pili72@gmail.com", 
    contattato: true,
    note: "Effettuato il prospetto, pensava che le cifre delle nostre stime fossero troppo ottimistiche e voleva ricavarci 1000€/mese (meno cedolare), propone il primo anno con una soluzione simil subaffitto in cui gli paghiamo 1000€/mese al netto delle tasse e tutto il resto lo incassiamo noi. Alla fine dei primi 6/12 mesi di attività, in base a come lavora la struttura e ai numeri che genera valuterebbe se continuare con questa soluzione o se buttarsi sulla proposta iniziale di management che proponiamo. Importante, vuole quella cifra perchè gli servono per pagare mutuo di un altra casa che in un futuro potrebbe lasciarci in gestione [ottima impressione, complimentato per la preparazione]",
    status: "cliente_attesa"
  },
  {
    nome: "Lino",
    localita: "Fiuggi Frosinone",
    camere: 1,
    telefono: "3498760616",
    email: "linosera120@gmail.com",
    contattato: true,
    note: "Attende prospetto",
    status: "cliente_attesa"
  },
  {
    nome: "Domenico Esposito",
    localita: "Gavirate Varese", 
    camere: 4,
    telefono: "3914011522",
    email: "domenico@mmconsult.tech",
    contattato: true,
    note: "",
    status: "cliente_attesa"
  },
  {
    nome: "Flavia Frecchiami",
    localita: "Sesto San Giovanni",
    camere: 1,
    telefono: "3483953232",
    email: "f.frecchiami@libero.it",
    contattato: true,
    note: "Appartamento che deve essere ristrutturato a settembre",
    status: "cliente_attesa"
  },
  {
    nome: "Viviana Melotti",
    localita: "Verona",
    camere: 1,
    telefono: "3206027962",
    email: "viviana.melotti@gmail.com",
    contattato: true,
    note: "Appuntamento fissato per il 02/08; effettuato il prospetto.",
    status: "cliente_attesa"
  }
];

async function seed() {
  try {
    console.log('Seeding database...');
    
    for (const lead of seedLeads) {
      await db.insert(leads).values(lead);
      console.log(`Inserted lead: ${lead.nome}`);
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();