import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { appuntamenti, leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allAppuntamenti = await db
      .select({
        id: appuntamenti.id,
        leadId: appuntamenti.leadId,
        data: appuntamenti.data,
        tipo: appuntamenti.tipo,
        luogo: appuntamenti.luogo,
        note: appuntamenti.note,
        completato: appuntamenti.completato,
        createdAt: appuntamenti.createdAt,
        leadNome: leads.nome,
        leadLocalita: leads.localita,
      })
      .from(appuntamenti)
      .leftJoin(leads, eq(appuntamenti.leadId, leads.id))
      .orderBy(appuntamenti.data);
    
    return NextResponse.json(allAppuntamenti);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('Received appuntamento data:', body);
    
    // Validazione dei dati
    if (!body.leadId || body.leadId <= 0) {
      return NextResponse.json({ error: 'Lead ID è richiesto e deve essere valido' }, { status: 400 });
    }
    
    if (!body.data) {
      return NextResponse.json({ error: 'Data è richiesta' }, { status: 400 });
    }

    // Verifica che il lead esista
    const leadExists = await db.select().from(leads).where(eq(leads.id, body.leadId)).limit(1);
    if (leadExists.length === 0) {
      return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 });
    }

    // Prepara i dati per l'inserimento
    const appointmentData = {
      leadId: parseInt(body.leadId),
      data: new Date(body.data),
      tipo: body.tipo || null,
      luogo: body.luogo || null,
      note: body.note || null,
      completato: Boolean(body.completato),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Inserting appointment data:', appointmentData);
    
    const newAppuntamento = await db.insert(appuntamenti).values(appointmentData).returning();
    return NextResponse.json(newAppuntamento[0], { status: 201 });
  } catch (error) {
    console.error('Error creating appuntamento:', error);
    return NextResponse.json({ 
      error: 'Database error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    updateData.updatedAt = new Date();
    
    const updatedAppuntamento = await db
      .update(appuntamenti)
      .set(updateData)
      .where(eq(appuntamenti.id, id))
      .returning();
    
    return NextResponse.json(updatedAppuntamento[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}