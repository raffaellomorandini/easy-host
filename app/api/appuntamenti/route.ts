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
    const newAppuntamento = await db.insert(appuntamenti).values(body).returning();
    return NextResponse.json(newAppuntamento[0], { status: 201 });
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