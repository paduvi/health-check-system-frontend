import {customFetch} from '../graphql-client';

export const findAllService = async () => {

    const response = await customFetch(window['BACKEND_API'] + '/service/findall', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}

export const findServiceByName = async (name) => {
    const response = await customFetch(window['BACKEND_API'] + '/service/findbyname/' + name, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}

export const findServiceById = async (id) => {
    const response = await customFetch(window['BACKEND_API'] + '/service/findbyid/' + id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}

export const getDefaultService = async () => {
    const response = await customFetch(window['BACKEND_API'] + '/service/default', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}

export const saveService = async (service) => {
    const response = await customFetch(window['BACKEND_API'] + '/service/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include',
        body: JSON.stringify(service)
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}

export const deleteService = async (ids) => {
    const response = await customFetch(window['BACKEND_API'] + '/service/remove', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include',
        body: JSON.stringify(ids)
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}

export const countRunningService = async () => {
    const response = await customFetch(window['BACKEND_API'] + '/service/count/running', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}

export const countStoppedService = async () => {
    const response = await customFetch(window['BACKEND_API'] + '/service/count/stopped', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
        return data;
    }

    var error = new Error(data.message);
    error.detail = data;
    throw error;
}