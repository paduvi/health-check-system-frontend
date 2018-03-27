import React from 'react';
import {Table, Input, Button, Icon, Divider, Tooltip, Popconfirm, message} from 'antd';
import {Link} from 'react-router-dom';

import {findAllUser, deleteUser} from '../../action/User';

class UserList extends React.Component {
    state = {
        filterNameVisible: false,
        data: [],
        allData: [],
        searchTextName: '',
        nameFiltered: false,
    };

    componentDidMount = async () => {
        try {
            const data = await findAllUser();
            return this.setState({data, allData: data});
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
        }
    }

    onInputNameChange = (e) => {
        this.setState({searchTextName: e.target.value});
    }

    confirmDelete = async (id) => {
        try {
            const data = await deleteUser([id]);
            if (data.removed > 0) {
                this.setState({
                    data: this.state.data.filter(record => record.id !== id),
                    allData: this.state.allData.filter(record => record.id !== id)
                });
                return message.success("Delete " + data.removed + " user successfully!");
            }
            return message.error(<span>Fail to delete user <b>{data.detail}</b>. {data.message}</span>, 3);
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
        }
    }

    onSearch = () => {
        const {searchTextName} = this.state;
        const regName = new RegExp(searchTextName, 'gi');
        this.setState({
            filterNameVisible: false,
            nameFiltered: !!searchTextName,
            data: this.state.allData.map((record) => {
                const matchName = record.name.match(regName);
                if (!matchName) {
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
                    )
                };
            }).filter(record => !!record),
        });
    }

    render() {
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
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
            render: (text, record) => (
                <Link to={'/user/edit/' + record.id}>{text}</Link>
            ),
            filterIcon: <Icon type="smile-o" style={{color: this.state.nameFiltered ? '#108ee9' : '#aaa'}}/>,
            filterDropdownVisible: this.state.filterNameVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterNameVisible: visible,
                }, () => this.searchInputName && this.searchInputName.focus());
            },
        }, {
            title: 'Action',
            key: 'action',
            width: '120px',
            render: (text, record) => (
                <span>
                    <Tooltip title="Edit">
                        <Link to={"/user/edit/" + record.id}><Icon type="edit"/></Link>
                    </Tooltip>
                    <Divider type="vertical"/>
                    <Tooltip title="Delete">
                        <Popconfirm title="Are you sure delete this user?"
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
                <Button onClick={() => this.props.history.push("/user/create")} icon="plus"
                        style={{
                            float: "left",
                            transform: this.state.data.length > 0 ? "translateY(-48px)" : "translateY(20px)"
                        }}>Add</Button>
            </div>
        );
    }
}

export default UserList;