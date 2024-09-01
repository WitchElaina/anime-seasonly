import Parser from 'rss-parser';

export async function parseRSS(params: { url: string }) {
  const parser = new Parser();
  const feed = await parser.parseURL(params.url);

  return {
    title: feed.title,
    items: feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      torrent: item.enclosure?.url,
    })),
  };
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await parseRSS(body);

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
