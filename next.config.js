module.exports = {
	reactStrictMode: true,
	serverRuntimeConfig: {
		RAWG_API_KEY: process.env.RAWG_API_KEY,
		CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
		CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
	},
	publicRuntimeConfig: {
	},
	env: {
	},
};
