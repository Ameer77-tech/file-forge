import fs from "fs";
import path from "path";
import readline from "readline";

async function analyzeTextFile(fileData) {
  const stream = fs.createReadStream(
    path.join(fileData.path, fileData.filename),
    {
      encoding: "utf8",
    },
  );

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const analysis = {
    file: {
      name: fileData.originalName,
      extension: path.extname(fileData.filename),
      size: fileData.size,
    },

    statistics: {
      lines: 0,
      emptyLines: 0,
      paragraphs: 0,
      words: 0,
      characters: 0,
      charactersWithoutSpaces: 0,
      sentences: 0,
    },

    averages: {
      wordsPerLine: 0,
      charsPerLine: 0,
      averageWordLength: 0,
    },

    longest: {
      line: "",
      word: "",
    },

    shortest: {
      line: "",
      word: "",
    },

    detections: {
      emails: { count: 0, items: [] },
      urls: { count: 0, items: [] },
      phoneNumbers: { count: 0, items: [] },
      ipv4: { count: 0, items: [] },
    },
  };

  const emailSet = new Set();
  const urlSet = new Set();
  const phoneSet = new Set();
  const ipv4Set = new Set();

  let totalWordLength = 0;
  let inParagraph = false;

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

  const urlRegex = /https?:\/\/[^\s]+/g;

  const phoneRegex = /\+?\d[\d\s-]{7,}\d/g;

  const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

  for await (const line of rl) {
    analysis.statistics.lines++;

    analysis.statistics.characters += line.length;

    analysis.statistics.charactersWithoutSpaces += line.replace(
      /\s/g,
      "",
    ).length;

    if (line.trim() === "") {
      analysis.statistics.emptyLines++;
      inParagraph = false;
      continue;
    }

    if (!inParagraph) {
      analysis.statistics.paragraphs++;
      inParagraph = true;
    }

    if (
      analysis.longest.line === "" ||
      line.length > analysis.longest.line.length
    ) {
      analysis.longest.line = line;
    }

    if (
      analysis.shortest.line === "" ||
      line.length < analysis.shortest.line.length
    ) {
      analysis.shortest.line = line;
    }

    const words = line.match(/\b[\w'-]+\b/g) ?? [];

    analysis.statistics.words += words.length;

    for (const word of words) {
      const normalized = word.toLowerCase();

      totalWordLength += normalized.length;

      if (normalized.length > analysis.longest.word.length) {
        analysis.longest.word = normalized;
      }

      if (
        analysis.shortest.word === "" ||
        normalized.length < analysis.shortest.word.length
      ) {
        analysis.shortest.word = normalized;
      }
    }

    const sentenceMatches = line.match(/[.!?]+/g);

    if (sentenceMatches) {
      analysis.statistics.sentences += sentenceMatches.length;
    }

    const foundEmails = line.match(emailRegex) ?? [];
    analysis.detections.emails.count += foundEmails.length;
    foundEmails.forEach(e => emailSet.add(e));

    const foundUrls = line.match(urlRegex) ?? [];
    analysis.detections.urls.count += foundUrls.length;
    foundUrls.forEach(u => urlSet.add(u));

    const foundPhones = line.match(phoneRegex) ?? [];
    analysis.detections.phoneNumbers.count += foundPhones.length;
    foundPhones.forEach(p => phoneSet.add(p));

    const foundIpv4 = line.match(ipv4Regex) ?? [];
    analysis.detections.ipv4.count += foundIpv4.length;
    foundIpv4.forEach(i => ipv4Set.add(i));
  }

  analysis.detections.emails.items = Array.from(emailSet).slice(0, 50);
  analysis.detections.urls.items = Array.from(urlSet).slice(0, 50);
  analysis.detections.phoneNumbers.items = Array.from(phoneSet).slice(0, 50);
  analysis.detections.ipv4.items = Array.from(ipv4Set).slice(0, 50);

  analysis.averages.wordsPerLine =
    analysis.statistics.lines === 0
      ? 0
      : Number(
          (analysis.statistics.words / analysis.statistics.lines).toFixed(2),
        );

  analysis.averages.charsPerLine =
    analysis.statistics.lines === 0
      ? 0
      : Number(
          (analysis.statistics.characters / analysis.statistics.lines).toFixed(
            2,
          ),
        );

  analysis.averages.averageWordLength =
    analysis.statistics.words === 0
      ? 0
      : Number((totalWordLength / analysis.statistics.words).toFixed(2));

  return analysis;
}

export default analyzeTextFile;
