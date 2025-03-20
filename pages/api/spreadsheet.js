import Papa from 'papaparse';

export default async function handler(req, res) {
  try {
    // Google Sheets CSV URL
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmRxuNq9aykwW-TKuta9Ks7BEacVORU04KJsoLglFsUzIZTWBHINVbhsDH2LcUg6AfpxCiUKrGDBtN/pub?gid=0&single=true&output=csv';
    
    // Fetch the CSV data
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    // Get the CSV text
    const csvData = await response.text();
    
    // Parse CSV to JSON
    const result = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    
    // Map the data to a consistent format
    const formattedParticipants = result.data.map(row => ({
      wallet: row["NEAR Wallet"] || row["near_wallet"] || row["wallet"] || "",
      handle: row["X Handle"] || row["x_handle"] || row["twitter"] || "",
      points: row["Total Points"] || row["total_points"] || row["points"] || 0
    }));
    
    // Sort by points (highest first)
    const sortedParticipants = formattedParticipants
      .filter(p => p.wallet && p.points)
      .sort((a, b) => b.points - a.points);
    
    // Return the sorted data
    res.status(200).json(sortedParticipants);
  } catch (error) {
    console.error('Error fetching spreadsheet:', error);
    res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
  }
}
