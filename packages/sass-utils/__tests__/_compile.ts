import { compileString, Exception } from 'sass';
import { fileURLToPath } from 'node:url';

const loadPaths: string[] = [fileURLToPath(new URL('../src/', import.meta.url))];

export function compile(scss: string): string {
  return compileString(scss, { loadPaths }).css.trim();
}

export function compileError(scss: string): string {
  try {
    compileString(scss, { loadPaths });
  } catch (error: unknown) {
    if (error instanceof Exception) {
      const message: string = error.sassMessage;
      if (message.startsWith('"') && message.endsWith('"')) {
        return message.slice(1, -1);
      }
      return message;
    }
    throw error;
  }

  throw new Error(`Expected compilation to fail:\n${scss}`);
}
