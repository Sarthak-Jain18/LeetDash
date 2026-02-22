export default async function handler(req, res) {
    try {
        const { username } = req.body;

        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `
          query getContestHistory($username: String!) {
            userContestRankingHistory(username: $username) {
              attended
              rating
              ranking
              problemsSolved
              totalProblems
              finishTimeInSeconds
              trendDirection
              contest {
                title
                startTime
              }
            }
          }
        `,
                variables: { username },
            }),
        });

        const data = await response.json();

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch contest history" });
    }
}
