import React from 'react';

function Home() {
  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', color: '#000000', padding: '20px' }}>
      <h2 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '24px' }}>
        Welcome to The Refills App's links page!
      </h2>
      <a href={"/refill-table"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        Refill Table (Worker facing)
      </p></a>

      <a href={"/student-facing?station=2percentmilk1"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        2% Milk 1 (User facing)
      </p></a>

      <a href={"/student-facing?station=skimmilk1"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        Skim Milk 1 (User facing)
      </p></a>

      <a href={"/student-facing?station=chocolatemilk1"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        Chocolate Milk 1 (User facing)
      </p></a>

      <a href={"/student-facing?station=2percentmilk2"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        2% Milk 2 (User facing)
      </p></a>

      <a href={"/student-facing?station=skimmilk2"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        Skim Milk 2 (User facing)
      </p></a>

      <a href={"/student-facing?station=chocolatemilk2"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        Chocolate Milk 2 (User facing)
      </p></a>
       
    </div>
  );
}

export default Home;
