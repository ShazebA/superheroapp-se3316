import React from 'react';
import './LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className="styles.landingContainer">
      <h1 className="styles.title">Shazzy's Superhero App</h1>
      <div className="styles.aboutSection">
        <h2>About the App</h2>
        <p>
          Welcome to Shazzy's Superhero App, the ultimate destination for all superhero enthusiasts! 
          Dive into a vast universe of public superhero databases. Explore, create, and curate your 
          own lists of favorite superheroes. Connect with a global community, share insights, and 
          discover public lists created by fellow fans. Join us and embark on an extraordinary 
          adventure in the world of superheroes!
        </p>
      </div>
    </div>
  );
}   

export default LandingPage;
