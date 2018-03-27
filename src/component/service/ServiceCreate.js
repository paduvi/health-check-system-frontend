import React from 'react';
import {Form, Input, Select, Checkbox, Button, Icon, Tooltip, Row, Col, message, Spin} from 'antd';
import {findAllUser} from '../../action/User';
import {findServiceByName, getDefaultService} from '../../action/Service';
import debounce from 'lodash/debounce';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import {servicesQuery} from './ServiceList';

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

class ServiceCreate extends React.Component {

    state = {
        expand: false,
        users: [],
        ready: false,
        service: {advancedOption: {}, user: {}}
    };

    constructor(props) {
        super(props);
        this.validateUniqueName = debounce(this.validateUniqueName, 800);
        this.validatePayloadSchema = debounce(this.validatePayloadSchema, 800);
    }

    componentDidMount = async () => {
        return Promise.all([
            this.fetchDefaultService(),
            this.fetchUser()
        ]);
    }

    validateUniqueName = async (rule, value, callback) => {
        try {
            await findServiceByName(value);
            return callback(`Name '${value}' has existed!`);
        } catch (err) {
            if (err.detail.status === 400) {
                return callback();
            }
            callback(err.message);
        }
    }

    validatePayloadSchema = async (rule, value, callback) => {
        try {
            JSON.parse(value);
            return callback();
        } catch (err) {
            callback('Invalid JSON string');
        }
    }

    fetchDefaultService = async () => {
        try {
            const data = await getDefaultService();

            this.setState({service: data});
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
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

    handleSubmit = (e) => {
        e.preventDefault();
        const hide = message.loading('Action in progress..', 0);
        this.props.form.validateFieldsAndScroll(async (err, values) => {
            if (!err) {
                try {
                    const user = this.state.users.find(u => u.id === Number(values.user.id));
                    const service = {...values, user};
                    const {data: {createService: {id}}} = await this.props.mutate({
                        variables: {service},
                        update: (store, {data: {createService}}) => {
                            try {
                                // Read the data from the cache for this query.
                                const data = store.readQuery({query: servicesQuery});

                                // Add our channel from the mutation to the end.
                                data.services.push(createService);
                                // Write the data back to the cache.
                                store.writeQuery({query: servicesQuery, data});
                            } catch (err) {
                                console.log(err);
                            }
                        },
                    });

                    message.success("Add Success!");
                    this.props.history.push("/service/edit/" + id);
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

    render() {
        const {getFieldDecorator} = this.props.form;
        const {service} = this.state;
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

        return (
            <Form style={{padding: 36, background: '#fff'}} onSubmit={this.handleSubmit}>
                <Form.Item
                    {...formItemLayout}
                    label="Name"
                    hasFeedback
                >
                    {getFieldDecorator('name', {
                        rules: [
                            {required: true, message: 'Please input service\'s name!', whitespace: true},
                            {validator: this.validateUniqueName, message: "Name has existed!"}
                        ],
                        initialValue: service.name
                    })(
                        <Input/>
                    )}
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
                        ]
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
                    <Button type="primary" htmlType="submit">Add</Button>
                    <Button style={{marginLeft: 8}} onClick={this.handleReset}>Clear</Button>
                </Form.Item>
            </Form>
        );
    }
}

const addServiceMutation = gql`
  mutation addServiceMutation($service: ServiceInput!) {
    createService(service: $service) {
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
`;

export default graphql(
    addServiceMutation
)(Form.create()(ServiceCreate));