import Simc from '../engine/engine';

import engine_url from 'url:../engine/engine';

let engine: any;

export type MsgLoaded = {
  event: 'loaded',
};

export type Progress = {
  iteration: number,
  totalIterations: number,
  phase: number,
  totalPhases: number,
  phaseName: string,
  subphaseName: string,
};

export type MsgProgress = {
  event: 'progressUpdate',
  progress: Progress,
};

export type SimOutputData = {
  html: string,
  json: Object,
  raw: string,
}

export type MsgDone = {
  event: 'done',
  result: SimOutputData
};

export type MsgFailed = {
  event: 'failed',
  error: string,
};

export type MsgPrint = {
  event: 'print',
  str: string,
};
export type MsgPrintErr = {
  event: 'printErr',
  str: string,
};

export type SimMsg = MsgLoaded | MsgProgress | MsgDone | MsgFailed | MsgPrint | MsgPrintErr;

function instantiateWithFallback(url: string, importObject: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
  if (typeof WebAssembly.instantiateStreaming === 'function') {
    console.log('Instantiate Streaming');
    return WebAssembly.instantiateStreaming(fetch(url), importObject);
  }

  console.log('Instantiate Fallback');
  return fetch(url).then(response => response.arrayBuffer()).then((bytes) => {
    console.log('Fetch done!');
    return WebAssembly.instantiate(bytes, importObject);
  });
}

(self as any).simcCallbacks = {
  mainScriptUrlOrBlob: "/engine.js",
  loaded: () => {
    self.postMessage({ event: 'loaded' });
  },
  updateProgress: (progress) => {
    self.postMessage({ event: 'progressUpdate', progress });
  },
  locateFile: (path, scriptdir) => {
    let u = new URL(path, import.meta.url);
    console.log("locateFile called ", path, u.pathname)
    return "./" + path;
  },
  instantiateWasm: (imports, onSuccess) => {
    instantiateWithFallback('/engine.wasm', imports).then((arg) => onSuccess(arg.instance, arg.module));
  },
  print: (txt) => {
    self.postMessage({ event: 'print', str: txt + '\n' });
    console.log("print: ", txt);
  },
  printErr: (txt) => {
    self.postMessage({ event: 'printErr', str: txt + '\n' });
    console.error("err: ", txt);
  }
};

const simulate = (sim: any, profile: string): SimOutputData => {
  let rtn: SimOutputData = {
    html: '',
    json: '',
    raw: '',
  };
  profile = "\n### Default Options ###\niterations=1000\nthreads=1\njson=/output.json,full_states=1,pretty_print=1\n ### End ### \n" + profile;
  const ptrIn = sim.allocateUTF8(profile);
  if (!sim._simulate(ptrIn))
    return rtn;

  rtn.json = sim.FS.readFile('/output.json', { encoding: 'utf8' });
  rtn.html = sim.FS.readFile('/output.html', { encoding: 'utf8' });
  rtn.raw = sim.FS.readFile('/output.txt', { encoding: 'utf8' });

  sim._free(ptrIn);
  sim.FS.unlink('/output.json');
  sim.FS.unlink('/output.html');
  sim.FS.unlink('/output.txt');

  return rtn;
};

self.onmessage = (e: MessageEvent) => {
  const result = simulate(engine, e.data);
  try {
    result.json = JSON.parse(result.json as string);
    self.postMessage({ event: 'done', result: result });
  } catch (err) {
    self.postMessage({ event: 'failed', error: err.toString() });
  }
};

Simc((self as any).simcCallbacks).then(mod => { engine = mod });
