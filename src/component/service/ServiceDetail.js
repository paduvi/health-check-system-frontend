import React from 'react';
import {Form, Input, Select, Checkbox, Button, Icon, Tooltip, Row, Col, message, Spin, List} from 'antd';
import debounce from "lodash/debounce";
import {graphql, compose} from 'react-apollo';
import gql from 'graphql-tag';

import {servicesQuery} from "./ServiceList";
import {findAllUser} from '../../action/User';

const Option = Select.Option;

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 4},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 18},
    },
};

const advancedFormItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 7},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 15},
    },
};

const tailFormItemLayout = {
    wrapperCol: {
        xs: {span: 22},
    },
    style: {
        textAlign: 'right'
    }
};

class ServiceDetail extends React.Component {

    constructor(props) {
        super(props);
        this.validatePayloadSchema = debounce(this.validatePayloadSchema, 800);

        this.state = {
            expand: false,
            users: [],
            ready: false,
            service: props.data.service ? props.data.service : null
        };
    }

    componentDidMount = async () => {
        return Promise.all([
            this.fetchUser(),
            this.props.data.refetch()
        ]);
    }

    componentWillReceiveProps({data: {service}}) {
        if (service !== this.props.data.service) {
            if (this.props.data.service && this.props.data.service.healthy !== service.healthy) {
                const notification = (
                    <span>New Notification
                        <Button icon="close" onClick={message.destroy}
                                style={{border: "none", right: "-10px"}}/>
                    </span>
                );
                message.info(notification, 0);
            }
            this.setState({service});
        }
    }

    fetchUser = async () => {
        try {
            const data = await findAllUser();
            this.setState({users: data, ready: true});
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
        }
    }

    validatePayloadSchema = (rule, value, callback) => {
        try {
            JSON.parse(value);
            return callback();
        } catch (err) {
            callback('Invalid JSON string');
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const hide = message.loading('Action in progress..', 0);
        this.props.form.validateFieldsAndScroll(async (err, values) => {
            if (!err) {
                try {
                    const user = this.state.users.find(u => u.id === Number(values.user.id));
                    const service = {...this.state.service, ...values, user, __typename: undefined};
                    console.log(service);
                    await this.props.updateServiceMutation({
                        variables: {id: this.props.match.params.id, service},
                        update: (store, {data: {updateService}}) => {
                            try {
                                // Read the data from the cache for this query.
                                const data = store.readQuery({query: servicesQuery});

                                if (!data.services)
                                    return;
                                const services = data.services.map(s => {
                                    if (s.id === updateService.id) {
                                        return updateService;
                                    }
                                    return s;
                                })
                                // Write the data back to the cache.
                                store.writeQuery({query: servicesQuery, data: {...data, services}});
                            } catch (err) {
                                console.log(err);
                            }
                        },
                    });
                    message.success("Update Success!");
                } catch (err) {
                    console.log(err);
                    message.error("Error: " + err.message);
                }
            }
            hide();
        });
    }

    handleReset = () => {
        this.props.form.resetFields();
    }

    toggle = () => {
        const {expand} = this.state;
        this.setState({expand: !expand});
    }

    convertTimestampToString = (ts) => {
        const d = new Date(Number(ts));
        const date = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        const month = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
        const year = d.getFullYear();

        const hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
        const minute = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
        const second = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
        return <span style={{fontSize: 12}}>{date}-{month}-{year} &nbsp; {hour}:{minute}:{second}</span>;
    }

    render() {
        const {service} = this.state;

        if (this.props.data.loading && !service) {
            return <Spin size="large"/>
        }

        if (this.props.data.error) {
            console.log(this.props.data.error)
            return <div>An unexpected error occurred</div>
        }

        const {getFieldDecorator} = this.props.form;

        const tooltipSchema = (
            <span>
                Payload Schema
                <Tooltip title={
                    <ul>
                        <li>Tham khảo schema spec tại <a target="_blank" rel="noopener noreferrer"
                                                         href="https://github.com/java-json-tools/json-schema-validator">đây</a>.
                        </li>
                        <li>Test schema tại <a target="_blank" rel="noopener noreferrer"
                                               href="http://json-schema-validator.herokuapp.com/">đây</a>.
                        </li>
                    </ul>
                }>
                    <a><Icon style={{marginLeft: 5}} type="question-circle-o"/></a>
                </Tooltip>
            </span>
        );

        let status;
        if (!service.watching) {
            status = <span className="tag">Not watching</span>;
        } else if (service.healthy) {
            status = <span className="tag success">OK</span>;
        } else {
            status = <span className="tag error">Stopped</span>
        }

        return (
            <div>
                <Form style={{padding: 36, background: '#fff'}} onSubmit={this.handleSubmit}>
                    <Form.Item
                        {...formItemLayout}
                        style={{textAlign: 'left'}}
                        label="Name"
                    >
                    <span>
                        <b>{service.name}</b> {status}
                    </span>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="URL"
                        hasFeedback
                    >
                        {getFieldDecorator('pingUrl', {
                            rules: [{
                                type: "url",
                                message: 'Please input valid url!',
                            }, {
                                required: true,
                                message: 'Please input service\'s ping url!',
                                whitespace: true
                            }],
                            initialValue: service.pingUrl
                        })(
                            <Input/>
                        )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="User"
                        hasFeedback
                    >
                        {getFieldDecorator('user.id', {
                            rules: [
                                {required: true, message: 'Please select user!'},
                            ],
                            initialValue: service.user.id ? service.user.id.toString() : undefined
                        })(
                            this.state.ready ? (
                                <Select placeholder="Select user">
                                    {this.state.users.map(u => <Option key={u.id} title={u.name}>{u.name}</Option>)}
                                </Select>
                            ) : <Spin size="small"/>
                        )}
                    </Form.Item>
                    <Row style={{display: this.state.expand ? 'block' : 'none'}}>
                        <Col offset={6} span={16} className="ant-advanced-form">
                            <Form.Item
                                {...advancedFormItemLayout}
                                label="Active URL"
                                hasFeedback
                            >
                                {getFieldDecorator('advancedOption.activeUrl', {
                                    initialValue: service.advancedOption.activeUrl
                                })(
                                    <Input/>
                                )}
                            </Form.Item>
                            <Form.Item
                                {...advancedFormItemLayout}
                                label="Poll Duration"
                                hasFeedback
                            >
                                {getFieldDecorator('advancedOption.pollDurationInSeconds', {
                                    initialValue: service.advancedOption.pollDurationInSeconds ?
                                        service.advancedOption.pollDurationInSeconds.toString() : '10',
                                    rules: [{
                                        pattern: /^\d+$/, message: 'The input is invalid number!'
                                    }, {
                                        required: true, message: 'Please input poll duration!', whitespace: true
                                    }],
                                })(
                                    <Input addonAfter="second&nbsp;&nbsp;&nbsp;&nbsp;"/>
                                )}
                            </Form.Item>
                            <Form.Item
                                {...advancedFormItemLayout}
                                label={tooltipSchema}
                                hasFeedback
                            >
                                {getFieldDecorator('advancedOption.payloadSchema', {
                                    initialValue: service.advancedOption.payloadSchema,
                                    rules: [{
                                        required: true, message: 'Please input Payload Schema!', whitespace: true
                                    }, {
                                        validator: this.validatePayloadSchema, message: "Invalid JSON string!"
                                    }],
                                })(
                                    <Input.TextArea autosize={true}/>
                                )}
                            </Form.Item>
                            <Form.Item style={{display: 'inline-block'}}>
                                {getFieldDecorator('advancedOption.autoRestart', {
                                    valuePropName: 'checked',
                                    initialValue: service.advancedOption.autoRestart
                                })(
                                    <Checkbox>Auto Restart</Checkbox>
                                )}
                            </Form.Item>
                            <Form.Item style={{display: 'inline-block'}}>
                                {getFieldDecorator('watching', {
                                    valuePropName: 'checked',
                                    initialValue: service.watching
                                })(
                                    <Checkbox>Watch</Checkbox>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        {...tailFormItemLayout}
                    >
                        <a style={{marginRight: 8, fontSize: 12}} onClick={this.toggle}>
                            Advanced Options <Icon type={this.state.expand ? 'up' : 'down'}/>
                        </a>
                        <Button type="primary" htmlType="submit">Update</Button>
                        <Button style={{marginLeft: 8}} onClick={this.handleReset}>Reset</Button>
                    </Form.Item>
                </Form>

                <div className="demo-container">
                    <List
                        style={{textAlign: "left"}}
                        header={<h3>LOG:</h3>}
                        dataSource={this.props.logsQuery.logs}
                        renderItem={item => {
                            const status = item.healthy ?
                                <span className="tag success">OK</span> :
                                <span className="tag error">Stopped</span>;
                            return (
                                <List.Item key={item.id}>
                                    <List.Item.Meta
                                        title={<a>#{item.id} {status}</a>}
                                        description={item.message}
                                    />
                                    <div>{this.convertTimestampToString(item.executedAt)}</div>
                                </List.Item>
                            )
                        }}
                    >
                        {this.props.logsQuery.loading && !this.props.logsQuery.logs &&
                        <Spin className="demo-loading"/>}
                    </List>
                </div>
            </div>
        );
    }
}

const serviceQuery = gql`
  query serviceQuery($id: ID!) {
      service(id: $id) {
          id
          name
          pingUrl
          healthy
          watching
          user {
            id
            name
          }
          advancedOption {
            autoRestart
            activeUrl
            pollDurationInSeconds
            payloadSchema
          }
      }
  }
`

const updateServiceMutation = gql`
  mutation updateServiceMutation($id: ID!, $service: ServiceInput!) {
    updateService(id: $id, service: $service) {
      id
      name
      pingUrl
      healthy
      watching
      user {
        id
        name
      }
      lastChecked
    }
  }
`

const logsQuery = gql`
  query logsQuery($serviceId: Int!) {
      logs(serviceId: $serviceId) {
          id
          serviceId
          healthy
          message
          executedAt
      }
  }
`

export default compose(
    graphql(updateServiceMutation, {name: 'updateServiceMutation'}),
    graphql(logsQuery, {
        name: 'logsQuery',
        options: (props) => ({
            variables: {serviceId: props.match.params.id},
            pollInterval: 5000
        })
    }),
    graphql(serviceQuery, {
        options: (props) => ({
            variables: {id: props.match.params.id},
            pollInterval: 5000
        })
    })
)(Form.create()(ServiceDetail));