import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, session.user.id))
      .orderBy(tasks.createdAt);
    
    return NextResponse.json(userTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('Received task data:', body);
    
    // Validazione dei dati
    if (!body.titolo || body.titolo.trim() === '') {
      return NextResponse.json({ error: 'Titolo è richiesto' }, { status: 400 });
    }
    
    if (!body.tipo) {
      return NextResponse.json({ error: 'Tipo è richiesto' }, { status: 400 });
    }

    // Prepara i dati per l'inserimento
    const taskData = {
      userId: session.user.id,
      titolo: body.titolo.trim(),
      descrizione: body.descrizione || null,
      tipo: body.tipo,
      priorita: body.priorita || 'media',
      stato: body.stato || 'da_fare',
      dataScadenza: body.dataScadenza ? new Date(body.dataScadenza) : null,
      completato: Boolean(body.completato),
      colore: body.colore || '#3b82f6',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Inserting task data:', taskData);
    
    const newTask = await db.insert(tasks).values(taskData).returning();
    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ 
      error: 'Database error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID è richiesto' }, { status: 400 });
    }

    updateData.updatedAt = new Date();
    
    const updatedTask = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json({ error: 'Task non trovato' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID è richiesto' }, { status: 400 });
    }

    const deletedTask = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    if (deletedTask.length === 0) {
      return NextResponse.json({ error: 'Task non trovato' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Task eliminato con successo', deletedTask: deletedTask[0] });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}