import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Simple fallback id generator if nanoid is not installed
function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, purpose, targetBudget, totalPrice, slots } = body;

    if (!slots || !totalPrice) {
      return NextResponse.json({ success: false, error: 'Incomplete build data' }, { status: 400 });
    }

    const slug = generateSlug();

    const saved = await prisma.savedBuild.create({
      data: {
        slug,
        title: title || `${purpose || 'Custom'} Build (${Math.round(totalPrice).toLocaleString()} BDT)`,
        purpose: purpose || 'GENERAL',
        targetBudget: Number(targetBudget) || totalPrice,
        totalPrice: Number(totalPrice),
        partsJson: JSON.stringify(slots),
      },
    });

    return NextResponse.json({ success: true, slug: saved.slug, id: saved.id });
  } catch (error: unknown) {
    console.error('Error saving build:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save build' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    const saved = await prisma.savedBuild.findUnique({
      where: { slug },
    });

    if (!saved) {
      return NextResponse.json({ success: false, error: 'Build not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      build: {
        id: saved.id,
        slug: saved.slug,
        title: saved.title,
        purpose: saved.purpose,
        targetBudget: saved.targetBudget,
        totalPrice: saved.totalPrice,
        slots: JSON.parse(saved.partsJson),
        createdAt: saved.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error('Error retrieving build:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to retrieve build' },
      { status: 500 }
    );
  }
}
