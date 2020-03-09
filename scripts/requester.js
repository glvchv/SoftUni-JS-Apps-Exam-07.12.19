// const username = '';
// const password = '';

const baseUrl = 'https://baas.kinvey.com';
const appKey = 'kid_SkNoZC_Tr';
const appSecret = '49a271d51fdc47d380d7d4999a46ca77';

function createAuthorization(type) {
    return type === 'Basic' 
    ? `Basic ${btoa(`${appKey}:${appSecret}`)}`
    : `Kinvey ${sessionStorage.getItem('authtoken')}`
}
function createHeaders(httpMethod, data, type) {
    const headers = {
        method: httpMethod,
        headers: {
            'Authorization': createAuthorization(type),
            'Content-Type': 'application/json'
        }
    }

    if (httpMethod === 'POST' || httpMethod === 'PUT') {
        headers.body = JSON.stringify(data)
    }

    return headers;
}

function errorHandler(e) {
    if (!e.ok) {
        throw new Error(e.statusText)
    }
    return e;
}

function resToJSON(r) {
    if (r.status === 204) {
        return r;
    }
    return r.json();
}

function fetchURL(kinveyModule, endPoint, headers) {
    const url = `${baseUrl}/${kinveyModule}/${appKey}/${endPoint}`;

    return fetch(url, headers)
        .then(errorHandler)
        .then(resToJSON)
}

export function getReq(kinveyModule, endPoint, type) {
    const headers = createHeaders('GET', type);
    return fetchURL(kinveyModule, endPoint, headers);
}

export function postReq(kinveyModule, endPoint, data, type) {
    const headers = createHeaders('POST', data, type);
    return fetchURL(kinveyModule, endPoint, headers);
}

export function putReq(kinveyModule, endPoint, data, type) {
    const headers = createHeaders('PUT', data, type);
    return fetchURL(kinveyModule, endPoint, headers);
}

export function deleteReq(kinveyModule, endPoint, type) {
    const headers = createHeaders('DELETE', type);
    return fetchURL(kinveyModule, endPoint, headers);
}