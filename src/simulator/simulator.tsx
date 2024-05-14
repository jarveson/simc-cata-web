import React, { useState } from 'react';
import Simcraft from './simcraft';
import type { SimProgress } from './simcraft';
import { SimOutputData } from './sim_worker';
import ProfileInput from './profileinput';
import { SimStatus } from './simstatus';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ObjectInspector } from 'react-inspector';
import { Alert, Box, Tab } from '@mui/material';
import MonoTextView from './monotextview';

type Props = {
  simc: Simcraft,
};

type State = {
  profile: string,
  result: SimOutputData | undefined,
  progress: SimProgress | undefined,
  status: SimStatus,
};

export default function Simulator(props: Props) {
  const maxThreads = Math.min(navigator.hardwareConcurrency, 16);

  const [profile, setProfile] = useState('');
  const [result, setResult] = useState(undefined as SimOutputData | undefined);
  const [progress, setProgress] = useState(undefined as SimProgress | undefined);
  const [status, setStatus] = useState(SimStatus.Loading);
  const [print, setPrint] = useState('');
  const [printErr, setPrintErr] = useState('');
  const [threadCount, setThreadCount] = useState(maxThreads);

  const [tabValue, setTabValue] = useState('1');
  const [tab2Value, setTab2Value] = useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };
  const handleTab2Change = (event: React.SyntheticEvent, newValue: string) => {
    setTab2Value(newValue);
  };

  if (!props.simc.loaded)
    props.simc.onLoad = () => { setStatus(SimStatus.Idle) };

  const profileHandler = (profile: string) => {
    if (status !== SimStatus.Idle)
      return;
    setProfile(profile);
  }

  const buttonHandler = () => {
    if (status !== SimStatus.Idle)
      return;

    const { simc } = props;
    const newProfile =`\n### Default Options ###\niterations=5000\ntarget_error=0.05\nmax_time=240\nthreads=${threadCount}\njson=/output.json,full_states=1,pretty_print=1\n ### End ### \n${profile}`;
    let promise = simc.addJob(newProfile, (progress) => {
      setProgress(progress);
    },
      (print) => {
        setPrint((p) => p += print);
      },
      (printErr) => {
        setPrintErr((p) => p += printErr);
      },
    );

    promise.then((result) => {
      setStatus(SimStatus.Idle);
      setResult(result);
      setTabValue('2');
    }, (err) => {
      setStatus(SimStatus.Idle);
      console.warn(err);
    });
    setStatus(SimStatus.Simulating);
    setResult(undefined);
    setProgress(undefined);
    setPrint('');
    setPrintErr('');
  }

  const haveResults = result && status == SimStatus.Idle;
  const haveError = printErr != '';
  return (
    <Box sx={{ height: '100vh', width: '100%', typography: 'body1' }}>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange} aria-label="Results View">
            <Tab label="Run" value="1" />
            <Tab label="Html" value="2" disabled={!haveResults} />
            <Tab label="Json" value="3" disabled={!haveResults} />
            <Tab label="Raw" value="4" disabled={!haveResults} />
          </TabList>
        </Box>
        <TabPanel value="1" className='overflow-auto h-[95%]'>
          {haveError && <Alert variant="outlined" severity="error">Error! Check Log</Alert>}
          <TabContext value={tab2Value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTab2Change} aria-label="Results View">
                <Tab label="Profile" value="1" />
                <Tab label="Error Log" value="2" />
                <Tab label="Debug Log" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1" className='overflow-auto'>
              <ProfileInput
                threadCount={threadCount}
                onThreadChange={(t) => setThreadCount(t)}
                onChange={profileHandler}
                profile={profile}
                simStatus={status}
                runSim={buttonHandler}
                progress={progress}
                maxThreads={maxThreads}
              />
            </TabPanel>
            <TabPanel value="2" className='overflow-auto'>
              <MonoTextView value={printErr} placeholder='Error log output here' />
            </TabPanel>
            <TabPanel value="3" className='overflow-auto'>
              <MonoTextView value={print} placeholder='Debug log output here'/>
            </TabPanel>
          </TabContext>
        </TabPanel>
        <TabPanel value="2" className='overflow-auto h-[95%]'>
          <iframe
            className='h-[95%] w-full fixed border-none top-12 inset-x-0 bottom-0'
            sandbox='allow-scripts'
            srcDoc={result?.html}
          />
        </TabPanel>
        <TabPanel value="3" className='overflow-auto h-[95%]'>
          <ObjectInspector name="Simulation" theme="chromeDark" data={result?.json} expandPaths={['$', '$.sim', '$.sim.statistics']} />
        </TabPanel>
        <TabPanel value="4" className='overflow-auto h-[95%]'>
          <MonoTextView value={result?.raw} placeholder='Raw log output here'/>
        </TabPanel>
      </TabContext>
    </Box>
  );
}
