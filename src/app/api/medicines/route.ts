import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let medicines: any[] = [];

function loadMedicines() {
  if (medicines.length === 0) {
    const filePath = path.join(process.cwd(), 'public', 'medicines.json');
    medicines = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
}

export async function GET(req: NextRequest) {
  loadMedicines();
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get('search') || '').toLowerCase();
  if (!search) return NextResponse.json([]);
  const results = medicines
    .filter(med => med.name && med.name.toLowerCase().includes(search))
    .slice(0, 20);
  return NextResponse.json(results);
}
