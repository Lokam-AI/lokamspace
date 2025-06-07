import React from 'react';
import { Link } from 'react-router-dom';
import { container, title, description, button} from './LandingPage.module.tsx'

const LandingPage: React.FC = () => {
  return (
<div className={container}>
  <h1 className={title}>
    Welcome to LokamSpace
  </h1>
  <p className={description}>
    Discover AI agents tailored to help your business grow with intelligent automation.
  </p>
  <Link
    to="/agents"
    className={button}
  >
    Explore Agents
  </Link>
</div>
  );
};

export default LandingPage;
