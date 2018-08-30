import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { 
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    DialogContent,
    TextField,
} from '@material-ui/core';

import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import ConfirmDialog from '../shared/ConfirmDialog';
import { getCredentials } from '../credentialStore';

const styles = {
    dialog: {
        width: 320,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 50,
        height: 'fit-content',
    },
    spinner: {
        position: 'fixed',
    },
};

const initialState = {
    updateApi: {
        isExecuting: false,
        isErrored: false,
    },
    account: {
        id: undefined,
        name: undefined,
        password: '',
        password2: '',
    },
    validation: {
        password: undefined,
        password2: undefined,
    },
    snackbar: {
        message: '',
        open: false,
    },
    confirmDialog: {
        open: false,
    }
}

class PasswordResetDialog extends Component {
    state = initialState;

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.open && !this.props.open) {
            this.setState({ 
                ...initialState, 
                account: nextProps.account ? { 
                    id: nextProps.account.id,
                    name: nextProps.account.name,
                    password: '',
                    password2: '',
                } : { 
                    ...initialState.account, 
                },
                validation: initialState.validation,
            });
        }
    }

    handleChange = (field, event) => {
        this.setState({ 
            account: {
                ...this.state.account,
                [field]: event.target.value,
            },
            validation: {
                ...this.state.validation,
                [field]: undefined,
            },
        });
    }

    handleCancelClick = () => {
        this.props.onClose();
    }

    handleResetClick = () => {
        this.validate().then(result => {
            let account = { ...this.state.account }
            delete account.password2;

            if (result.isValid) {
                if (getCredentials().name === account.name) {
                    this.execute(
                        () => this.props.onReset(account), 
                        'updateApi', 
                        'Password for \'' + account.name + '\' successfully updated.'
                    );
                }
                else {
                    this.setState({ confirmDialog: { open: true }});
                }
            }
        });
    }

    handleResetConfirmation = () => {
        let account = { ...this.state.account };

        return this.execute(
            () => this.props.onReset(account), 
            'updateApi', 
            'Password for \'' + account.name + '\' successfully updated.'
        );
    }

    handleSnackbarClose = () => {
        this.setState({ snackbar: { open: false }});
    }

    handleDialogClose = () => {
        this.setState({ confirmDialog: { open: false }});
    }

    execute = (action, api, successMessage) => {
        return new Promise((resolve, reject) => {
            this.setState({ [api]: { isExecuting: true }}, () => {
                action(this.state.account)
                .then(response => {
                    this.setState({
                        [api]: { isExecuting: false, isErrored: false }
                    }, () => {
                        this.props.onClose(successMessage);
                        resolve(response);
                    })
                }, error => {
                    var body = error && error.response && error.response.data ? error.response.data : error;

                    if (typeof(body) !== 'string') {
                        var keys = Object.keys(body);
    
                        if (keys.length > 0) {
                            body = body[keys[0]];
                        }
                    }

                    this.setState({ 
                        [api]: { isExecuting: false, isErrored: true },
                        snackbar: {
                            message: body,
                            open: true,
                        },
                    }, () => reject(error));
                })
            })
        })
    }

    validate = () => {
        let { password, password2 } = this.state.account;
        let result = { ...initialState.validation };

        if (password === '') {
            result.password = 'The New Password field is required.';
        }

        if (password2 === '') {
            result.password2 = 'The Confirm Password field is required.';
        }

        if (password !== '' && password2 !== '' && password !== password2) {
            result.password = result.password2 = 'The Password fields must match.';
        }

        return new Promise(resolve => {
            this.setState({ validation: result }, () => {
                result.isValid = JSON.stringify(result) === JSON.stringify(initialState.validation);
                resolve(result);
            });                
        })
    }

    render() {
        let { classes, open } = this.props;
        let validation = this.state.validation;
        let executing = this.state.updateApi.isExecuting;
        
        return (
            <Dialog 
                open={open}
                onClose={this.handleCancel}
                PaperProps={{ className: classes.dialog }}
                scroll={'body'}
            >
                <DialogTitle>{'Reset Password'}</DialogTitle>
                <DialogContent>
                    <TextField
                        style={{marginTop: 0}}
                        id="password"
                        label="New Password"
                        type="password"
                        error={validation.password !== undefined}
                        helperText={validation.password}
                        fullWidth
                        onChange={(event) => this.handleChange('password', event)}
                        disabled={executing}
                    />
                    <TextField
                        style={{marginTop: 15}}
                        id="password2"
                        label="Confirm Password"
                        type="password"
                        error={validation.password2 !== undefined}
                        helperText={validation.password2}
                        fullWidth
                        onChange={(event) => this.handleChange('password2', event)}
                        disabled={executing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={this.handleCancelClick}
                        color="primary"
                        disabled={executing}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={this.handleResetClick} 
                        color="primary"
                        disabled={executing}
                    >
                        {executing && <CircularProgress size={20} style={styles.spinner}/>}
                        Reset
                    </Button>
                </DialogActions>
                <ConfirmDialog
                    title={'Confirm Password Reset'}
                    prompt={'Reset'}
                    open={this.state.confirmDialog.open}
                    onConfirm={this.handleResetConfirmation}
                    onClose={this.handleDialogClose}
                    suppressCloseOnConfirm
                >
                    <div>
                        <p>Are you sure you want to reset the password for user '{this.state.account.name}'?</p>
                        <p>The user will be prompted to change their password at the next log in.</p>
                    </div>
                </ConfirmDialog>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
                    open={this.state.snackbar.open}
                    onClose={this.handleSnackbarClose}
                    autoHideDuration={3000}
                    message={<span id="message-id">{this.state.snackbar.message}</span>}
                />
            </Dialog>
        );
    }
}

PasswordResetDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    account: PropTypes.object,
    onReset: PropTypes.func.isRequired,
};

export default withStyles(styles)(PasswordResetDialog); 