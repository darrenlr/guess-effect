module.exports = {
	reactStrictMode: true,
	images: {
		domains: ['images.igdb.com'],
	},	
	serverRuntimeConfig: {
	},
	publicRuntimeConfig: {
	},
	env: {
	},
	async redirects() {
		return [
		  {
			source: '/(.*)',
			has: [
			  {
				type: 'host',
				value: 'www.guesseffect.wtf',
			  },
			],
			destination: 'https://guesseffect.wtf/:path*',
			permanent: true,
		  },
		];
	},
};
