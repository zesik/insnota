import React from 'react';
import { Link } from 'react-router';

function Home(props) {
  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Collabnotes</h1>
          <p>A collaborative note-taking platform</p>
          <div className="signup">
            <Link className="button" to="/signin">Sign in</Link>&nbsp;
            <Link className="button" to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
