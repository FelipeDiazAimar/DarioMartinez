import { NextRequest, NextResponse } from 'next/server';

function resolveUrl(value: string, base: string) {
  try {
    return new URL(value, base).toString();
  } catch {
    return '';
  }
}

function pickImageFromHtml(html: string, baseUrl: string) {
  const metaCandidates = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i,
  ];

  for (const regex of metaCandidates) {
    const match = html.match(regex);
    const raw = match?.[1]?.trim();
    if (raw) {
      const resolved = resolveUrl(raw, baseUrl);
      if (resolved) {
        return resolved;
      }
    }
  }

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const imgRaw = imgMatch?.[1]?.trim();
  if (!imgRaw) {
    return '';
  }

  return resolveUrl(imgRaw, baseUrl);
}

async function fetchAsImage(url: string, referer?: string) {
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'image/*,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; DM-ImageProxy/1.0)',
      ...(referer ? { Referer: referer } : {}),
    },
  });

  return response;
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url')?.trim();

  if (!source) {
    return NextResponse.json(
      {
        success: false,
        message: 'Falta el parámetro url.',
      },
      { status: 400 },
    );
  }

  if (!/^https?:\/\//i.test(source)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Solo se permiten URLs http/https.',
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetchAsImage(source);

    if (!upstreamResponse.ok) {
      console.error('[image-proxy] upstream not ok', {
        source,
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'No se pudo obtener la imagen remota.',
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          source,
        },
        { status: 502 },
      );
    }

    const contentType = (upstreamResponse.headers.get('content-type') || 'application/octet-stream').toLowerCase();

    if (!contentType.startsWith('image/')) {
      const html = await upstreamResponse.text();
      const extractedImageUrl = pickImageFromHtml(html, source);

      if (!extractedImageUrl) {
        console.error('[image-proxy] non-image response and no image found in HTML', {
          source,
          contentType,
        });

        return NextResponse.json(
          {
            success: false,
            message: 'La URL no apunta a una imagen y no se encontró imagen embebida en la página.',
            source,
            contentType,
          },
          { status: 422 },
        );
      }

      const extractedResponse = await fetchAsImage(extractedImageUrl, source);

      if (!extractedResponse.ok) {
        console.error('[image-proxy] extracted image fetch failed', {
          source,
          extractedImageUrl,
          status: extractedResponse.status,
          statusText: extractedResponse.statusText,
        });

        return NextResponse.json(
          {
            success: false,
            message: 'Se detectó imagen en la página, pero no se pudo descargar.',
            source,
            extractedImageUrl,
            status: extractedResponse.status,
            statusText: extractedResponse.statusText,
          },
          { status: 502 },
        );
      }

      const extractedType = (extractedResponse.headers.get('content-type') || 'application/octet-stream').toLowerCase();
      const extractedBody = await extractedResponse.arrayBuffer();

      if (!extractedType.startsWith('image/')) {
        console.error('[image-proxy] extracted resource is not an image', {
          source,
          extractedImageUrl,
          extractedType,
        });

        return NextResponse.json(
          {
            success: false,
            message: 'La imagen detectada no devolvió un contenido de imagen válido.',
            source,
            extractedImageUrl,
            contentType: extractedType,
          },
          { status: 422 },
        );
      }

      console.info('[image-proxy] image extracted from HTML page', {
        source,
        extractedImageUrl,
        contentType: extractedType,
        bytes: extractedBody.byteLength,
      });

      return new NextResponse(extractedBody, {
        status: 200,
        headers: {
          'Content-Type': extractedType,
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    const body = await upstreamResponse.arrayBuffer();

    console.info('[image-proxy] image served', {
      source,
      status: upstreamResponse.status,
      contentType,
      bytes: body.byteLength,
    });

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('[image-proxy] request failed', {
      source,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener la imagen remota.',
        source,
      },
      { status: 500 },
    );
  }
}
