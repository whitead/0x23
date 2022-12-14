let selfieWorker = null;
const resolvers = {};
let id = 0;
const MAX_ID = 2 ** 10
let _vocabSize = null;

const startSelfiesWorker = () => {
    if (selfieWorker !== null)
        return;
    const file_dir = import.meta.url.replace(/[^/]*$/, '');
    ///const worker_url = new URL(file_dir + 'selfies_worker.js');
    const worker_url = new URL("./selfies_worker.js", import.meta.url);
    selfieWorker = new Worker(worker_url);
    selfieWorker.onmessage = (e) => {
        const data = e.data;
        const mid = data[1];
        const result = data[2];

        if (data[0] === 'vocab-size') {
            _vocabSize = result;
        }

        resolvers[mid](result);
        delete resolvers[mid];
    }
}

const selfiesLoadStatus = () => {
    if (selfieWorker === null) {
        return new Promise(resolve =>
            resolve({
                pyodide: 'waiting',
                selfies: 'waiting'
            }));
    }
    id = (id + 1) % MAX_ID;
    selfieWorker.postMessage(['loading-status', id, null]);
    return new Promise(resolve => resolvers[id] = resolve);
}

const decoder = (s) => {
    if (selfieWorker === null) {
        return new Promise((resolve, reject) =>
            reject(new Error('Must call startSelfiesWorker() first')));
    }
    id = (id + 1) % MAX_ID;
    selfieWorker.postMessage(['decoder', id, s]);
    return new Promise(resolve => resolvers[id] = resolve);
}

const encoder = (s) => {
    if (selfieWorker === null) {
        return new Promise((resolve, reject) =>
            reject(new Error('Must call startSelfiesWorker() first')));
    }
    id = (id + 1) % MAX_ID;
    selfieWorker.postMessage(['encoder', id, s]);
    return new Promise(resolve => resolvers[id] = resolve);
}

const vocabSize = () => {
    if (_vocabSize === null) {
        if (selfieWorker === null) {
            return new Promise((resolve, reject) =>
                reject(new Error('Must call startSelfiesWorker() first')));
        }
        id = (id + 1) % MAX_ID;
        selfieWorker.postMessage(['vocab-size', id, null]);
        return new Promise(resolve => resolvers[id] = resolve);
    } else {
        return new Promise(resolve => resolve(_vocabSize));
    }

}

const selfies = {
    startSelfiesWorker,
    selfiesLoadStatus,
    decoder,
    encoder,
    vocabSize
};

export default selfies;

