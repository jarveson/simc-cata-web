import type { SimMsg, Progress, SimOutputData } from './sim_worker';

// re-export type for easier access
export type SimProgress = Progress;

enum Status {
  Unloaded = 0,
  Loading = 1,
  Idle = 2,
  Simulating = 3,
};

type ProgressFn = (progress: SimProgress) => void;
type PrintFn = (txt: string) => void;

type SimJob = {
  profile: string,
  progressCallback: ProgressFn | null,
  onPrint: PrintFn | null;
  onPrintErr: PrintFn | null;
  resolve: (result: SimOutputData) => void,
  reject: (err: string) => void,
};

type SimWorker = {
  worker: Worker,
  status: Status,
  currentJob: SimJob | null,
};


export default class Simcraft {
  workers: Array<SimWorker>;
  pendingJobs: Array<SimJob>;
  loaded: boolean;
  onLoad: () => void;

  constructor() {
    this.pendingJobs = [];
    this.workers = [];
    // start with one worker so the first one comes up fast
    this.fillWorkerPool(1);
    this.loaded = false;
  }

  onWorkerMessage = (data: SimMsg, worker: SimWorker): Status => {
    if (data.event === 'loaded') {
      this.loaded = true;
      if (this.onLoad)
        this.onLoad();

      const newState = this.scheduleWorker(worker);
      //this.fillWorkerPool(null); // spawn the remaing workers after the first
      return newState;
    }
    else if (data.event === 'done') {
      if (!worker.currentJob) {
        console.error('Invalid state transition.');
        return Status.Idle;
      }
      worker.currentJob.resolve(data.result);
      worker.currentJob = null;
      return this.scheduleWorker(worker);
    }
    else if (data.event === 'failed') {
      if (!worker.currentJob) {
        console.error('Invalid state transition.');
        return Status.Idle;
      }
      worker.currentJob.reject(data.error);
      worker.currentJob = null;
      return this.scheduleWorker(worker);
    }
    else if (data.event === 'progressUpdate') {
      if (worker.currentJob && worker.currentJob.progressCallback) {
        worker.currentJob.progressCallback(data.progress);
      }
      return Status.Simulating;
    }
    else if (data.event === 'print') {
      if (worker.currentJob?.onPrint)
        worker.currentJob.onPrint(data.str);
      return Status.Simulating;
    }
    else if (data.event === 'printErr') {
      if (worker.currentJob?.onPrintErr)
        worker.currentJob.onPrintErr(data.str);
      return Status.Simulating;
    }

    console.error('Invalid message from sim_worker.');
    return Status.Unloaded;
  }

  fillWorkerPool = (max: number | null) => {
    let limit = navigator.hardwareConcurrency || 4;
    // supplied max can override hw concurrency value
    if (max != null && max > 0) {
      limit = max;
    }
    const missing = Math.max(0, limit - this.workers.length);

    for (let i = 0; i < missing; i += 1) {
      const worker = {
        worker: new Worker(new URL('sim_worker.ts', import.meta.url), { type: 'module' }),
        status: Status.Loading,
        progressCallback: null,
        currentJob: null,
      };
      worker.worker.onmessage = (e: MessageEvent) => {
        worker.status = this.onWorkerMessage(e.data, worker);
      };
      this.workers.push(worker);
    }
  }

  scheduleWorker = (worker: SimWorker): Status => {
    const job = this.pendingJobs.shift();

    if (job) {
      this.sendJobToWorker(worker, job);
      return Status.Simulating;
    }
    return Status.Idle;
  }

  scheduleJob = (): void => {
    const freeWorker = this.workers.filter(w => w.status === Status.Idle)[0];
    if (!freeWorker) {
      return;
    }

    const job = this.pendingJobs.shift();
    if (!job) {
      return;
    }

    this.sendJobToWorker(freeWorker, job);
  };

  sendJobToWorker = (worker: SimWorker, job: SimJob): void => {
    worker.currentJob = job;
    worker.worker.postMessage(job.profile);
  };

  addJob = (profile: string, progressCallback: ProgressFn | null, onPrint: PrintFn | null, onPrintErr: PrintFn | null): Promise<SimOutputData> => {
    const promise = new Promise<SimOutputData>((resolve, reject) => {
      this.pendingJobs.push({
        profile,
        progressCallback,
        onPrint,
        onPrintErr,
        resolve,
        reject,
      });
    });

    this.scheduleJob();
    return promise;
  }
}
