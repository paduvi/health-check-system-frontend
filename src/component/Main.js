import React, {PureComponent} from 'react';
import {Layout, Menu, Icon, Breadcrumb} from 'antd';
import {Route, Link} from 'react-router-dom';

import Dashboard from './Dashboard';
import ServiceList from './service/ServiceList';
import ServiceCreate from './service/ServiceCreate';
import ServiceDetail from './service/ServiceDetail';
import UserList from './user/UserList';
import UserCreate from './user/UserCreate';
import UserDetail from './user/UserDetail';

const {Content, Footer, Sider} = Layout;

const withSider = ComposedComponent => class extends PureComponent {
    state = {
        collapsed: true,
    };

    onCollapse = (collapsed) => {
        this.setState({collapsed});
    };

    render() {
        return <ComposedComponent {...this.state} {...this.props} onCollapse={this.onCollapse} onClick={this.onClick}/>
    }
}

const breadcrumbNameMap = {
    '/service': 'Service',
    '/service/create': 'Add',
    '/service/edit': 'Detail',
    '/user': 'User',
    '/user/create': 'Add',
    '/user/edit': 'Detail',
    // '/apps/1/detail': 'Detail',
    // '/apps/2/detail': 'Detail',
};

const Main = ({collapsed, onCollapse, location}) => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>
                    {breadcrumbNameMap[url]}
                </Link>
            </Breadcrumb.Item>
        );
    });
    const breadcrumbItems = [(
        <Breadcrumb.Item key="home">
            <Link to="/">Home</Link>
        </Breadcrumb.Item>
    )].concat(extraBreadcrumbItems);

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={onCollapse}
            >
                <div className="logo"/>
                <Menu theme="dark" selectable={false} mode="inline">
                    <Menu.Item key="1">
                        <Link to="/">
                            <Icon type="home"/>
                            <span>Home</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to="/service">
                            <Icon type="desktop"/>
                            <span>Service</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Link to="/user">
                            <Icon type="user"/>
                            <span>User</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                    <span onClick={() => {
                        window.location.href = "/logout";
                    }}>
                        <Icon type="poweroff"/>
                        <span>Logout</span>
                    </span>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Breadcrumb style={{margin: 20}}>
                    {breadcrumbItems}
                </Breadcrumb>
                <Content style={{margin: 16, textAlign: 'center'}}>
                    <Route exact path="/" component={Dashboard}/>
                    <Route exact path="/service" component={ServiceList}/>
                    <Route path="/service/create" component={ServiceCreate}/>
                    <Route path="/service/edit/:id" component={ServiceDetail}/>
                    <Route exact path="/user" component={UserList}/>
                    <Route path="/user/create" component={UserCreate}/>
                    <Route path="/user/edit/:id" component={UserDetail}/>
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    Copyright © 2018 Created by Paduvi
                </Footer>
            </Layout>
        </Layout>
    );
}

export default withSider(Main);