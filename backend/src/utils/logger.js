class Logger {
  info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  }
  error(message, error = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }
  warn(message, data = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }
}
export default new Logger();