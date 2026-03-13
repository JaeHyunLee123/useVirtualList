import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/items', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const items = Array.from({ length: limit }).map((_, i) => ({
      id: offset + i,
      title: `Fetched Item #${offset + i + 1}`,
      description: `Description for infinite scroll item ${offset + i + 1}`,
    }));

    return HttpResponse.json({
      items,
      nextOffset: offset + limit,
      totalCount: 1000, // let's pretend total is 1000 to eventually stop
    });
  }),
];
