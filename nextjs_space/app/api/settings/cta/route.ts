import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { ctaSettings: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ ctaSettings: user.ctaSettings || getDefaultCTASettings() });
  } catch (error) {
    console.error('Error fetching CTA settings:', error);
    return NextResponse.json({ error: 'Failed to fetch CTA settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ctaSettings } = body;

    if (!ctaSettings) {
      return NextResponse.json({ error: 'CTA settings required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { ctaSettings },
      select: { id: true, ctaSettings: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'CTA settings updated successfully',
      ctaSettings: user.ctaSettings 
    });
  } catch (error) {
    console.error('Error updating CTA settings:', error);
    return NextResponse.json({ error: 'Failed to update CTA settings' }, { status: 500 });
  }
}

function getDefaultCTASettings() {
  return {
    enabled: true,
    book: {
      enabled: false,
      title: '',
      description: '',
      buyLink: '',
      price: ''
    },
    video: {
      enabled: false,
      title: '',
      description: '',
      videoLink: ''
    },
    affiliateProducts: [],
    customCTAs: [],
    placement: 'end', // 'end', 'middle', 'both'
    style: 'invitational' // 'invitational', 'direct', 'educational'
  };
}
