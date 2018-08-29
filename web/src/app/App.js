/*
    Copyright (c) QC Coders (JP Dillingham, Nick Acosta, et. al.). All rights reserved. Licensed under the GPLv3 license. See LICENSE file
    in the project root for full license information.
*/

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCredentials, saveCredentials, deleteCredentials } from '../credentialStore';
import api from '../api';

import { withStyles } from '@material-ui/core/styles';
import InboxIcon from '@material-ui/icons/Inbox';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';

import AppBar from './AppBar';
import Link from './Link';
import SecurityMenu from '../security/SecurityMenu';
import DrawerToggleButton from './DrawerToggleButton';

import Accounts from '../accounts/Accounts';
import Patrons from '../patrons/Patrons';
import Services from '../services/Services';
import Events from '../events/Events';
import LoginForm from '../security/LoginForm';

const styles = {
    root: {
        flexGrow: 1,
    },
};

const initialState = {
    credentials: {
        accessToken: undefined,
        refreshToken: undefined,
        expires: undefined,
        issued: undefined,
        tokenType: undefined,
    },
    drawer: {
        open: false,
    },
}

class App extends Component {
    state = initialState;

    componentWillMount = () => {
        let credentials = getCredentials();
        
        if (credentials) {
            this.setState({ credentials: credentials });
        }
    }

    componentDidMount = () => {
        if (this.state.credentials.accessToken) {
            this.getAccountDetails();
        }
    }

    getAccountDetails = () => {
        let { credentials } = this.state;

        api.get('/v1/security/accounts/' + credentials.id)
        .then(response => {
            this.setState({ credentials: { ...credentials, passwordResetRequired: response.data.passwordResetRequired }});
        })
        .catch(error => {
            console.log(error);
        });
    }

    handleToggleDrawer = () => { 
        this.setState({ drawer: { open: !this.state.drawer.open }});
    }

    handleLogin = (credentials, persistCredentials) => {
        this.setState({ credentials: credentials }, () => {
            if (persistCredentials) {
                saveCredentials(this.state.credentials);
            }
        });
    }

    handleLogout = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.setState({ credentials: initialState.credentials }, () => {
                    deleteCredentials();
                });
            }, 500);
        });
    }

    handlePasswordReset = () => {
        this.getAccountDetails();
    }

    render() {
        let classes = this.props.classes;

        return (
            <div className={classes.root}>
                {this.state.credentials.accessToken ? 
                    <div>
                        <AppBar 
                            title='QCVOC' 
                            drawerToggleButton={<DrawerToggleButton onToggleClick={this.handleToggleDrawer}/>}
                        >
                            <SecurityMenu 
                                credentials={this.state.credentials} 
                                onLogout={this.handleLogout}
                                onPasswordReset={this.handlePasswordReset}
                            />
                        </AppBar>
                        <Drawer 
                            open={this.state.drawer.open} 
                            onClose={this.handleToggleDrawer}
                        >
                            <AppBar title='QCVOC'/>
                            <List>
                                <Link to='/accounts' icon={<InboxIcon/>}>Accounts</Link>
                                <Link to='/patrons' icon={<InboxIcon/>}>Patrons</Link>
                                <Link to='/services' icon={<InboxIcon/>}>Services</Link>
                                <Link to='/events' icon={<InboxIcon/>}>Events</Link>                                
                            </List>                    
                        </Drawer>
                        <Switch>
                            <Route path='/accounts' component={Accounts}/>
                            <Route path='/patrons' component={Patrons}/>
                            <Route path='/services' component={Services}/>
                            <Route path='/events' component={Events}/>
                        </Switch>
                    </div> :
                    <LoginForm onLogin={this.handleLogin}/>
                }
            </div>
        );
    }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App); 