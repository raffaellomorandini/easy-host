import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { leads, appuntamenti } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allLeads = await db.select().from(leads).orderBy(leads.createdAt);
    return NextResponse.json(allLeads);
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