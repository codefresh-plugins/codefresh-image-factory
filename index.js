const crypto = require('crypto');
const chalk = require('chalk');
const rp = require('request-promise');
const { host, apiToken, image } = require('./config');

Promise.resolve()
    .then(() => rp({
            method: 'POST',
            uri: `${host}/api/images/external`,
            body: {
                Image: image,
                Digest: crypto.createHmac('sha256', image).update(`Digest-${image}`).digest('hex'),
                Id: crypto.createHmac('sha256', image).update(`Id-${image}`).digest('hex'),
            },
            headers: {
                'Authorization': `Bearer ${apiToken}`
            },
            json: true
        })
    )
    .then(() => console.log(chalk.green(`Image created successfully`)))
    .then(()=>process.exit(0))
    .catch(error => {
        console.log(chalk.red(error.message));
        process.exit(1);
    });
