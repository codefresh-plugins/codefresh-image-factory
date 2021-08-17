module.exports = {
    image: process.env.IMAGE,

    apiToken: process.env.CF_API_KEY,
    accountName: process.env.CF_ACCOUNT,
    host: process.env.CF_URL || 'https://g.codefresh.io',
};

