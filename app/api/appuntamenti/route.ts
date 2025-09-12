import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { appuntamenti, leads } from '@/lib/db/schema';
import { eq, or, ilike, desc, asc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const completato = searchParams.get('completato') || '';
    const tipo = searchParams.get('tipo') || '';
    
    // Se è richiesto un ID specifico, restituisci solo quell'appuntamento
    if (id) {
      const appuntamento = await db
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
        .where(eq(appuntamenti.id, parseInt(id)))
        .limit(1);
      
      if (appuntamento.length === 0) {
        return NextResponse.json({ error: 'Appuntamento not found' }, { status: 404 });
      }
      return NextResponse.json(appuntamento[0]);
    }
    
    const offset = (page - 1) * limit;

    // Costruisci le condizioni WHERE
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(leads.nome, `%${search}%`),
          ilike(leads.localita, `%${search}%`),
          ilike(appuntamenti.tipo, `%${search}%`),
          ilike(appuntamenti.luogo, `%${search}%`),
          ilike(appuntamenti.note, `%${search}%`)
        )
      );
    }

    if (completato && completato !== 'all') {
      conditions.push(eq(appuntamenti.completato, completato === 'true'));
    }

    if (tipo && tipo !== 'all') {
      conditions.push(eq(appuntamenti.tipo, tipo));
    }

    // Costruisci la WHERE clause finale
    const whereClause = conditions.length > 0 
      ? conditions.length === 1 ? conditions[0] : and(...conditions)
      : undefined;

    // Esecuzione query con paginazione
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
      .where(whereClause)
      .orderBy(desc(appuntamenti.data))
      .limit(limit)
      .offset(offset);

    // Conteggio totale per la paginazione
    const totalCountResult = await db
      .select({ count: appuntamenti.id })
      .from(appuntamenti)
      .leftJoin(leads, eq(appuntamenti.leadId, leads.id))
      .where(whereClause);
    
    const totalCount = totalCountResult.length;
    const hasMore = offset + allAppuntamenti.length < totalCount;

    return NextResponse.json({
      appuntamenti: allAppuntamenti,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching appuntamenti:', error);
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

    if (!id) {
      return NextResponse.json({ error: 'ID è richiesto' }, { status: 400 });
    }

    // Gestisci la data se presente
    if (updateData.data) {
      updateData.data = new Date(updateData.data);
    }
    
    updateData.updatedAt = new Date();
    
    const updatedAppuntamento = await db
      .update(appuntamenti)
      .set(updateData)
      .where(eq(appuntamenti.id, id))
      .returning();

    if (updatedAppuntamento.length === 0) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }
    
    return NextResponse.json(updatedAppuntamento[0]);
  } catch (error) {
    console.error('Error updating appuntamento:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID è richiesto' }, { status: 400 });
    }

    const deletedAppuntamento = await db
      .delete(appuntamenti)
      .where(eq(appuntamenti.id, id))
      .returning();

    if (deletedAppuntamento.length === 0) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Appuntamento eliminato con successo', deletedAppuntamento: deletedAppuntamento[0] });
  } catch (error) {
    console.error('Error deleting appuntamento:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}