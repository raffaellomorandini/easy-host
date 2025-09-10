import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { leads, appuntamenti } from '@/lib/db/schema';
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
    const status = searchParams.get('status') || '';
    const contattato = searchParams.get('contattato') || '';
    
    // Se è richiesto un ID specifico, restituisci solo quella lead
    if (id) {
      const lead = await db.select().from(leads).where(eq(leads.id, parseInt(id))).limit(1);
      if (lead.length === 0) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json(lead[0]);
    }
    
    const offset = (page - 1) * limit;

    // Costruisci le condizioni WHERE
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(leads.nome, `%${search}%`),
          ilike(leads.localita, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.telefono, `%${search}%`)
        )
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(leads.status, status));
    }

    if (contattato && contattato !== 'all') {
      conditions.push(eq(leads.contattato, contattato === 'contattato'));
    }

    // Costruisci la WHERE clause finale
    const whereClause = conditions.length > 0 
      ? conditions.length === 1 ? conditions[0] : and(...conditions)
      : undefined;

    // Esecuzione query con paginazione
    const allLeads = whereClause 
      ? await db.select().from(leads).where(whereClause).orderBy(desc(leads.createdAt)).limit(limit).offset(offset)
      : await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);

    // Conteggio totale per la paginazione
    const totalCountResult = whereClause
      ? await db.select({ count: leads.id }).from(leads).where(whereClause)
      : await db.select({ count: leads.id }).from(leads);
    
    const totalCount = totalCountResult.length;

    const hasMore = offset + allLeads.length < totalCount;

    return NextResponse.json({
      leads: allLeads,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
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
    const newLead = await db.insert(leads).values(body).returning();
    return NextResponse.json(newLead[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
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
    
    const updatedLead = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();
    
    return NextResponse.json(updatedLead[0]);
  } catch (error) {
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
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Prima elimina gli appuntamenti associati al lead
    await db.delete(appuntamenti).where(eq(appuntamenti.leadId, id));
    
    // Poi elimina il lead
    const deletedLead = await db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning();

    if (deletedLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Lead eliminato con successo', deletedLead: deletedLead[0] });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}