import React, { useState } from 'react';
import Simcraft from './simcraft';
import type { SimProgress } from './simcraft';
import { SimOutputData } from './sim_worker';
import ProfileInput from './profileinput';
import { SimStatus } from './simstatus';
import SimProgressBar from './progress';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ObjectInspector } from 'react-inspector';
import { Alert, Box, Paper, Tab, TextField } from '@mui/material';
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
  const [profile, setProfile] = useState('');
  const [result, setResult] = useState(undefined as SimOutputData | undefined);
  const [progress, setProgress] = useState(undefined as SimProgress | undefined);
  const [status, setStatus] = useState(SimStatus.Loading);
  const [print, setPrint] = useState('');
  const [printErr, setPrintErr] = useState('');

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
    let promise = simc.addJob(profile, (progress) => {
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
  const haveError = !result && status == SimStatus.Idle && printErr != '';
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
          {progress && status == SimStatus.Simulating && <SimProgressBar progress={progress} />}
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
                onChange={profileHandler}
                profile={profile}
                simStatus={status}
                runSim={buttonHandler}
              />
            </TabPanel>
            <TabPanel value="2" className='overflow-auto'>
              <MonoTextView value={printErr} />
            </TabPanel>
            <TabPanel value="3" className='overflow-auto'>
              <MonoTextView value={print} />
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
          <MonoTextView value={result?.raw} />
        </TabPanel>
      </TabContext>
    </Box>
  );
}