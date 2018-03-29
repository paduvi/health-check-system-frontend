import {customFetch} from '../graphql-client';

export const countUser = async () => {
    const response = await customFetch(window['BACKEND_API'] + '/user/count', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    const data = await response.json();

    return data;
}

export const findUserById = async (id) => {
    const response = await customFetch(window['BACKEND_API'] + '/user/findbyid/' + id, {
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

export const findAllUser = async () => {
    const response = await customFetch(window['BACKEND_API'] + '/user/findall', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            [window._csrf_header]: window._csrf
        },
        credentials: 'include'
    });

    if (response.status >= 200 && response.status < 300) {
        const data = await response.json();

        return data;
    }

    var error = new Error(response.statusText)
    error.response = response
    throw error
}

export const deleteUser = async (ids) => {
    const response = await customFetch(window['BACKEND_API'] + '/user/remove', {
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

export const findUserByName = async (name) => {
    const response = await customFetch(window['BACKEND_API'] + '/user/findbyname/' + name, {
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

export const getDefaultUser = async () => {
    const response = await customFetch(window['BACKEND_API'] + '/user/default', {
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

export const saveUser = async (service) => {
    const response = await customFetch(window['BACKEND_API'] + '/user/save', {
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