import Link from 'next/link';

export default function Home() {
  return (
    <div className="docs-container">
      <header className="docs-header">
        <h1>DSA Advanced Training Program</h1>
        <p className="subtitle">Executive Overview & Execution Strategy</p>
      </header>

      <section className="docs-section">
        <h2>🎯 Program Objectives</h2>
        <ul>
          <li>Transition students from basic linear data structures to advanced algorithmic paradigms.</li>
          <li>Optimize problem-solving approaches focusing on Time and Space Complexity.</li>
          <li>Develop pattern-recognition skills for competitive programming and product-based company interviews.</li>
        </ul>
      </section>

      <section className="docs-section highlight-section">
        <h2>⚙️ Execution Strategy</h2>
        <p style={{marginBottom: "1.5rem", color: "var(--text-secondary)"}}>To maximize efficiency, every training session is strictly structured as follows:</p>
        <div className="strategy-timeline">
          <div className="strategy-item">
            <div className="strategy-time">20 - 30 mins</div>
            <div className="strategy-desc"><strong>Theory & Concepts:</strong> Rapid recap and pattern identification.</div>
          </div>
          <div className="strategy-item">
            <div className="strategy-time">2 Hours</div>
            <div className="strategy-desc"><strong>Guided Application:</strong> Instructor-led breakdown of 3-5 complex problems in class.</div>
          </div>
          <div className="strategy-item">
            <div className="strategy-time">2 Hours Min</div>
            <div className="strategy-desc"><strong>Mandatory Solo Practice:</strong> Independent upsolving everyday to build muscle memory.</div>
          </div>
          <div className="strategy-item" style={{marginTop: "1rem"}}>
            <div className="strategy-time">Every 2 Weeks</div>
            <div className="strategy-desc"><strong>🚨 OA Simulation Test:</strong> A mandatory simulation to prepare for real-world hiring environments.</div>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2>🗺️ 10-Week Roadmap Summary</h2>
        <p style={{marginBottom: "1rem", color: "var(--text-secondary)", fontStyle: "italic"}}>
          * Note: This is a tentative structure. We can stretch the timeline of topics dynamically based on student understanding and feedback.
        </p>
        <div className="table-responsive">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Timeline</th>
                <th>Core Weekly Theme</th>
                <th>Key Areas of Focus</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Week 1</td><td>Arrays, Strings & Hashing</td><td>Two Pointers intro, HashMaps, Group Anagrams, Prefix Sum + HashMap</td></tr>
              <tr><td>Week 2</td><td>Linked Lists & Advanced Pointers</td><td>Fast/Slow Pointers, Merge Intervals Pattern</td></tr>
              <tr><td>Week 3</td><td>Stacks, Queues & Monotonic Stack</td><td>Next Greater Element, Sliding Window (Fixed/Variable)</td></tr>
              <tr><td>Week 4</td><td>Recursion & Backtracking</td><td>Subsets, Permutations, Combination Sum, N-Queens, Sudoku Solver</td></tr>
              <tr><td>Week 5</td><td>Binary Search & Greedy</td><td>Binary Search on Answer, Interval Scheduling</td></tr>
              <tr><td>Week 6</td><td>Trees & Advanced BST</td><td>Traversals, LCA, Tree Diameter, Vertical Traversal, Tree DP</td></tr>
              <tr><td>Week 7</td><td>Heaps & Advanced Data Structures</td><td>Top K Elements, Priority Queues, Tries</td></tr>
              <tr><td>Week 8</td><td>Graph Theory & Traversals</td><td>BFS/DFS, Cycle Detection, Kahn's Algorithm, DSU</td></tr>
              <tr><td>Week 9</td><td>Advanced Graphs & Intro to DP</td><td>Shortest Paths (Dijkstra's), Spanning Trees, 1D DP State Design</td></tr>
              <tr><td>Week 10</td><td>Advanced DP & Interview Readiness</td><td>Knapsack, String DP, Cache Design, Mock Interviews</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="cta-section">
        <Link href="/tracker" className="cta-button">
          Open Detailed Daily Tracker →
        </Link>
      </div>
    </div>
  );
}
