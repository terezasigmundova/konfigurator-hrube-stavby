import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { projectName, municipalityName, municipalityCode, postalCode } = body;

    const project = await prisma.project.create({
      data: {
        name: projectName || 'Modelový rodinný dům',
        inputs: {
          create: {
            municipalityName: municipalityName || 'Hustopeče',
            municipalityCode: municipalityCode || '584495',
            postalCode: postalCode || '693 01',
            truckAccess: 'YES',
            craneAccess: 'YES',
            storeysCount: 2,
            targetAssemblyDate: '2026-10',
          },
        },
        revisions: {
          create: {
            revisionNumber: 1,
            status: 'SUBMITTED',
            snapshots: {
              create: {
                catalogVersionName: 'DNK Catalog 2026.1',
                priceBookVersionName: 'Sazebník Vesper Frames 2026.Q3',
                snapshotData: JSON.stringify(body),
              },
            },
          },
        },
      },
      include: {
        inputs: true,
        revisions: {
          include: {
            snapshots: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Předobjednávka byla úspěšně vytvořena a uložena do neměnného snapshotu.',
      projectId: project.id,
      revisionId: project.revisions[0].id,
      snapshotId: project.revisions[0].snapshots[0].id,
    });
  } catch (error) {
    console.error('Error submitting project pre-order:', error);
    return NextResponse.json(
      { success: false, error: 'Nepodařilo se uložit předobjednávku.' },
      { status: 500 }
    );
  }
}
