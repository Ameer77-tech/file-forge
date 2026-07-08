import { regex } from "./regex.js";

export function updateTimeline(analysis, line) {
  const match = line.match(regex.timestamp);

  if (!match) return;

  let timestamp = match[1];

  // normalize common Apache/Nginx format like 08/Jul/2026:07:34:13 +0000
  const apacheMatch = timestamp.match(
    /(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})/,
  );
  if (apacheMatch) {
    const day = apacheMatch[1];
    const mon = apacheMatch[2];
    const year = apacheMatch[3];
    const hh = apacheMatch[4];
    const mm = apacheMatch[5];
    const ss = apacheMatch[6];
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    const monNum = months[mon] || "01";
    timestamp = `${year}-${monNum}-${day}T${hh}:${mm}:${ss}Z`;
  }

  if (!analysis.timeline.firstLog) {
    analysis.timeline.firstLog = timestamp;
  }

  analysis.timeline.lastLog = timestamp;

  // extract hour robustly
  const hourMatch = timestamp.match(/T?(\d{2}):\d{2}:\d{2}/);
  let hour = "00";
  if (hourMatch) hour = hourMatch[1];

  analysis.hourlyTraffic[hour] = (analysis.hourlyTraffic[hour] || 0) + 1;
}

export function finalizeTimeline(analysis) {
  if (!analysis.timeline.firstLog || !analysis.timeline.lastLog) {
    return;
  }

  const first = new Date(analysis.timeline.firstLog.replace(" ", "T"));

  const last = new Date(analysis.timeline.lastLog.replace(" ", "T"));

  const seconds = Math.floor((last - first) / 1000);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  analysis.timeline.duration = `${h}h ${m}m ${s}s`;

  // convert hourlyTraffic object into sorted array with percentages
  const total = analysis.requests.total || analysis.statistics.lines || 0;
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hh = String(i).padStart(2, "0");
    const count = analysis.hourlyTraffic[hh] || 0;
    hours.push({
      hour: hh,
      count,
      percentage: total === 0 ? 0 : Number(((count / total) * 100).toFixed(2)),
    });
  }

  analysis.hourlyTraffic = hours;
}
