import { NextResponse } from 'next/server';
import { takeScreenshot } from '@/utils/screenshot';
import { uploadScreenshot } from '@/utils/cloudinary';
import pool from '@/utils/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  try {
    const { url, id } = await request.json();
    console.log('URL:', url);
    console.log('ID:', id);

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (id) {
      const [existingRows] = await pool.execute(
        'SELECT image_url FROM screenshots WHERE id = ?',
        [id]
      ) as [any[], any];

      if (existingRows.length > 0) {
        return NextResponse.json({
          message: 'Screenshot found',
          id,
          imageUrl: existingRows[0].image_url
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    const screenshot = await takeScreenshot(url);
    const imageUrl = await uploadScreenshot(screenshot);
    const newId = id || randomUUID();

    const query = 'INSERT INTO screenshots (id, url, image_url) VALUES (?, ?, ?)';
    await pool.execute(query, [newId, url, imageUrl]);

    return NextResponse.json({
      message: 'Screenshot saved successfully',
      id: newId,
      imageUrl
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error processing screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to process screenshot' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const [rows] = await pool.execute(
        'SELECT image_url FROM screenshots WHERE id = ?',
        [id]
      ) as [any[], any];

      if (!rows.length) {
        return NextResponse.json({ error: 'Screenshot not found' }, {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      return NextResponse.json({
        imageUrl: rows[0].image_url
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const [rows] = await pool.execute('SELECT id, url, image_url FROM screenshots') as [any[], any];
    return NextResponse.json(rows, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screenshots' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}