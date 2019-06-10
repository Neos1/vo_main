import React from 'react';
import RequiredAuthorization from '../RequiredAuthorization/RequiredAuthorization';
import Header from '../Header';
import Container from '../Container';
import Votings from '../Votings';


class VotingWrapper extends React.Component {
    render() {
        return (
            <RequiredAuthorization>
                <div> 
                    <Header/>
                    <Container>
                        <Votings/>
                    </Container>
                </div>
            </RequiredAuthorization>
        );
    }
}

export default VotingWrapper