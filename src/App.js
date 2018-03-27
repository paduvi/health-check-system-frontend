import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {ApolloProvider} from 'react-apollo';
import graphQlClient from './graphql-client';

import Main from './component/Main';
import NotFound from './component/NotFound';


export default () => (
    <ApolloProvider client={graphQlClient}>
        <Router>
            <Switch>
                <Route exact path="/" component={Main}/>
                <Route exact path="/service" component={Main}/>
                <Route path="/service/create" component={Main}/>
                <Route path="/service/edit/:id" component={Main}/>
                <Route exact path="/user" component={Main}/>
                <Route path="/user/create" component={Main}/>
                <Route path="/user/edit/:id" component={Main}/>
                <Route path="*" component={NotFound}/>
            </Switch>
        </Router>
    </ApolloProvider>
);