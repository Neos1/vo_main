import React from 'react';
import RequiredAuthorization from '../RequiredAuthorization/RequiredAuthorization';
import Header from '../Header';
import Container from '../Container';


class Settings extends React.Component {
    render() {
        return (
            <RequiredAuthorization>
                <div>
                    <Header />
                    <Container>
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#e6e8ed'
                        }}>
                            <h1 style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}>Coming soon</h1>
                        </div>
                    </Container>
                </div>
            </RequiredAuthorization>
        );
    }
}

export default Settings;