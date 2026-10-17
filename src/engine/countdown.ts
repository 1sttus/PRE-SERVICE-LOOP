/**
 * Pure countdown calculations for Morningstar Pre-Service Experience
 */

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formattedString: string;
}

/**
 * Calculates time remaining until target timestamp in milliseconds.
 * Always clamps to 0 to prevent negative countdown numbers.
 */
export function calculateTimeRemaining(
  targetTimestampMs: number,
  currentTimestampMs: number = Date.now()
): CountdownResult {
  const diffMs = targetTimestampMs - currentTimestampMs;
  
  if (diffMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      formattedString: '00:00',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formattedString: string;
  if (hours > 0) {
    formattedString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    formattedString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
    formattedString,
  };
}

/**
 * Parses date string (YYYY-MM-DD) and time string (HH:mm) with timezone into UTC timestamp
 */
export function parseTargetServiceTime(
  dateStr: string,
  timeStr: string,
  timezone: string = 'Africa/Lagos'
): number {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    if (!year || !month || !day || isNaN(hours) || isNaN(minutes)) {
      return Date.now() + 30 * 60 * 1000;
    }

    // Try accurate timezone calculation via Intl
    try {
      // Find the offset between UTC and the requested timezone at this date
      const testDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      const tzString = testDate.toLocaleString('en-US', { timeZone: timezone });
      const tzDate = new Date(tzString);
      const diffMs = testDate.getTime() - tzDate.getTime();
      
      const targetUtcMs = testDate.getTime() + diffMs;
      return targetUtcMs;
    } catch {
      return new Date(`${dateStr}T${timeStr}:00`).getTime();
    }
  } catch {
    return Date.now() + 30 * 60 * 1000;
  }
}
