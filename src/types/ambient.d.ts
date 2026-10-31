declare module 'child_process' {
  export function execSync(command: string, options?: { encoding?: string }): string;
}

declare module 'fs' {
  export interface AmbientDirent {
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
  }
  export function readFileSync(path: string, encoding: string): string;
  export function readdirSync(path: string, options?: { withFileTypes?: boolean }): AmbientDirent[];
}
