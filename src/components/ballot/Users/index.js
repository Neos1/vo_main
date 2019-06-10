import React from 'react';
import RequiredAuthorization from '../RequiredAuthorization/RequiredAuthorization';
import Header from '../Header';
import Container from '../Container';
import UserGroups from '../UserGroups';


class Users extends React.Component {
    render() {
        return (
            <RequiredAuthorization>
                <div> 
                    <Header/>
                    <Container>
                        <UserGroups/>
                    </Container>
                </div>
            </RequiredAuthorization>
        );
    }
}

export default Users