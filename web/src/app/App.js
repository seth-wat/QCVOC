import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCredentials, saveCredentials, deleteCredentials } from '../credentialStore';

import { withStyles } from '@material-ui/core/styles';
import InboxIcon from '@material-ui/icons/Inbox';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';

import AppBar from './AppBar';
import Link from './Link';
import LogoutButton from './LogoutButton';
import DrawerToggleButton from './DrawerToggleButton';

import Accounts from '../accounts/Accounts';
import Patrons from '../patrons/Patrons';
import Services from '../services/Services';
import Events from '../events/Events';
import LoginForm from './LoginForm';

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

    componentDidMount = () => {
        let credentials = getCredentials();

        if (credentials) {
            this.setState({ credentials: getCredentials() });
        }
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
                            <LogoutButton onLogout={this.handleLogout}/>
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