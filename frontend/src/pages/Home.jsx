import React from "react";
import Hero from "../components/Hero";
import Header from "../components/Header";
import Feature from "../components/Feature";
import "./Home.css";

function Home() {
  return (
    <div className="home1">
      <Header />
      <Hero />
      <Feature />
    </div>
  );
}

export default Home;
