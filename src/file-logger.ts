import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger extends ConsoleLogger {
  // Путь к файлу логов: корень_проекта/logs/debug.log
  private logFilePath = path.join(process.cwd(), 'logs', 'debug.log');

  constructor() {
    super();
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // --- ИЗМЕНЕНИЕ: Очищаем файл при старте (перезаписываем пустым) ---
    // Это сработает один раз при запуске приложения, когда создается экземпляр логгера
    try {
        fs.writeFileSync(this.logFilePath, ''); 
    } catch (e) {
        console.error('Не удалось очистить файл логов:', e);
    }
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
    this.writeToFile('LOG', message, optionalParams);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.writeToFile('ERROR', message, [stack, context]);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    this.writeToFile('WARN', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(message, ...optionalParams);
    this.writeToFile('DEBUG', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message, ...optionalParams);
    this.writeToFile('VERBOSE', message, optionalParams);
  }

  private writeToFile(level: string, message: any, args: any[] = []) {
    const timestamp = new Date().toISOString();
    
    const msgStr = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);
    
    const argsStr = args
        .filter(a => a !== undefined && a !== null)
        .map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
        .join(' | ');

    const logLine = `[${timestamp}] [${level}] ${msgStr} ${argsStr}\n--------------------------------------------------\n`;

    try {
      // Здесь оставляем appendFileSync, чтобы в течение работы программы логи дописывались
      fs.appendFileSync(this.logFilePath, logLine);
    } catch (e) {
      console.error('Не удалось записать лог в файл:', e);
    }
  }
}