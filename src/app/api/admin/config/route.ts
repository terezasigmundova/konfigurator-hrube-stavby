import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configFilePath = path.join(process.cwd(), 'src/lib/catalog/data/master_config.json');

export async function GET() {
  try {
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ error: 'Config file not found' }, { status: 404 });
  } catch (error) {
    console.error('Error reading master config:', error);
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedData = await request.json();
    if (!updatedData || !updatedData.products || !updatedData.stepUiTexts || !updatedData.budgetRatesAndLogistics) {
      return NextResponse.json({ error: 'Invalid config structure' }, { status: 400 });
    }

    fs.writeFileSync(configFilePath, JSON.stringify(updatedData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Master config successfully saved.' });
  } catch (error) {
    console.error('Error saving master config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
