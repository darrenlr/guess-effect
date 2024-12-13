module.exports = {
	reactStrictMode: true,
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
		  {
			source: '/(.*)',
			has: [
			  {
				type: 'protocol',
				value: 'http',
			  },
			],
			destination: 'https://guesseffect.wtf/:path*',
			permanent: true,
		  },
		];
	},
};
