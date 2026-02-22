import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function LeetCodeDash() {

    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const username = "sarthak_jain18";
    const DEFAULT_RATING = 1500;

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/leetcode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username }),
                });

                const result = await response.json();
                if (result.errors) throw new Error("GraphQL Error");

                // 1️⃣ Filter attended
                const attended = result.data.userContestRankingHistory.filter(
                    (c) => c.attended
                );

                // 2️⃣ Sort by date ASC (oldest → newest)
                attended.sort(
                    (a, b) => a.contest.startTime - b.contest.startTime
                );

                // 3️⃣ Calculate rating change properly
                const processed = attended.map((contest, index) => {
                    const prevRating =
                        index === 0 ? DEFAULT_RATING : attended[index - 1].rating;

                    return {
                        ...contest,
                        prevRating,
                        ratingChange: contest.rating - prevRating,
                    };
                });

                // 4️⃣ Reverse for UI (latest first)
                setContests(processed.reverse());
            } catch (err) {
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

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

    // 🔥 Summary Calculations
    const currentRating = contests.length ? contests[0].rating : DEFAULT_RATING;
    const latestChange = contests.length ? contests[0].ratingChange : 0;
    const peakRating = contests.length
        ? Math.max(...contests.map((c) => c.rating))
        : DEFAULT_RATING;
    const totalContests = contests.length;

    const isPositive = latestChange >= 0;

    // 🔥 Solve Distribution Calculation
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

    if (loading)
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                Loading contests...
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
                {error}
            </div>
        );

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">

            <h1 className="text-3xl font-bold mb-8">
                LeetCode Contest Dashboard
            </h1>

            {/* 🔥 SUMMARY SECTION */}
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

            {/* 🔥 Solve Distribution Section */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mb-12">
                <h2 className="text-lg font-semibold mb-6">Performance Distribution</h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    {[0, 1, 2, 3, 4].map((num) => (
                        <div
                            key={num}
                            className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition"
                        >
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
                                        <td className="px-6 py-4 font-medium"> {data.contest.title}</td>
                                        <td className="px-6 py-4 text-slate-400"> {formatDate(data.contest.startTime)}</td>
                                        <td className="px-6 py-4 text-center"> {data.ranking}</td>
                                        <td className="px-6 py-4 text-center"> {data.problemsSolved} / {data.totalProblems}</td>
                                        <td className="px-6 py-4 text-center"> {formatTime(data.finishTimeInSeconds)}</td>
                                        <td className="px-6 py-4 text-center font-semibold">
                                            <div className={`inline-flex items-center gap-2 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                                                {isPositive ? (
                                                    <ArrowUpRight size={16} />
                                                ) : (
                                                    <ArrowDownRight size={16} />
                                                )}

                                                <span>
                                                    {Math.round(data.prevRating)} →{" "}
                                                    {Math.round(data.rating)}
                                                </span>

                                                <span>
                                                    ({isPositive ? "+" : ""}
                                                    {Math.round(data.ratingChange)})
                                                </span>

                                            </div>
                                        </td>
                                    </tr>
                                );

                            })}
                        </tbody>

                    </table>
                </div>
            </div>

        </div>
    );
}

