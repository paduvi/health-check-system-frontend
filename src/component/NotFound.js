import React from 'react';
import {Link} from 'react-router-dom';

export default () => (
    <div id="error-page" className="error">
        <div>
            <h1>404</h1>
            <div className='desc'>
                <h2>
                    This page could not be found. Are you got lost? Go <Link to="/">Home</Link>
                </h2>
            </div>
        </div>
    </div>
)