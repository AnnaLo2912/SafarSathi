export function normalizeName(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEnrollment(value = "") {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function hasEnoughDigits(value = "") {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4;
}

function levenshteinDistance(a, b) {
  const left = a || "";
  const right = b || "";

  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

export function nameSimilarity(leftName = "", rightName = "") {
  const left = normalizeName(leftName);
  const right = normalizeName(rightName);

  if (!left || !right) return 0;
  if (left === right) return 1;

  const distance = levenshteinDistance(left, right);
  const longest = Math.max(left.length, right.length);
  return longest ? 1 - distance / longest : 0;
}

export function parseEnrollmentNumber(ocrText = "") {
  const patterns = [
    /\bENROLL(?:MENT)?\s*(?:NO|NUMBER)?\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]{5,})\b/i,
    /\bENR\.?\s*(?:NO|NUMBER)?\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]{5,})\b/i,
    /\b(IITF[\-\/]?\d{4}[\-\/]?\d{3,6})\b/i,
    /\b([A-Z]{2,}[\-\/]?\d{4,}[\-\/]?\d{2,})\b/,
  ];

  for (const pattern of patterns) {
    const match = ocrText.match(pattern);
    if (match?.[1]) {
      const candidate = normalizeEnrollment(match[1]);
      if (hasEnoughDigits(candidate)) {
        return candidate;
      }
    }

    if (match?.[0]) {
      const candidate = normalizeEnrollment(match[0]);
      if (hasEnoughDigits(candidate)) {
        return candidate;
      }
    }
  }

  return "";
}

function isLikelyPersonName(line = "") {
  const cleaned = line.replace(/[^a-zA-Z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return false;

  const noiseKeywords = [
    "certificate",
    "programme",
    "program",
    "tourist",
    "facilitator",
    "government",
    "india",
    "ministry",
    "completion",
    "incredible",
  ];

  const lower = cleaned.toLowerCase();
  if (noiseKeywords.some((keyword) => lower.includes(keyword))) {
    return false;
  }

  const tokens = cleaned.split(" ");
  if (tokens.length < 2 || tokens.length > 5) return false;

  const allWords = tokens.every((token) => /^[A-Z][a-z]+$/.test(token) || /^[A-Z]{2,}$/.test(token));
  return allWords;
}

export function parseFullName(ocrText = "") {
  const lines = ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const mrMs = line.match(/Mr\.?\/?Ms\.?\s*[:\-]?\s*([A-Za-z\s]{3,})/i);
    if (mrMs?.[1] && isLikelyPersonName(mrMs[1])) {
      return mrMs[1].trim();
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].toLowerCase().includes("this is to certify")) {
      for (let j = i + 1; j <= i + 3 && j < lines.length; j += 1) {
        if (isLikelyPersonName(lines[j])) {
          return lines[j].replace(/^Mr\.?\/?Ms\.?\s*/i, "").trim();
        }
      }
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    if (lower.includes("candidate name") || lower.includes("name")) {
      const sameLineMatch = lines[i].match(/name\s*[:\-]?\s*(.+)$/i);
      if (sameLineMatch?.[1] && isLikelyPersonName(sameLineMatch[1])) {
        return sameLineMatch[1].trim();
      }

      const nextLine = lines[i + 1];
      if (nextLine && isLikelyPersonName(nextLine)) {
        return nextLine;
      }
    }
  }

  for (const line of lines) {
    if (isLikelyPersonName(line)) {
      return line;
    }
  }

  return "";
}
