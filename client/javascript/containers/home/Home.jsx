import React from 'react';
import { Link } from 'react-router';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Insnota</h1>
          <p>A collaborative note-taking platform</p>
          <div className="signup">
            <Link className="btn" to="/signin">Sign in</Link>&nbsp;
            <Link className="btn btn-default" to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
