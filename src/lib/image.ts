import exifr from 'exifr';

export interface ImageDimensions {
  width: number;
  height: number;
}

export type ExifRow = [label: string, value: string];

export function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

/** Loads an image URL (e.g. from URL.createObjectURL) to read its pixel size. */
export function readImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = url;
  });
}

/** Reads EXIF tags from the file locally. Returns [] when there are none. */
export async function readExif(file: File): Promise<ExifRow[]> {
  try {
    const raw: Record<string, unknown> | undefined = await exifr.parse(file);
    return raw ? formatExif(raw) : [];
  } catch {
    return [];
  }
}

/** Flattens parsed EXIF data into display rows, skipping binary/nested values. */
export function formatExif(raw: Record<string, unknown>): ExifRow[] {
  const rows: ExifRow[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const text = formatExifValue(value);
    if (text !== null) rows.push([key, text]);
  }
  return rows;
}

function formatExifValue(value: unknown): string | null {
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(+value.toFixed(4));
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value) && value.length <= 4 && value.every((v) => typeof v === 'number')) {
    return value.join(', ');
  }
  return null;
}
