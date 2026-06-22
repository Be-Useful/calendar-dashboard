const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

const ROOT_DIR = path.resolve(__dirname, '../../');
const ATTENDANCE_DIR = path.join(ROOT_DIR, 'attendance');
const MODULES_DIR = path.join(ROOT_DIR, 'module completion');
const OUTPUT_FILE = path.join(__dirname, '../src/data/dashboard_data.json');

// Helper to normalize strings for matching
const normalizeString = (str) => {
  if (!str) return '';
  return String(str).toLowerCase()
    .replace(/iiit dharwad/g, '')
    .replace(/[^a-z0-9]/g, '');
};

// Helper to parse HH:MM:SS to total minutes
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  // Handle case where excel converts duration to fraction of a day
  if (typeof timeStr === 'number') {
    return timeStr * 24 * 60;
  }
  const parts = String(timeStr).split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  return hours * 60 + minutes + (seconds / 60);
};

// Parse a single CSV safely, skipping junk metadata lines
const parseCSV = (filePath) => {
  try {
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    // Strip UTF-8 BOM if present
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }
    
    // Some files have utf-16 or weird encoding issues with csv-parse
    // We will parse it manually since the format is strictly "val","val"
    const lines = fileContent.split(/\r?\n/);
    const result = [];
    let headers = [];

    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('*') || t.startsWith('"*')) continue;

      // The files are typically like: "Name","Time" or Name,Time
      let cols = [];
      if (t.includes('","')) {
        cols = t.split('","').map(s => s.replace(/(^"|"$)/g, '').trim());
      } else {
        // Fallback to simple comma split if not strictly quoted
        cols = t.split(',').map(s => s.replace(/(^"|"$)/g, '').trim());
      }

      if (cols.length >= 2) {
        if (headers.length === 0) {
          headers = cols.map(h => h.replace(/["']/g, '').trim());
        } else {
          const row = {};
          headers.forEach((h, i) => {
            row[h] = cols[i] || '';
          });
          result.push(row);
        }
      }
    }
    return result;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
};

const main = () => {
  console.log('Starting data parsing (V2.2)...');

  // 1. Parse Module Data
  const practiceData = parseCSV(path.join(MODULES_DIR, 'practice module.csv'));
  const learningData = parseCSV(path.join(MODULES_DIR, 'learning module.csv'));

  const studentsMap = {};

  // Initialize students from practice module
  practiceData.forEach(row => {
    const userId = row['User Id'];
    if (!userId) return;

    studentsMap[userId] = {
      userId,
      name: row['Name'],
      ccUsername: row['CC Username'],
      rollNo: row['Roll No'],
      normalizedName: normalizeString(row['Name']),
      normalizedRoll: normalizeString(row['Roll No']),
      normalizedCC: normalizeString(row['CC Username']),
      modules: {
        // Week 1 (Previous)
        timeComplexity: 0, 
        arraysStringsSorting: parseInt(row['Arrays, Strings & Sorting']) || 0,
        prefixSums: parseInt(row['Prefix Sum Problems']) || parseInt(row['Prefix Sum']) || 0,
        // Week 2 (Current)
        twoPointers: parseInt(row['Two Pointers and Sliding Window Technique']) || parseInt(row['Two Pointers']) || 0,
        linkedLists: parseInt(row['Linked Lists']) || 0,
        stacks: parseInt(row['Stacks and Queues']) || 0,
        sorting: parseInt(row['Practice Sorting']) || parseInt(row['Sorting']) || 0,
      },
      attendance: {
        totalPercentageAvg: 0,
        sessions: {}
      }
    };
  });

  // Merge learning data for Week 1 (Time Complexity)
  learningData.forEach(row => {
    const userId = row['User Id'];
    if (studentsMap[userId]) {
      studentsMap[userId].modules.timeComplexity = parseInt(row['Time complexity']) || 0;
    }
  });

  // 2. Parse Attendance Data Session by Session
  const attendanceFiles = fs.readdirSync(ATTENDANCE_DIR).filter(f => f.endsWith('.csv') || f.endsWith('.xlsx'));
  const sessionStats = {};

  attendanceFiles.forEach(file => {
    const filePath = path.join(ATTENDANCE_DIR, file);
    let sessionName = file.replace('.csv', '').replace('.xlsx', '');
    // Sanitize sessionName for display (e.g., lec0(syllab) -> lec0)
    if (sessionName.includes('(')) {
      sessionName = sessionName.split('(')[0];
    }
    
    let data = [];
    if (file.endsWith('.csv')) {
      data = parseCSV(filePath);
    } else {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    // 1. Find Faculty Duration (Total Session Time)
    let facultyMinutes = 0;
    data.forEach(attRow => {
      const attName = normalizeString(attRow['Full Name'] || attRow['Name'] || '');
      if (attName.includes('tarunkumar') || attName.includes('tarun')) {
        const minutes = parseTimeToMinutes(attRow['Time in Call'] || attRow['Duration'] || '00:00:00');
        if (minutes > facultyMinutes) {
          facultyMinutes = minutes;
        }
      }
    });

    // 2. Find Max Student Duration (For 100% attendance reference)
    let referenceMinutes = 0;
    data.forEach(attRow => {
      const attName = normalizeString(attRow['Full Name'] || attRow['Name'] || '');
      if (attName.includes('tarunkumar') || attName.includes('tarun')) return;
      const minutes = parseTimeToMinutes(attRow['Time in Call'] || attRow['Duration'] || '00:00:00');
      if (minutes > referenceMinutes) {
        referenceMinutes = minutes;
      }
    });

    // Fallback if no faculty found
    if (facultyMinutes === 0) facultyMinutes = referenceMinutes;

    sessionStats[sessionName] = {
      facultyDuration: facultyMinutes,
      referenceDuration: referenceMinutes,
      studentsPresent: 0
    };

    // Calculate percentage for each student in this session
    data.forEach(attRow => {
      const attNameRaw = attRow['Full Name'] || attRow['Name'] || '';
      const attName = normalizeString(attNameRaw);
      const minutes = parseTimeToMinutes(attRow['Time in Call'] || attRow['Duration'] || '00:00:00');
      
      if (minutes > 0 && attName && !attName.includes('tarunkumar') && !attName.includes('tarun')) {
        // More robust matching: Check Name, Roll No, or CC Username
        let matchedUserId = null;
        for (const userId in studentsMap) {
          const s = studentsMap[userId];
          if (
            s.normalizedName === attName || 
            attName.includes(s.normalizedName) || 
            (s.normalizedName.length > 4 && attName.includes(s.normalizedName.substring(0, 5))) || // Partial name match
            (s.normalizedRoll && attName.includes(s.normalizedRoll)) ||
            (s.normalizedCC && attName.includes(s.normalizedCC))
          ) {
            matchedUserId = userId;
            break;
          }
        }

        if (matchedUserId) {
          let percentage = 0;
          if (referenceMinutes > 0) {
            percentage = Math.round((minutes / referenceMinutes) * 100);
            if (percentage > 100) percentage = 100;
          }
          
          // If a student somehow joined from two devices, take the max percentage
          const existing = studentsMap[matchedUserId].attendance.sessions[sessionName] || 0;
          studentsMap[matchedUserId].attendance.sessions[sessionName] = Math.max(existing, percentage);
          
          if (percentage > 0 && existing === 0) {
            sessionStats[sessionName].studentsPresent++;
          }
        }
      }
    });
  });

  // 3. Finalize Aggregations
  let classTotalAttendance = 0;
  
  const sessionNamesList = Object.keys(sessionStats);
  const totalSessions = sessionNamesList.length;

  const studentList = Object.values(studentsMap).map(s => {
    // calculate average attendance % across all sessions
    if (totalSessions > 0) {
      let sum = 0;
      sessionNamesList.forEach(session => {
        sum += s.attendance.sessions[session] || 0;
      });
      s.attendance.totalPercentageAvg = Math.round(sum / totalSessions);
    }
    
    // calculate overall module completion %
    const mods = s.modules;
    const week1Avg = (mods.arraysStringsSorting + mods.timeComplexity + mods.prefixSums) / 3;
    const week2Avg = (mods.twoPointers + mods.linkedLists + mods.stacks + mods.sorting) / 4;
    s.modules.week1Avg = Math.round(week1Avg);
    s.modules.week2Avg = Math.round(week2Avg);
    s.modules.overall = Math.round(week1Avg);

    classTotalAttendance += s.attendance.totalPercentageAvg;

    // cleanup
    delete s.normalizedName;
    delete s.normalizedRoll;
    delete s.normalizedCC;
    return s;
  });

  const dashboardData = {
    lastUpdated: new Date().toISOString(),
    totalStudents: studentList.length,
    averageAttendance: studentList.length > 0 ? Math.round(classTotalAttendance / studentList.length) : 0,
    averagePracticeCompletion: studentList.length > 0 ? Math.round(studentList.reduce((acc, s) => acc + s.modules.overall, 0) / studentList.length) : 0,
    sessionStats,
    students: studentList
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dashboardData, null, 2));
  console.log(`Parsed data for ${studentList.length} students across ${totalSessions} sessions.`);
  console.log(`Saved output to ${OUTPUT_FILE}`);
};

main();
