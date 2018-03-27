import React from 'react';
import {Form, Input, Checkbox, Button, message} from 'antd';
import {saveUser, findUserByName, getDefaultUser} from '../../action/User';
import debounce from 'lodash/debounce';

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

const tailFormItemLayout = {
    wrapperCol: {
        xs: {span: 22},
    },
    style: {
        textAlign: 'right'
    }
};

class UserCreate extends React.Component {

    state = {
        user: {}
    };

    constructor(props) {
        super(props);
        this.validateUniqueName = debounce(this.validateUniqueName, 800);
    }

    componentDidMount = async () => {
        return this.fetchDefaultUser();
    }

    validateUniqueName = async (rule, value, callback) => {
        try {
            await findUserByName(value);
            return callback(`Name '${value}' has existed!`);
        } catch (err) {
            if (err.detail.status === 400) {
                return callback();
            }
            callback(err.message);
        }
    }

    fetchDefaultUser = async () => {
        try {
            const data = await getDefaultUser();

            this.setState({user: data});
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(async (err, values) => {
            if (!err) {
                try {
                    const data = await saveUser(values);
                    message.success("Add Success!");
                    this.props.history.push("/user/edit/" + data.id);
                } catch (err) {
                    console.log(err.detail);
                    return message.error("Error: " + err.message);
                }
            }
        });
    }

    handleReset = () => {
        this.props.form.resetFields();
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {user} = this.state;

        return (
            <Form style={{padding: 36, background: '#fff'}} onSubmit={this.handleSubmit}>
                <Form.Item
                    {...formItemLayout}
                    label="Name"
                    hasFeedback
                >
                    {getFieldDecorator('name', {
                        rules: [
                            {required: true, message: 'Please input user\'s name!', whitespace: true},
                            {validator: this.validateUniqueName, message: "Name has existed!"}
                        ],
                        initialValue: user.name
                    })(
                        <Input/>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="Tel"
                    hasFeedback
                >
                    {getFieldDecorator('tel', {
                        rules: [{
                            required: true,
                            message: 'Please input user\'s telephone number!',
                            whitespace: true
                        }],
                        initialValue: user.tel
                    })(
                        <Input/>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="Mail"
                    hasFeedback
                >
                    {getFieldDecorator('mail', {
                        rules: [{
                            type: 'email', message: 'The input is not valid E-mail!',
                        }, {
                            required: true,
                            message: 'Please input user\'s E-mail!',
                            whitespace: true
                        }],
                        initialValue: user.mail
                    })(
                        <Input/>
                    )}
                </Form.Item>
                <Form.Item
                    {...tailFormItemLayout}
                >
                    {getFieldDecorator('onNotify', {
                        valuePropName: 'checked',
                        initialValue: user.onNotify
                    })(
                        <Checkbox>Receive Notifications</Checkbox>
                    )}
                    <Button type="primary" htmlType="submit">Add</Button>
                    <Button style={{marginLeft: 8}} onClick={this.handleReset}>Clear</Button>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create()(UserCreate);