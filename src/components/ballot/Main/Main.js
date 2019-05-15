import React from 'react';
import RequiredAuthorization from '../RequiredAuthorization/RequiredAuthorization';
import Header from '../Header';
import Container from '../Container';
import Questions from '../Questions/Questions';


class Main extends React.Component {
    render() {
        return (
            <RequiredAuthorization>
                <div> 
                    <Header/>
                    <Container>
                        <Questions/>
                    </Container>
                </div>
            </RequiredAuthorization>
        );
    }
}

export default Main