import $fs from 'fs';
import $path from 'path';

const _importDirectory = (path: string, params: any = {}): Promise<any>[] => {
  const { ext = 'ts', recursive = true, ignore = [] } = params;
  const absolutePath = $path.join($path.resolve('.'), 'src', path);

  // eslint-disable-next-line
  const directory = $fs.readdirSync(absolutePath);
  if (directory.length === 0) return [];

  return directory.reduce((files: any, file: any) => {
    const filePath = $path.join(absolutePath, file);
    // ignore
    if (ignore.includes(file)) return files;
    // directory
    // eslint-disable-next-line
    if ($fs.statSync(filePath).isDirectory()) {
      return recursive ? [...files, ..._importDirectory($path.join(path, file), params)] : files;
    }
    // extensions
    if ($path.extname(filePath).substring(1) !== ext) return files;
    // eslint-disable-next-line
    return [...files, import('' + filePath)];
  }, []);
};

const importDirectory = (path: any, params: any = {}) =>
  Promise.all(_importDirectory(path, params)).then((modules) => modules.map((m) => m.default));

export const getPath = (path: any) => $path.join($path.resolve('.'), path);

export default importDirectory;
