module.exports = {
	reactStrictMode: true,
	serverRuntimeConfig: {
		RAWG_API_KEY: process.env.RAWG_API_KEY,
		IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID,
		IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET
	},
	publicRuntimeConfig: {
	},
	env: {
	},
};
