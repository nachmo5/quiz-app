export default class Logger {
  info(...params: any) {
    console.info(...params);
  }

  error(...params: any) {
    console.error(...params);
  }

  warn(...params: any) {
    console.warn(...params);
  }
}
