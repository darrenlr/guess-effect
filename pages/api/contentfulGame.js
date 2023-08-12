import { createClient } from 'contentful';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

const client = createClient({
  space: serverRuntimeConfig.CONTENTFUL_SPACE_ID,
  accessToken: serverRuntimeConfig.CONTENTFUL_ACCESS_TOKEN,
});

const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return (midnight - now) / 1000;
};

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

    const secondsUntilMidnight = getSecondsUntilMidnight();

    res.setHeader('Cache-Control', `s-maxage=${secondsUntilMidnight}, stale-while-revalidate`);

    res.status(200).json(data);
};
