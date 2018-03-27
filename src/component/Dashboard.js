import React from 'react';
import {Link} from 'react-router-dom';
import {Card, Col, Row, Icon, Avatar, message} from 'antd';
import AnimatedNumber from 'react-animated-number';

import {countStoppedService, countRunningService} from '../action/Service';
import {countUser} from '../action/User';

const {Meta} = Card;

class Dashboard extends React.Component {

    state = {
        runningServiceCount: 0,
        stoppedServiceCount: 0,
        userCount: 0
    }

    componentDidMount = async () => {
        return Promise.all([
            this.getRunningServiceCount(),
            this.getStoppedServiceCount(),
            this.getUserCount()
        ])
    }

    getStoppedServiceCount = async () => {
        try {
            const data = await countStoppedService();
            this.setState({
                stoppedServiceCount: data.count
            });
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
        }
    }

    getRunningServiceCount = async () => {
        try {
            const data = await countRunningService();
            this.setState({
                runningServiceCount: data.count
            });
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
        }
    }

    getUserCount = async () => {
        try {
            const data = await countUser();
            this.setState({
                userCount: data.count
            });
        } catch (err) {
            console.log(err.detail);
            return message.error("Error: " + err.message);
        }
    }

    render() {
        return (
            <div style={{padding: '30px'}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card
                            cover={<img alt="" src="https://i.imgur.com/mvE20wt.jpg"/>}
                            actions={[
                                <Link to="/service"><Icon type="bars"/></Link>,
                                <Link to="/service/create"><Icon type="plus"/></Link>
                            ]}
                        >
                            <Meta
                                avatar={
                                    <Avatar size="large"
                                            style={{
                                                marginTop: 5,
                                                backgroundColor: '#f56a00'
                                            }}>
                                        <AnimatedNumber value={this.state.stoppedServiceCount} duration={1000}
                                                        stepPrecision={0}/>
                                    </Avatar>
                                }
                                style={{textAlign: "left"}}
                                title="SERVICE"
                                description="had stopped"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            cover={<img alt="" src="https://i.imgur.com/Qqhd0Lw.jpg"/>}
                            actions={[
                                <Link to="/service"><Icon type="bars"/></Link>,
                                <Link to="/service/create"><Icon type="plus"/></Link>
                            ]}
                        >
                            <Meta
                                avatar={
                                    <Avatar size="large"
                                            style={{marginTop: 5, backgroundColor: '#87d068'}}>
                                        <AnimatedNumber value={this.state.runningServiceCount} duration={1000}
                                                        stepPrecision={0}/>
                                    </Avatar>
                                }
                                style={{textAlign: "left"}}
                                title="SERVICE"
                                description="on running"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            cover={<img alt="" src="https://i.imgur.com/ib2JjQX.jpg"/>}
                            actions={[
                                <Link to="/user"><Icon type="bars"/></Link>,
                                <Link to="/user/create"><Icon type="plus"/></Link>
                            ]}
                        >
                            <Meta
                                avatar={
                                    <Avatar size="large" style={{marginTop: 5}}>
                                        <AnimatedNumber value={this.state.userCount} duration={1000} stepPrecision={0}/>
                                    </Avatar>
                                }
                                style={{textAlign: "left"}}
                                title="USER"
                                description="in total"
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Dashboard;