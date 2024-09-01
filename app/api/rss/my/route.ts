import clientPromise from '@/lib/mongodb';

async function getMyRSS() {
  const client = await clientPromise;
  const collection = client.db('anime').collection('rss');

  const results = await collection
    .find({}, { projection: { _id: 0 } })
    .toArray();

  return results;
}

export async function GET() {
  const data = await getMyRSS();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
