import ApolloClient from "apollo-client";
import {InMemoryCache, defaultDataIdFromObject} from "apollo-cache-inmemory";
import {ApolloLink} from 'apollo-link';
import {RetryLink} from 'apollo-link-retry';
import {HttpLink} from 'apollo-link-http';

const http_uri = window['BACKEND_API'] + '/graphql';

const dataIdFromObject = (result) => {
    return defaultDataIdFromObject(result);
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
    cache: new InMemoryCache({dataIdFromObject})
});