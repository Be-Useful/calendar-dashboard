"use client";
import React, { useState, useMemo } from 'react';
import dashboardData from '@/data/dashboard_data.json';
import { Users, BookOpen, CalendarCheck, Search, Trophy, ArrowUpDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const WEEK1_TOPICS = "Time Complexity, Arrays/Strings/Sorting, Prefix Sums";
const WEEK2_TOPICS = "Sorting, Two Pointers, Linked Lists, Stacks & Queues";

const DIST_COLORS = {
  zero: '#ef4444',
  low: '#f59e0b',
  mid: '#3b82f6',
  high: '#10b981'
};

function computeDistribution(students, getter) {
  let zero = 0, low = 0, mid = 0, high = 0;
  students.forEach(s => {
    const v = getter(s);
    if (v === 0) zero++;
    else if (v < 30) low++;
    else if (v < 60) mid++;
    else high++;
  });
  return [
    { name: '0%', value: zero, color: DIST_COLORS.zero },
    { name: '1-29%', value: low, color: DIST_COLORS.low },
    { name: '30-59%', value: mid, color: DIST_COLORS.mid },
    { name: '60%+', value: high, color: DIST_COLORS.high },
  ];
}

function MiniDonut({ data, label }) {
  return (
    <div className="mini-donut-card">
      <h4 className="mini-donut-label">{label}</h4>
      <div className="mini-donut-row">
        <div className="mini-donut-chart">
          <ResponsiveContainer width={90} height={90}>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={25} outerRadius={40} paddingAngle={3} stroke="none">
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v} students`} contentStyle={{ background: '#1e1e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mini-donut-legend">
          {data.map((d, i) => (
            <div key={i} className="legend-item">
              <span className="legend-dot" style={{ background: d.color }}></span>
              <span className="legend-text">{d.name}: <strong>{d.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('performance');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'overall', direction: 'desc' });
  const [expandWeek1, setExpandWeek1] = useState(true);
  const [expandWeek2, setExpandWeek2] = useState(true);

  const sessionNames = useMemo(() => {
    return Object.keys(dashboardData.sessionStats || {}).sort();
  }, []);

  const week1Sessions = sessionNames.filter(s => {
    const numMatch = s.match(/\d+/);
    if (!numMatch) return false;
    return parseInt(numMatch[0]) <= 4;
  });

  const week2Sessions = sessionNames.filter(s => {
    const numMatch = s.match(/\d+/);
    if (!numMatch) return false;
    return parseInt(numMatch[0]) > 4;
  });

  const totalHours = useMemo(() => {
    let totalMins = 0;
    Object.values(dashboardData.sessionStats || {}).forEach(stat => {
      totalMins += stat.facultyDuration || stat.referenceDuration || 0;
    });
    return Math.round(totalMins / 60);
  }, []);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    let items = [...dashboardData.students];
    if (searchTerm) {
      items = items.filter(s =>
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.ccUsername && s.ccUsername.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (sortConfig) {
      items.sort((a, b) => {
        let aV, bV;
        if (sortConfig.key === 'name') { aV = a.name; bV = b.name; }
        else if (sortConfig.key === 'rollNo') { aV = a.rollNo; bV = b.rollNo; }
        else if (sortConfig.key === 'attendance') { aV = a.attendance.totalPercentageAvg; bV = b.attendance.totalPercentageAvg; }
        else if (sortConfig.key === 'overall') { aV = a.modules.overall; bV = b.modules.overall; }
        else if (sortConfig.key === 'week1Avg') { aV = a.modules.week1Avg; bV = b.modules.week1Avg; }
        else if (sortConfig.key === 'week2Avg') { aV = a.modules.week2Avg; bV = b.modules.week2Avg; }
        else if (sessionNames.includes(sortConfig.key)) { aV = a.attendance.sessions[sortConfig.key] || 0; bV = b.attendance.sessions[sortConfig.key] || 0; }
        else { aV = a.modules[sortConfig.key]; bV = b.modules[sortConfig.key]; }
        if (aV < bV) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aV > bV) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [sortConfig, searchTerm, sessionNames]);

  const attDist = useMemo(() => computeDistribution(dashboardData.students, s => s.attendance.totalPercentageAvg), []);
  const modDist = useMemo(() => computeDistribution(dashboardData.students, s => s.modules.week1Avg), []);

  const pct = (val) => {
    if (val === undefined || val === null || val === 0 || val === '0')
      return <span className="badge badge-danger">0%</span>;
    if (val >= 80)
      return <span className="badge badge-success">{val}%</span>;
    return <span className="badge badge-warning">{val}%</span>;
  };

  const sortIcon = (key) => (
    <ArrowUpDown size={14} className="sort-icon" style={{ opacity: sortConfig.key === key ? 1 : 0.3 }} />
  );

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="title-gradient">CodeChef Program Overview</h1>
          <p className="subtitle">Consolidated view of Student Engagement &amp; Performance</p>
        </div>
        <div className="last-updated" suppressHydrationWarning>Last Updated: {new Date(dashboardData.lastUpdated).toLocaleString()}</div>
      </header>

      {/* KPI Section */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper blue"><Users size={24} /></div>
          <div className="kpi-info">
            <h3>Total Students</h3>
            <p className="kpi-value">{dashboardData.totalStudents}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper orange"><CalendarCheck size={24} /></div>
          <div className="kpi-info">
            <h3>Total Hrs.</h3>
            <p className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalHours}hrs <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{sessionNames.length} sessions</span></p>
          </div>
        </div>
      </section>

      {/* Distribution Charts */}
      <section className="distribution-row">
        <MiniDonut data={attDist} label="Attendance Distribution" />
        <MiniDonut data={modDist} label="Week 1 Module Completion" />
      </section>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
          <Trophy size={18} /> Performance Tracker
        </button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <CalendarCheck size={18} /> Session Attendance
        </button>
      </div>

      {/* Table */}
      <section className="table-section">
        <div className="table-header-controls">
          <h2>{activeTab === 'performance' ? 'Module Completion Tracker' : 'Daily Session Tracker'}</h2>
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search by name, roll no or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th rowSpan="2" className="th-sno">#</th>
                <th rowSpan="2" onClick={() => requestSort('name')} className="sortable th-name">Name {sortIcon('name')}</th>
                <th rowSpan="2" onClick={() => requestSort('rollNo')} className="sortable th-roll">Roll No {sortIcon('rollNo')}</th>

                {activeTab === 'performance' && (
                  <>
                    <th rowSpan="2" onClick={() => requestSort('overall')} className="sortable highlight-header">Overall {sortIcon('overall')}</th>
                    
                    {/* Week 1 Group Header */}
                    <th colSpan={expandWeek1 ? 3 : 1} className="group-header">
                      <div className="flex-center">
                        <span>Week 1</span>
                        <button className="icon-btn" onClick={() => setExpandWeek1(!expandWeek1)}>
                          {expandWeek1 ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
                        </button>
                      </div>
                      {expandWeek1 && <div className="week-topics">{WEEK1_TOPICS}</div>}
                    </th>
                    
                    {/* Week 2 Group Header */}
                    <th colSpan={expandWeek2 ? 4 : 1} className="group-header active-week">
                      <div className="flex-center">
                        <span>Week 2 (Current)</span>
                        <button className="icon-btn" onClick={() => setExpandWeek2(!expandWeek2)}>
                          {expandWeek2 ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
                        </button>
                      </div>
                      {expandWeek2 && <div className="week-topics">{WEEK2_TOPICS}</div>}
                    </th>
                  </>
                )}

                {activeTab === 'attendance' && (
                  <>
                    <th rowSpan="2" onClick={() => requestSort('attendance')} className="sortable highlight-header">Overall Att. {sortIcon('attendance')}</th>
                    {week1Sessions.length > 0 && (
                      <th colSpan={week1Sessions.length} className="group-header">
                        <span>Week 1 Sessions</span>
                        <div className="week-topics">{WEEK1_TOPICS}</div>
                      </th>
                    )}
                    {week2Sessions.length > 0 && (
                      <th colSpan={week2Sessions.length} className="group-header active-week">
                        <span>Week 2 Sessions</span>
                        <div className="week-topics">{WEEK2_TOPICS}</div>
                      </th>
                    )}
                  </>
                )}
              </tr>
              <tr>
                {activeTab === 'performance' && (
                  <>
                    {/* Week 1 Columns */}
                    {expandWeek1 ? (
                      <>
                        <th onClick={() => requestSort('timeComplexity')} className="sortable">Time Cmplx {sortIcon('timeComplexity')}</th>
                        <th onClick={() => requestSort('arraysStringsSorting')} className="sortable">Arr/Str/Sort {sortIcon('arraysStringsSorting')}</th>
                        <th onClick={() => requestSort('prefixSums')} className="sortable">Prefix Sum {sortIcon('prefixSums')}</th>
                      </>
                    ) : (
                      <th onClick={() => requestSort('week1Avg')} className="sortable text-muted">Wk1 Avg {sortIcon('week1Avg')}</th>
                    )}
                    
                    {/* Week 2 Columns */}
                    {expandWeek2 ? (
                      <>
                        <th onClick={() => requestSort('sorting')} className="sortable active-sub">Sorting {sortIcon('sorting')}</th>
                        <th onClick={() => requestSort('twoPointers')} className="sortable active-sub">2 Pointers {sortIcon('twoPointers')}</th>
                        <th onClick={() => requestSort('linkedLists')} className="sortable active-sub">Linked Lists {sortIcon('linkedLists')}</th>
                        <th onClick={() => requestSort('stacks')} className="sortable active-sub">Stacks {sortIcon('stacks')}</th>
                      </>
                    ) : (
                      <th onClick={() => requestSort('week2Avg')} className="sortable active-sub text-muted">Wk2 Avg {sortIcon('week2Avg')}</th>
                    )}
                  </>
                )}
                
                {activeTab === 'attendance' && (
                  <>
                    {week1Sessions.map(s => <th key={s} onClick={() => requestSort(s)} className="sortable">{s.toUpperCase()} {sortIcon(s)}</th>)}
                    {week2Sessions.map(s => <th key={s} onClick={() => requestSort(s)} className="sortable active-sub">{s.toUpperCase()} {sortIcon(s)}</th>)}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student, idx) => (
                <tr key={student.userId || idx}>
                  <td className="index-cell">{idx + 1}</td>
                  <td className="student-name-cell">
                    <div className="student-name">{student.name}</div>
                    <div className="student-username">@{student.ccUsername}</div>
                  </td>
                  <td className="rollno-cell">{student.rollNo}</td>

                  {activeTab === 'performance' && (
                    <>
                      <td className="overall-cell">{pct(student.modules.overall)}</td>
                      
                      {/* Week 1 Data */}
                      {expandWeek1 ? (
                        <>
                          <td>{pct(student.modules.timeComplexity)}</td>
                          <td>{pct(student.modules.arraysStringsSorting)}</td>
                          <td>{pct(student.modules.prefixSums)}</td>
                        </>
                      ) : (
                        <td className="text-muted-cell">{pct(student.modules.week1Avg)}</td>
                      )}
                      
                      {/* Week 2 Data */}
                      {expandWeek2 ? (
                        <>
                          <td>{pct(student.modules.sorting)}</td>
                          <td>{pct(student.modules.twoPointers)}</td>
                          <td>{pct(student.modules.linkedLists)}</td>
                          <td>{pct(student.modules.stacks)}</td>
                        </>
                      ) : (
                        <td className="text-muted-cell">{pct(student.modules.week2Avg)}</td>
                      )}
                    </>
                  )}

                  {activeTab === 'attendance' && (
                    <>
                      <td className="overall-cell">{pct(student.attendance.totalPercentageAvg)}</td>
                      {week1Sessions.map(s => <td key={s}>{pct(student.attendance.sessions[s] || 0)}</td>)}
                      {week2Sessions.map(s => <td key={s}>{pct(student.attendance.sessions[s] || 0)}</td>)}
                    </>
                  )}
                </tr>
              ))}
              {sortedStudents.length === 0 && (
                <tr><td colSpan="15" className="empty-state">No students found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
