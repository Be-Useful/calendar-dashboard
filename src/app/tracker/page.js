"use client";
import { useState } from "react";
import syllabusData from "@/data/syllabus.json";
import metricsData from "@/data/metrics.json";

export default function TrackerPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const currentWeekData = syllabusData.weeks.find((w) => w.week === selectedWeek);

  return (
    <div className="dashboard-container">
      <header className="tracker-header">
        <div>
          <h1 style={{ margin: 0, textAlign: 'left' }}>Daily Tracker Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Attendance and performance records.</p>
          <p style={{ marginTop: '0.75rem', color: 'var(--accent-cyan)', fontStyle: 'italic', fontSize: '0.95rem' }}>
            * Note: This is a tentative structure. We can stretch the timeline of topics dynamically based on student understanding and feedback.
          </p>
        </div>
      </header>

      <div className="week-selector">
        {syllabusData.weeks.map((week) => (
          <button
            key={week.week}
            className={`week-btn ${selectedWeek === week.week ? "active" : ""}`}
            onClick={() => setSelectedWeek(week.week)}
          >
            Week {week.week}
          </button>
        ))}
      </div>

      <div className="week-overview" style={{ marginBottom: "2rem" }}>
        <h2>{currentWeekData?.title}</h2>
      </div>

      <div className="grid-container">
        {currentWeekData?.days.map((day) => {
          const m = metricsData[day.day] || {};

          return (
            <div key={day.day} className={`day-card ${day.isContest ? "contest" : ""}`}>
              <div className="day-header">
                <div className="day-title">Day {day.day}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{day.title}</div>
              </div>

              <div className="day-tasks">{day.tasks}</div>

              <div className="tracking-section">
                <div className="tracking-title">
                  {day.isContest ? "Contest Metrics" : "Session Metrics"}
                </div>

                {!day.isContest ? (
                  <div className="metrics-grid">
                    <div className="metric-box full-width">
                      <span className="metric-label">Attendance</span>
                      <span className="metric-value">{m.attended || "—"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="metrics-grid contest">
                    <div className="metric-box">
                      <span className="metric-label">Participants</span>
                      <span className="metric-value">{m.participants || "—"}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Avg Score</span>
                      <span className="metric-value">{m.score || "—"}</span>
                    </div>
                    <div className="metric-box full-width">
                      <span className="metric-label">Top Performer</span>
                      <span className="metric-value">{m.topPerformer || "—"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
