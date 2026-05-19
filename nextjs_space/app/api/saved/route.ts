import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session?.user as any)?.id;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const total = await prisma.savedItem.count({ where: { userId } });

    const savedItems = await prisma.savedItem.findMany({
      where: { userId },
      include: {
        trendItem: {
          include: {
            category: true,
            source: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = savedItems.map((saved: (typeof savedItems)[number]) => ({
      ...saved?.trendItem,
      isSaved: true,
      savedAt: saved?.createdAt,
      savedNotes: saved?.notes,
    }));

    return NextResponse.json({
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching saved items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session?.user as any)?.id;
    const body = await req.json();
    const { trendItemId, notes } = body;

    if (!trendItemId) {
      return NextResponse.json(
        { error: 'Trend item ID is required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedItem.findUnique({
      where: {
        userId_trendItemId: {
          userId,
          trendItemId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Item already saved' },
        { status: 400 }
      );
    }

    const savedItem = await prisma.savedItem.create({
      data: {
        userId,
        trendItemId,
        notes,
      },
    });

    return NextResponse.json(savedItem);
  } catch (error) {
    console.error('Error saving item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session?.user as any)?.id;
    const searchParams = req.nextUrl.searchParams;
    const trendItemId = searchParams.get('trendItemId');

    if (!trendItemId) {
      return NextResponse.json(
        { error: 'Trend item ID is required' },
        { status: 400 }
      );
    }

    await prisma.savedItem.delete({
      where: {
        userId_trendItemId: {
          userId,
          trendItemId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsaving item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
