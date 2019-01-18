import React from 'react';

import { withRouter } from 'react-router';
import RequiredAuthorization from '../RequiredAuthorization/RequiredAuthorization';
import Questions from '../Questions/Questions';
import Voting from '../Voting/Voting';
import Header from '../Header/Header';

class Main extends React.Component {
    render() {
        return (
            <RequiredAuthorization>
                <div>
                    <Header />
                </div>
            </RequiredAuthorization>
        );
    }
}

export default Main