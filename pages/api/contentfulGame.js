import { createClient } from 'contentful';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

const client = createClient({
  space: serverRuntimeConfig.CONTENTFUL_SPACE_ID,
  accessToken: serverRuntimeConfig.CONTENTFUL_ACCESS_TOKEN,
});

const fetchGameByDate = async (date) => {
  const entries = await client.getEntries({
    content_type: 'game',
    'fields.date': date,
    include: 2,
  });

  if (entries.items.length > 0) {
    return entries.items[0].fields;
  }
  return null;
};

export default async (req, res) => {
    const { date } = req.query;
    const data = await fetchGameByDate(date);

    res.status(200).json(data);
};
