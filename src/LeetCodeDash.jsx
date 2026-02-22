import { useState } from "react";

export default function LeetCodeDash() {

    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("");
    const [inputValue, setInputValue] = useState("");
    const DEFAULT_RATING = 1500;

    async function fetchContests(user) {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/leetcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user }),
            });

            const result = await response.json();
            if (!result.data) throw new Error("User not found");

            const attended = result.data.userContestRankingHistory.filter(
                (c) => c.attended
            );

            attended.sort(
                (a, b) => a.contest.startTime - b.contest.startTime
            );

            const processed = attended.map((contest, index) => {
                const prevRating =
                    index === 0 ? DEFAULT_RATING : attended[index - 1].rating;

                return {
                    ...contest,
                    prevRating,
                    ratingChange: contest.rating - prevRating,
                };
            });

            setContests(processed.reverse());
        } catch (err) {
            setError("User not found or failed to fetch");
            setContests([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch(e) {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const user = inputValue.trim();
        setUsername(user);
        setContests([]);
        await fetchContests(user);
    }

    function formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }

    // Summary Calculations
    const currentRating = contests.length ? contests[0].rating : DEFAULT_RATING;
    const peakRating = contests.length
        ? Math.max(...contests.map((c) => c.rating))
        : DEFAULT_RATING;
    const totalContests = contests.length;

    // Solve Distribution Calculation
    const solveDistribution = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
    };

    contests.forEach((contest) => {
        const solved = contest.problemsSolved;
        if (solveDistribution.hasOwnProperty(solved)) {
            solveDistribution[solved]++;
        }
    });

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">

            {/* NAVBAR */}
            <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <h1 className="text-xl font-bold tracking-wide">
                    LeetCode Contest Analytics
                </h1>

                <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
                    <input type="text" placeholder="Enter username..." value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition" >
                        Search
                    </button>
                </form>
            </nav>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8">

                {!username && (
                    <div className="text-center text-slate-400 mt-20">
                        Enter a username above to view contest analytics.
                    </div>
                )}

                {loading && (
                    <div className="text-center mt-20">
                        Fetching contest data...
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-400 mt-20">
                        {error}
                    </div>
                )}

                {/*  DASHBOARD */}
                {username && !loading && !error && contests.length > 0 && (
                    <div className="w-full max-w-7xl mx-auto">

                        {/* Username Badge */}
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-slate-300">
                                Showing results for :
                                <span className="text-blue-400 ml-2">{username}</span>
                            </h2>
                        </div>

                        {/* SUMMARY SECTION */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">

                            {/* Current Rating */}
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">
                                <p className="text-slate-400 text-sm mb-2">Current Rating</p>
                                <div className="text-3xl font-bold">
                                    {Math.round(currentRating)}
                                </div>
                            </div>

                            {/* Peak Rating */}
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">
                                <p className="text-slate-400 text-sm mb-2">Peak Rating</p>
                                <div className="text-3xl font-bold text-yellow-400">
                                    {Math.round(peakRating)}
                                </div>
                            </div>

                            {/* Total Contests */}
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">
                                <p className="text-slate-400 text-sm mb-2">Total Contests</p>
                                <div className="text-3xl font-bold text-blue-400">
                                    {totalContests}
                                </div>
                            </div>

                        </div>

                        {/* Solve Distribution Section */}
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mb-12">
                            <h2 className="text-lg font-semibold mb-6">
                                Performance Distribution
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                {[0, 1, 2, 3, 4].map((num) => (
                                    <div key={num} className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition" >
                                        <div className="text-2xl font-bold text-blue-400">
                                            {solveDistribution[num]}
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            {num} / 4 Solved
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Table Section */}
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">

                                    <thead className="bg-slate-800 text-slate-300 uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Contest</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-center">Rank</th>
                                            <th className="px-6 py-4 text-center">Solved</th>
                                            <th className="px-6 py-4 text-center">Finish</th>
                                            <th className="px-6 py-4 text-center">Rating Change</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-800">
                                        {contests.map((data, index) => {
                                            const isPositive = data.ratingChange >= 0;
                                            return (
                                                <tr key={index} className="hover:bg-slate-800/60 transition duration-200">
                                                    <td className="px-6 py-4 font-medium">{data.contest.title}</td>
                                                    <td className="px-6 py-4 text-slate-400">{formatDate(data.contest.startTime)}</td>
                                                    <td className="px-6 py-4 text-center">{data.ranking}</td>
                                                    <td className="px-6 py-4 text-center">{data.problemsSolved} / {data.totalProblems}</td>
                                                    <td className="px-6 py-4 text-center">{formatTime(data.finishTimeInSeconds)}</td>
                                                    <td className="px-6 py-4 text-center font-semibold">
                                                        <span className={isPositive ? "text-green-400" : "text-red-400"}>
                                                            {Math.round(data.prevRating)} → {Math.round(data.rating)}
                                                            ({isPositive ? "+" : ""}
                                                            {Math.round(data.ratingChange)})
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                </table>
                            </div>
                        </div>

                    </div>
                )}

            </main>

            {/* FOOTER */}
            <footer className="bg-slate-900 border-t border-slate-800 text-center py-4 text-slate-400">
                Made with ❤️ by <span className="text-white font-semibold">Sarthak Jain</span>
            </footer>

        </div>
    );
}



