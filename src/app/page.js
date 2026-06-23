"use client";
import React, { useState, useMemo } from 'react';
import dashboardData from '@/data/dashboard_data.json';
import { Users, BookOpen, CalendarCheck, Search, Trophy, ArrowUpDown, ChevronRight, ChevronLeft, Download, Maximize2, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

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

function MiniDonut({ data, label, onEnlarge }) {
  return (
    <div className="mini-donut-card" style={{ position: 'relative' }}>
      <button 
        onClick={() => onEnlarge({ data, label })}
        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', zIndex: 10, transition: 'color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        title="Enlarge Chart"
      >
        <Maximize2 size={16} />
      </button>
      <h4 className="mini-donut-label">{label}</h4>
      <div className="mini-donut-row">
        <div className="mini-donut-chart">
          <ResponsiveContainer width={90} height={90} minWidth={1} minHeight={1}>
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

function ChartModal({ chart, onClose }) {
  if (!chart) return null;

  const handleDownload = async () => {
    const el = document.getElementById("enlarged-chart-container");
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor: '#050505', scale: 2 });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${chart.label.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', minWidth: '500px', maxWidth: '90vw' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
          <X size={18} />
        </button>
        
        <div id="enlarged-chart-container" style={{ padding: '2.5rem', background: '#050505', borderRadius: '12px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '2rem', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem' }}>{chart.label}</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={chart.data} dataKey="value" innerRadius={80} outerRadius={120} paddingAngle={2} stroke="none">
                  {chart.data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} students`} contentStyle={{ background: '#1e1e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {chart.data.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: d.color, display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{d.name}: <strong style={{ color: '#fff' }}>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', border: 'none', color: '#fff', padding: '0.75rem 2rem', borderRadius: '30px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 'bold', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <Download size={18} /> Download This Chart
          </button>
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
  const [enlargedChart, setEnlargedChart] = useState(null);

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
  const overallDist = useMemo(() => computeDistribution(dashboardData.students, s => s.modules.overall), []);

  const handleExportExcel = () => {
    const exportData = dashboardData.students.map(s => {
      const row = {
        Name: s.name,
        Username: s.ccUsername,
        RollNo: s.rollNo,
        "Overall Module %": s.modules.overall,
        "Week 1 Avg %": s.modules.week1Avg,
        "Week 2 Avg %": s.modules.week2Avg,
        "Overall Attendance %": s.attendance.totalPercentageAvg,
        "Time Cmplx": s.modules.timeComplexity,
        "Arr/Str/Sort": s.modules.arraysStringsSorting,
        "Prefix Sums": s.modules.prefixSums,
        "Two Pointers": s.modules.twoPointers,
        "Linked Lists": s.modules.linkedLists,
        "Stacks": s.modules.stacks,
        "Sorting": s.modules.sorting
      };
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Report");
    XLSX.writeFile(workbook, "Dashboard_Metrics_Report.xlsx");
  };

  const handleDownloadCharts = async () => {
    const chartSection = document.getElementById("distribution-charts-section");
    if (!chartSection) return;
    
    try {
      const canvas = await html2canvas(chartSection, {
        backgroundColor: '#050505', // Match background
        scale: 2 // Better resolution
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "dashboard_charts.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download charts", err);
    }
  };

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
      <header className="dashboard-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title-gradient">CodeChef Program Overview</h1>
          <p className="subtitle">Consolidated view of Student Engagement &amp; Performance</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <div className="last-updated" suppressHydrationWarning>Last Updated: {new Date(dashboardData.lastUpdated).toLocaleString()}</div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDownloadCharts} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              <Download size={16} /> Save Charts (PNG)
            </button>
            <button onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <Download size={16} /> Export Data (Excel)
            </button>
          </div>
        </div>
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
      <section className="distribution-row" id="distribution-charts-section" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <MiniDonut data={attDist} label="Attendance Distribution" onEnlarge={setEnlargedChart} />
        <MiniDonut data={modDist} label="Week 1 Module Completion" onEnlarge={setEnlargedChart} />
        <MiniDonut data={overallDist} label="Overall Performance" onEnlarge={setEnlargedChart} />
      </section>

      <ChartModal chart={enlargedChart} onClose={() => setEnlargedChart(null)} />

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
