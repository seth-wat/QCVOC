/*
    Copyright (c) QC Coders (JP Dillingham, Nick Acosta, Will Burklund, et. al.). All rights reserved. Licensed under the GPLv3 license. See LICENSE file
    in the project root for full license information.
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../api';

import { withStyles } from '@material-ui/core/styles';

import ContentWrapper from '../shared/ContentWrapper';
import Snackbar from '@material-ui/core/Snackbar';
import { Card, CardContent, Typography, CircularProgress, Button } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import ServiceList from './ServiceList';
import ServiceDialog from './ServiceDialog';

import { sortByProp } from '../util'

const styles = {
    fab: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
        zIndex: 1000
    },
    card: {
        minHeight: 220,
        maxWidth: 800,
        margin: 'auto',
    },
    refreshSpinner: {
        position: 'fixed',
        left: 0,
        right: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 83,
    },
};

const showCount = 7;

class Services extends Component {
    state = {
        services: [],
        loadApi: {
            isExecuting: false,
            isErrored: false,
        },
        refreshApi: {
            isExecuting: false,
            isErrored: false,
        },
        serviceDialog: {
            open: false,
            intent: 'add',
            service: undefined,
        },
        snackbar: {
            message: '',
            open: false,
        },
        show: showCount,
    }

    componentWillMount = () => {
        this.refresh('refreshApi');
    }

    handleAddClick = () => {
        this.setState({
            serviceDialog: {
                open: true,
                intent: 'add',
                service: undefined,
            }
        })
    }

    handleEditClick = (service) => {
        this.setState({
            serviceDialog: {
                open: true,
                intent: 'update',
                service: service,
            }
        })
    }

    handleShowMoreClick = () => {
        this.setState({ show: this.state.show + showCount });
    }

    handleServiceDialogClose = (result) => {
        this.setState({
            serviceDialog: {
                ...this.state.serviceDialog,
                open: false,
            }
        }, () => {
            if (!result) return;
            this.setState({ snackbar: { message: result, open: true }}, () => this.refresh('refreshApi'))
        })
    }

    handleSnackbarClose = () => {
        this.setState({ snackbar: { open: false }});
    }

    refresh = (apiType) => {
        this.setState({ [apiType]: { ...this.state[apiType], isExecuting: true}}, () => {
            api.get('/v1/services?offset=0&limit=5000&orderBy=ASC')
            .then(response => {
                this.setState({
                    services: response.data,
                    [apiType]: { isExecuting: false, isErrored: false },
                });
            }, error => {
                this.setState({
                    [apiType]: { isExecuting: false, isErrored: true },
                    snackbar: { message: error.response.data.Message, open: true },
                });
            });
        })
    }

    render() {
        let { classes } = this.props;
        let { services, loadApi, refreshApi, snackbar, show, serviceDialog } = this.state;

        let list = services
            .sort(sortByProp('name'))
            .slice(0, show);

        return (
            <div>
                <ContentWrapper api={loadApi}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography gutterBottom variant="headline" component="h2">
                                Services
                            </Typography>
                            {refreshApi.isExecuting ?
                                <CircularProgress size={30} color={'secondary'} className={classes.refreshSpinner}/> :
                                <ServiceList
                                    services={list}
                                    onItemClick={this.handleEditClick}
                                />
                            }
                            {services.length > show && <Button fullWidth onClick={this.handleShowMoreClick}>Show More</Button>}
                        </CardContent>
                    </Card>
                    <Button 
                        variant="fab" 
                        color="secondary" 
                        className={classes.fab}
                        onClick={this.handleAddClick}
                    >
                        <Add/>
                    </Button>
                    <ServiceDialog
                        open={serviceDialog.open}
                        intent={serviceDialog.intent}
                        onClose={this.handleServiceDialogClose}
                        service={serviceDialog.service}
                    />
                </ContentWrapper>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
                    open={snackbar.open}
                    onClose={this.handleSnackbarClose}
                    autoHideDuration={3000}
                    message={<span id="message-id">{snackbar.message}</span>}
                />
            </div>
        );
    }
}

Services.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Services); 