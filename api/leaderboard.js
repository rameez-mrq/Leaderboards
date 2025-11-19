export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { repo, student, team, name, map, p5, lastCommit } = req.body;
    
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const LEADERBOARD_REPO = process.env.LEADERBOARD_REPO;
    
    try {
      // Fetch current file
      const fileRes = await fetch(
        `https://api.github.com/repos/${LEADERBOARD_REPO}/contents/static/leaderboard.json`,
        { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } }
      );
      const file = await fileRes.json();
      
      const current = JSON.parse(Buffer.from(file.content, 'base64').toString());
      
      // Add new entry
      const updated = [...current, {
        id: current.length + 1,
        repo, student, team, name, map, p5, lastCommit
      }].sort((a, b) => b.map - a.map)
        .map((item, i) => ({ ...item, rank: i + 1 }));
      
      // Commit back
      const content = Buffer.from(JSON.stringify(updated, null, 2)).toString('base64');
      
      await fetch(
        `https://api.github.com/repos/${LEADERBOARD_REPO}/contents/static/leaderboard.json`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update: ${name} - MAP: ${map.toFixed(4)}`,
            content,
            sha: file.sha
          })
        }
      );
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }