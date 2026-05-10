const axios = require('axios');

async function getLeetCodeData(username) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        submissionCalendar
      }
    }
  `;

  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { username }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    // Test logic for acceptance rate
    const stats = response.data.data.matchedUser.submitStats;
    const totalAc = stats.acSubmissionNum.find(item => item.difficulty === "All");
    const totalSub = stats.totalSubmissionNum.find(item => item.difficulty === "All");
    
    console.log("AC:", totalAc);
    console.log("Total:", totalSub);
    
    if (totalAc && totalSub) {
        console.log("Acceptance Rate:", (totalAc.submissions / totalSub.submissions * 100).toFixed(2) + "%");
    }
    
    // Test logic for streak
    const calendarStr = response.data.data.matchedUser.submissionCalendar;
    const calendar = JSON.parse(calendarStr);
    const timestamps = Object.keys(calendar).map(Number).sort((a, b) => b - a);
    
    console.log("Recent timestamps:", timestamps.slice(0, 5).map(t => new Date(t * 1000).toISOString()));
    
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

getLeetCodeData('lee215');
