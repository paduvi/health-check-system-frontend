import ApolloClient from "apollo-client";
import {InMemoryCache, defaultDataIdFromObject} from "apollo-cache-inmemory";
import {ApolloLink} from 'apollo-link';
import {RetryLink} from 'apollo-link-retry';
import {HttpLink} from 'apollo-link-http';

const http_uri = window['BACKEND_API'] + '/graphql';

const dataIdFromObject = (result) => {
    return defaultDataIdFromObject(result);
}

// Reference: https://blog.beeaweso.me/refreshing-token-based-authentication-with-apollo-client-2-0-7d45c20dc703
// Create customFetch function for handling re-authorization
// This customFetch (or any fetch you pass to the link) gets uri and options as arguments. We'll use those when we actually execute a fetch.
export const customFetch = async (uri, options) => {

    // Create initial fetch, this is what would normally be executed in the link without the override
    // The apolloHttpLink expects that whatever fetch function is used, it returns a promise.

    const response = await fetch(uri, options);
    if (response.status === 401) {
        return window.location.reload(true);
    }

    // Here we return the initialRequest promise
    return response;
}

const link = ApolloLink.from([
    new RetryLink(),
    new HttpLink({
        uri: http_uri,
        credentials: 'include',
        headers: {
            [window._csrf_header]: window._csrf
        }
    })
]);


export default new ApolloClient({
    link,
    fetch: customFetch,
    cache: new InMemoryCache({dataIdFromObject})
});