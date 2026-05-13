import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/trends/[id]
 * Update a trend item's summary (or other mutable fields).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { summary } = body;

    if (typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'summary must be a string' },
        { status: 400 }
      );
    }

    // Verify the item exists
    const existing = await prisma.trendItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Trend item not found' }, { status: 404 });
    }

    const updated = await prisma.trendItem.update({
      where: { id },
      data: { summary: summary.substring(0, 5000) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating trend item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trends/[id]
 * Retrieve a single trend item by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const item = await prisma.trendItem.findUnique({
      where: { id: params.id },
      include: { category: true, source: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Trend item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching trend item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
