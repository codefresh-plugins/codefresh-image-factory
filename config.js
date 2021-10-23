const crypto = require('crypto');
const image = process.env.IMAGE;
const accountName = process.env.CF_ACCOUNT;

module.exports = {

    image,

    digest: crypto.createHmac('sha256', image).update(`Digest-${accountName}-${image}`).digest('hex'),
    hash: crypto.createHash('sha1')
        .update(`hash-${accountName}-${image}`)
        .digest('hex')
        .replace(/-/g, '_').toLowerCase(),

    apiToken: process.env.CF_API_KEY,
    host: process.env.CF_URL || 'https://g.codefresh.io',

    buildId: process.env.BUILD_ID || undefined,
    pipelineId: process.env.PIPELINE_ID || undefined,

    inspectId: process.env.INSPECT_ID || crypto.createHmac('sha256', image).update(`Id-${accountName}-${image}`).digest('hex'),
    inspectSize: Number(process.env.INSPECT_SIZE) || undefined,
    inspectOs: process.env.INSPECT_OS || undefined,
    inspectArc: process.env.INSPECT_ARC || undefined,

    commitMsg: process.env.COMMIT_MSG || undefined,
    commitUrl: process.env.COMMIT_URL || undefined,


    dockerFile: process.env.DOCKERFILE || undefined,

    branch: process.env.BRANCH || undefined,
    sha: process.env.SHA || undefined,

    gitRepoOwner: process.env.GIT_REPO_OWNER || undefined,
    gitRepoName: process.env.GIT_REPO_NAME || undefined,
};

