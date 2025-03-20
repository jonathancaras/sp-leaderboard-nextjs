import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/spreadsheet');
        const data = await response.json();
        setParticipants(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Satoshi Port Points Program Leaderboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header>
          <div className="logo-container">
            <h1>Satoshi Port</h1>
          </div>
          <h1>Points Program Leaderboard</h1>
          <p className="subtitle">Earn points, climb the ranks, unlock rewards</p>
          <div className="bitcoin-icon">₿</div>
        </header>
        
        <main>
          <div className="leaderboard">
            <div className="leaderboard-header">
              <div>Rank</div>
              <div>NEAR Wallet</div>
              <div>X Handle</div>
              <div>Points</div>
            </div>
            <div className="leaderboard-body">
              {isLoading ? (
                <div className="loader">
                  <div className="spinner"></div>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              ) : (
                participants.map((participant, index) => (
                  <div key={index} className="leaderboard-row">
                    <div className="rank">{index + 1}</div>
                    <div className="wallet">{participant.wallet}</div>
                    <div className="twitter-handle">{participant.handle}</div>
                    <div className="points">{participant.points.toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
        
        <footer>
          <p>© 2025 Satoshi Port Points Program | <a href="https://satoshiport.com" target="_blank" rel="noopener noreferrer">Visit Satoshi Port</a></p>
        </footer>
      </div>
    </>
  );
}
