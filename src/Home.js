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

      <a href={"/student-facing?station=2percentmilk"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        2% Milk (User facing)
      </p></a>

      <a href={"/student-facing?station=skimmilk"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        Skim Milk (User facing)
      </p></a>

      <a href={"/student-facing?station=chocolatemilk"}>  <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px', margin: '10px 0' }}>
        Chocolate Milk (User facing)
      </p></a>
       
    </div>
  );
}

export default Home;
