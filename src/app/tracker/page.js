"use client";
import { useState } from "react";
import syllabusData from "@/data/syllabus.json";
import metricsData from "@/data/metrics.json";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

export default function TrackerPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const currentWeekData = syllabusData.weeks.find((w) => w.week === selectedWeek);

  const totalStudents = 60; // Assuming 60 students in total

  // Calculate metrics for selected week
  let completedDays = 0;
  let totalAttendance = 0;
  let attendanceDays = 0;
  let contestParticipants = 0;

  currentWeekData?.days.forEach(day => {
    const m = metricsData[day.day];
    // A day is considered "completed" if it has metrics
    if (m && Object.keys(m).length > 0) {
      completedDays++;
      if (!day.isContest) {
        if (m.attended) {
          totalAttendance += parseInt(m.attended, 10) || 0;
          attendanceDays++;
        }
      } else {
        if (m.participants) contestParticipants = parseInt(m.participants, 10) || 0;
      }
    }
  });

  const avgAttendance = attendanceDays > 0 ? Math.round(totalAttendance / attendanceDays) : 0;

  const moduleData = [
    { name: 'Completed Days', value: completedDays, fill: '#06b6d4' },
    { name: 'Remaining Days', value: (currentWeekData?.days.length || 6) - completedDays, fill: 'rgba(255,255,255,0.1)' }
  ];

  const attendanceData = [
    { name: 'Avg Attendance', value: avgAttendance, fill: '#8b5cf6' },
    { name: 'Avg Absent', value: Math.max(0, totalStudents - avgAttendance), fill: 'rgba(255,255,255,0.1)' }
  ];

  const contestData = [
    { name: 'Participants', value: contestParticipants, fill: '#ec4899' },
    { name: 'Non-Participants', value: Math.max(0, totalStudents - contestParticipants), fill: 'rgba(255,255,255,0.1)' }
  ];

  const handleDownload = () => {
    const exportData = syllabusData.weeks.map(week => {
      let wCompletedDays = 0;
      let wTotalAttendance = 0;
      let wAttendanceDays = 0;
      let wContestParticipants = 0;
      let wContestScore = 0;

      week.days.forEach(day => {
        const m = metricsData[day.day];
        if (m && Object.keys(m).length > 0) {
          wCompletedDays++;
          if (!day.isContest) {
            if (m.attended) {
              wTotalAttendance += parseInt(m.attended, 10) || 0;
              wAttendanceDays++;
            }
          } else {
            if (m.participants) wContestParticipants = parseInt(m.participants, 10) || 0;
            if (m.score) wContestScore = parseInt(m.score, 10) || 0;
          }
        }
      });

      return {
        Week: `Week ${week.week}`,
        "Modules Completed": `${wCompletedDays} / ${week.days.length}`,
        "Avg Attendance": wAttendanceDays > 0 ? (wTotalAttendance / wAttendanceDays).toFixed(1) : "N/A",
        "Contest Participants": wContestParticipants || "N/A",
        "Contest Avg Score": wContestScore || "N/A"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Weekly Metrics");
    XLSX.writeFile(workbook, "Weekly_Metrics_Tracker.xlsx");
  };

  const renderDoughnut = (data, title, centerText) => (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', flex: '1', minWidth: '250px' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
      <div style={{ height: 180, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="70%"
              outerRadius="90%"
              dataKey="value"
              stroke="none"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '1.5rem',
          fontWeight: '800',
          color: '#fff',
          fontFamily: 'Outfit, sans-serif'
        }}>
          {centerText}
        </div>
      </div>
    </div>
  );

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

      <div className="week-overview" style={{ marginBottom: "2rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>{currentWeekData?.title}</h2>
        <button 
          onClick={handleDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '600',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Download size={18} />
          Export All Weeks
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {renderDoughnut(moduleData, "Module Completion", `${completedDays}/${currentWeekData?.days.length || 6}`)}
        {renderDoughnut(attendanceData, "Avg Attendance", `${avgAttendance}`)}
        {renderDoughnut(contestData, "Contest Participation", `${contestParticipants}`)}
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
