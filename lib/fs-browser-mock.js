// Stub for Node's `fs` module in browser/client bundles.
// Packages like @faustwp/core call fs.statSync at init time; this prevents
// "is not a function" errors without breaking anything meaningful client-side.
const fakeStats = {
  isDirectory: () => false,
  isFile: () => false,
  isSymbolicLink: () => false,
  isBlockDevice: () => false,
  isCharacterDevice: () => false,
  isFIFO: () => false,
  isSocket: () => false,
  size: 0,
  mtime: new Date(0),
  ctime: new Date(0),
  atime: new Date(0),
  birthtime: new Date(0),
};
const noop = () => fakeStats;
const noopFalse = () => false;
const noopArr = () => [];

module.exports = {
  statSync: noop,
  lstatSync: noop,
  readFileSync: noop,
  writeFileSync: noop,
  appendFileSync: noop,
  unlinkSync: noop,
  mkdirSync: noop,
  rmdirSync: noop,
  readdirSync: noopArr,
  existsSync: noopFalse,
  access: noop,
  stat: noop,
  readFile: noop,
  writeFile: noop,
  mkdir: noop,
  readdir: noop,
  promises: {
    readFile: async () => null,
    writeFile: async () => null,
    appendFile: async () => null,
    unlink: async () => null,
    mkdir: async () => null,
    mkdtemp: async () => '',
    rmdir: async () => null,
    rm: async () => null,
    rename: async () => null,
    copyFile: async () => null,
    readdir: async () => [],
    stat: async () => fakeStats,
    lstat: async () => fakeStats,
    access: async () => null,
    open: async () => null,
    realpath: async (p) => p,
  },
};
