interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

type LogLevel = "info" | "error" | "warn" | "debug";
type LogFn = (message: string, context?: Record<string, unknown>) => void;

// Format context object for logging
function formatContext(context?: Record<string, unknown>): string {
  if (!context) return "";

  return Object.entries(context)
    .map(([key, value]) => {
      if (value instanceof Error) {
        return `${key}=${value.message}`;
      }
      if (Array.isArray(value)) {
        return `${key}=[${value.join(",")}]`;
      }
      return `${key}=${typeof value === "object" && value !== null ? JSON.stringify(value) : String(value)}`;
    })
    .join(" ");
}

// Create logger functions
function createLogger(level: LogLevel): LogFn {
  return (message: string, context?: Record<string, unknown>): void => {
    const timestamp = new Date().toISOString();
    const contextStr = formatContext(context);
    const logMessage = `${timestamp} ${level}: ${message} ${contextStr}`;

    switch (level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      case "debug":
        console.debug(logMessage);
        break;
      default:
        console.info(logMessage);
    }
  };
}

// Create the logger instance
export const logger: Logger = {
  info: createLogger("info"),
  error: createLogger("error"),
  warn: createLogger("warn"),
  debug: createLogger("debug"),
};
