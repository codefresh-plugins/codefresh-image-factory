const _ = require('lodash');
const colors = require('colors');
const rp = require('request-promise');
const config = require('./config');
const {host, apiToken, image} = config;
const {parseFamiliarName} = require('@codefresh-io/docker-reference');
const DIGEST_PREFIX_REGEX = /^sha256:/;

Promise.resolve()
    .then(getPreRequires)
    .then(buildArgs)
    .then(createImage)
    .then(() => console.log(colors.green(`Image created successfully`)))
    .then(() => process.exit(0))
    .catch(error => {
        console.log(colors.red(error.message));
        process.exit(1);
    });

async function getPreRequires() {
    try {
        const reference = parseFamiliarName(image);

        return Promise.all([

            config.buildId && rp({
                method: 'GET',
                uri: `${host}/api/builds/${config.buildId}`,
                headers: _getAuthHeader(),
                json: true
            }).then(build => {
                if (!build) {
                    throw Error(`Can't find build with id "${config.buildId}"`);
                }
                return build;
            }),

            config.pipelineId && rp({
                method: 'GET',
                uri: `${host}/api/pipelines/${config.pipelineId}`,
                headers: _getAuthHeader(),
                json: true
            }).then(pipeline => {
                if (!pipeline) {
                    throw Error(`Can't find pipeline with id "${config.pipelineId}"`);
                }
                return pipeline;
            })

        ]).then(([build, pipeline]) => ({
            reference, build, pipeline,
            imageName: reference.repository
        }));

    } catch (err) {
        throw Error(`Image is incorrect: ${err}`);
    }
}

function buildArgs({pipeline, build, imageName, reference}) {
    const progressId = build ? build.progress_id : undefined;
    const internalImageId = config.inspectId.replace(DIGEST_PREFIX_REGEX, '');
    const sha = config.commitUrl && _.last(config.commitUrl.replace(/\?.+$/,'').split('/'));
    const imageInfo = {
        pipeline: pipeline,
        buildDetails: {
            progressId,
            id: config.buildId,
            branch: config.branch,
            sha: config.sha || sha,
            commit: config.commitMsg,
            commitURL: config.commitUrl,
        },
        imageDetails: {
            inspect: {
                'Id': config.inspectId,
                'Size': config.inspectSize,
                'Os': config.inspectOs,
                'Architecture': config.inspectArc,
                Config: {
                    Labels: {
                        'io.codefresh.repo.owner': config.gitRepoOwner,
                        'io.codefresh.repo.name': config.gitRepoName,
                        'io.codefresh.repo.branch': config.branch,
                        'io.codefresh.repo.commit.message': config.commitMsg,
                        'io.codefresh.repo.commit.url': config.commitUrl,
                        'io.codefresh.repo.sha': config.sha || sha,
                    }
                }
            },
            imageName,
            hash: config.hash,
            imageDisplayName: imageName,
            dockerFile: config.dockerFile

        }
    };

    const digest = config.digest.replace(DIGEST_PREFIX_REGEX, '');
    const repoDigest = `${reference.repositoryUrl}@sha256:${digest}`;

    const registryInfo = {
        query: {
            internalImageId
        },
        imageDetails: {
            internalImageId,
            repoDigest,
            imageName,
        },
        tagInfo: {
            registry: reference.domain,
            repository: reference.repository,
            tag: reference.tag
        }
    };

    return {imageInfo, registryInfo};
}

async function createImage({imageInfo, registryInfo}) {

    return rp({
        method: 'POST',
        uri: `${host}/api/images`,
        body: {
            imageInfo,
            registryInfo
        },
        headers: _getAuthHeader(),
        json: true
    });
}


function _getAuthHeader() {
    return {'Authorization': `Bearer ${apiToken}`};
}
