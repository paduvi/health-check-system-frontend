import React from 'react';
import {Table, Input, Button, Icon, Avatar, Divider, Tooltip, Popconfirm, message, Spin} from 'antd';
import {Link} from 'react-router-dom';
import TimeAgo from 'react-timeago';
import {graphql, compose} from 'react-apollo';
import gql from 'graphql-tag';

class ServiceList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            filterNameVisible: false,
            filterUserVisible: false,
            allData: props.data.services ? props.data.services : null,
            data: props.data.services ? props.data.services : null,
            searchTextName: '',
            searchTextUser: '',
            nameFiltered: false,
            userFiltered: false
        }
    }

    componentDidMount = () => {
        this.props.data.refetch();
    }

    componentWillReceiveProps = ({data}) => {
        if (data.services !== this.props.data.services) {
            if (this.props.data.services) {
                const diff = this.compare(this.props.data.services, data.services);

                diff.forEach(e => {
                    const notification = (
                        <span>
                            <a href={"/service/edit/" + e.id}>{e.name}</a> has new notification!
                        </span>
                    );
                    message.info(notification, 0);
                })
            }
            let newState = {allData: data.services};
            if (!this.state.data) {
                newState.data = data.services;
            }
            return this.setState(newState, this.onSearch);
        }
    }

    compare = (oldArr, newArr) => {
        let diff = [];
        const temp = newArr.slice();
        oldArr.forEach(oldEle => {
            const id = oldEle.id;
            const idx = temp.findIndex(e => e.id === id);
            if (idx === -1) return;
            const [newEle] = temp.splice(idx, 1);
            if (newEle.healthy !== oldEle.healthy) {
                diff.push(newEle);
            }
        });
        return diff;
    }

    onInputNameChange = (e) => {
        this.setState({searchTextName: e.target.value});
    }

    onInputUserChange = (e) => {
        this.setState({searchTextUser: e.target.value});
    }

    confirmDelete = async (id) => {
        const hide = message.loading('Action in progress..', 0);
        try {
            const {data: {deleteService: success}} = await this.props.deleteServiceMutation({
                variables: {id},
                update: (store, {data: {deleteService: success}}) => {
                    if (!success)
                        return;
                    // Read the data from the cache for this query.
                    const data = store.readQuery({query: servicesQuery});

                    // Write the data back to the cache.
                    store.writeQuery({query: servicesQuery, data: data.services.filter(service => service.id !== id)});
                },
            });
            if (success) {
                message.success("Delete service successfully!");
            } else {
                message.error("Failed to delete service!");
            }
        } catch (err) {
            console.log(err);
            message.error("Error: " + err.message);
        } finally {
            hide();
        }
    }

    onSearch = (e) => {
        const {searchTextName, searchTextUser} = this.state;
        const regName = new RegExp(searchTextName, 'gi');
        const regUser = new RegExp(searchTextUser, 'gi');
        this.setState({
            ...e && {
                filterNameVisible: false,
                filterUserVisible: false,
            },
            nameFiltered: !!searchTextName,
            userFiltered: !!searchTextUser,
            data: this.state.allData.map((record) => {
                const matchName = record.name.match(regName);
                if (!matchName) {
                    return null;
                }
                const matchUser = record.user.name.match(regUser);
                if (!matchUser) {
                    return null;
                }
                return {
                    ...record,
                    name: (
                        <span>
                            {record.name.split(regName).map((text, i) => (
                                i > 0 ? [<span key={"match-name-" + i}
                                               className="highlight">{matchName[0]}</span>, text] : text
                            ))}
                        </span>
                    ),
                    user: {
                        ...record.user,
                        name: (
                            <span>
                              {record.user.name.split(regUser).map((text, i) => (
                                  i > 0 ? [<span key={"match-user-" + i}
                                                 className="highlight">{matchUser[0]}</span>, text] : text
                              ))}
                            </span>
                        )
                    }
                };
            }).filter(record => !!record),
        });
    }

    render() {
        if (this.props.data.loading && !this.state.data) {
            return <Spin size="large"/>
        }

        if (this.props.data.error) {
            console.log(this.props.data.error)
            return <div>An unexpected error occurred</div>
        }

        const columns = [{
            title: 'Service Name',
            dataIndex: 'name',
            render: (text, record) => (
                <Link to={'/service/edit/' + record.id}>{text}</Link>
            ),
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={ele => this.searchInputName = ele}
                        placeholder="Search name"
                        value={this.state.searchTextName}
                        onChange={this.onInputNameChange}
                        onPressEnter={this.onSearch}
                    />
                    <Button type="primary" onClick={this.onSearch}>Search</Button>
                </div>
            ),
            filterIcon: <Icon type="smile" style={{color: this.state.nameFiltered ? '#108ee9' : '#aaa'}}/>,
            filterDropdownVisible: this.state.filterNameVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterNameVisible: visible,
                }, () => this.searchInputName && this.searchInputName.focus());
            },
        }, {
            title: 'URL',
            dataIndex: 'pingUrl',
            width: '400px',
        }, {
            title: 'User',
            dataIndex: 'user.name',
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={ele => this.searchInputUser = ele}
                        placeholder="Search user"
                        value={this.state.searchTextUser}
                        onChange={this.onInputUserChange}
                        onPressEnter={this.onSearch}
                    />
                    <Button type="primary" onClick={this.onSearch}>Search</Button>
                </div>
            ),
            filterIcon: <Icon type="smile-o" style={{color: this.state.userFiltered ? '#108ee9' : '#aaa'}}/>,
            filterDropdownVisible: this.state.filterUserVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterUserVisible: visible,
                }, () => this.searchInputUser && this.searchInputUser.focus());
            },
        }, {
            title: 'Status',
            key: 'status',
            render: (text, record) => {
                if (!record.watching) {
                    return (
                        <div>
                            <Avatar size="small"/> Not watching
                        </div>
                    )
                }
                if (record.healthy) {
                    return (
                        <div>
                            <Avatar size="small" style={{backgroundColor: '#87d068'}}/> OK
                        </div>
                    )
                }
                return (
                    <div>
                        <Avatar size="small" style={{backgroundColor: '#f56a00'}}/> Stopped
                    </div>
                )
            },
            filters: [{
                text: 'Not watching',
                value: 'Not watching',
            }, {
                text: 'OK',
                value: 'OK',
            }, {
                text: 'Stopped',
                value: 'Stopped',
            }],
            filterMultiple: false,
            onFilter: (value, record) => {
                switch (value) {
                    case 'Not watching':
                        return !record.watching;
                    case 'OK':
                        return record.healthy;
                    case 'Stopped':
                        return !record.healthy;
                    default:
                        return true;
                }
            }
        }, {
            title: 'Last Checked',
            dataIndex: 'lastChecked',
            sorter: (a, b) => (a.lastChecked || Date.now()) - (b.lastChecked || Date.now()),
            render: (text) => text && <TimeAgo date={Number(text)}/>
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <Tooltip title="Edit">
                        <Link to={"/service/edit/" + record.id}><Icon type="edit"/></Link>
                    </Tooltip>
                    <Divider type="vertical"/>
                    <Tooltip title="Delete">
                        <Popconfirm title="Are you sure delete this service?"
                                    onConfirm={() => this.confirmDelete(record.id)}
                                    okText="Yes" cancelText="No">
                            <a><Icon type="delete"/></a>
                        </Popconfirm>
                    </Tooltip>
                </span>
            ),
        }];
        return (
            <div>
                <Table rowKey="id" columns={columns} dataSource={this.state.data}/>
                <Button onClick={() => this.props.history.push("/service/create")} icon="plus"
                        style={{
                            float: "left",
                            transform: this.state.data.length > 0 ? "translateY(-48px)" : "translateY(20px)"
                        }}>Add</Button>
            </div>
        );
    }
}

export const servicesQuery = gql`
  query serviceListQuery {
      services {
          id
          name
          pingUrl
          healthy
          watching
          lastChecked
          user {
            id
            name
          }
      }
  }
`

const deleteServiceMutation = gql`
  mutation deleteServiceMutation($id: ID!) {
    deleteService(id: $id)
  }
`

export default compose(
    graphql(servicesQuery, {
        options: {pollInterval: 2000, delay: false},
    }),
    graphql(deleteServiceMutation, {name: 'deleteServiceMutation'})
)(ServiceList);