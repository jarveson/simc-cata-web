import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';
import { SimStatus } from './simstatus';

import { profile85Preraid, profilestr, profile11comparison } from './testprofile';
import { profileScaleStats } from './testprofile';
import { SimProgress } from './simcraft';
import SimProgressBar from './progress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, InputLabel, Link, Menu, MenuItem, Select, SelectChangeEvent } from '@mui/material';

export type PIProps = {
  profile: string
  onChange: (prof: string) => void;
  simStatus: SimStatus;
  runSim: () => void;
  progress: SimProgress | undefined
  threadCount: number;
  onThreadChange: (t: number) => void;
  maxThreads: number;
}

export default function ProfileInput(props : PIProps) {
  const buttonText = (): string => {
    switch (props.simStatus) {
      case SimStatus.Loading:
        return 'Loading...'
      case SimStatus.Idle:
        return 'Start Simulation';
      case SimStatus.Simulating:
        return 'Simulating...';
      default:
        return 'UNHANDLED';
    }
  }

  const buttonEnabled = () => {
    return props.simStatus == SimStatus.Idle;
  }

  const textChangeHandler = (e: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    props.onChange(e.currentTarget.value);
  }

  const monofont = { fontSize: '0.75rem', lineHeight: '1rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace' };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const profilesOpen = Boolean(anchorEl);
  const handleProfilesClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfilesClose = () => {
    setAnchorEl(null);
  };
  const handleThreadsChange = (event: SelectChangeEvent) => {
    props.onThreadChange(Number(event.target.value));
  }

  const threadItems = Array.from({length: props.maxThreads}, (_, i) => i + 1)

  return (
    <Grid container spacing={2}>
      <Grid item xs={7}>
        <Paper className='flex'>
          <TextField
            className={'w-full'}
            InputProps={{ sx: monofont }}
            rows="40"
            autoComplete='false'
            autoCorrect='false'
            spellCheck='false'
            autoCapitalize='false'
            multiline
            placeholder="Paste profile here!"
            onChange={(e) => { textChangeHandler(e) }}
            value={props.profile}
          />
        </Paper>
      </Grid>
      <Grid item xs={5}>
        <Paper className='p-2 border' elevation={3}>
          <div className='flex flex-col'>
            <div className='m-3'>
              <Button
                aria-controls={profilesOpen ? 'test-profiles-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={profilesOpen ? 'true' : undefined}
                color="secondary"
                variant="outlined"
                disableElevation
                disabled={!buttonEnabled()}
                onClick={handleProfilesClick}
                endIcon={<KeyboardArrowDownIcon />}
              >
                Test Profiles
              </Button>
              <Menu
                 elevation={0}
                 MenuListProps={{
                  'aria-labelledby': 'demo-customized-button',
                }}
                anchorEl={anchorEl}
                open={profilesOpen}
                onClose={handleProfilesClose}
                >
                  <MenuItem onClick={() => {props.onChange(profilestr); handleProfilesClose()}} disableRipple>
                    Feral 80 Test Quick
                  </MenuItem>
                  <MenuItem onClick={() => {props.onChange(profileScaleStats); handleProfilesClose()}} disableRipple>
                    Feral 80 Scale Weights (Long)
                  </MenuItem>
                  <MenuItem onClick={() => {props.onChange(profile85Preraid); handleProfilesClose()}} disableRipple>
                    Feral 85 preraid
                  </MenuItem>
                  <MenuItem onClick={() => {props.onChange(profile11comparison); handleProfilesClose()}} disableRipple>
                    feral t11 comparison
                  </MenuItem>

              </Menu>
            </div>
            <div className='flex flex-row'>
              <div className='shrink-0 m-3'>
                <Button color="primary" variant="contained" onClick={() => { props.runSim() }} disabled={!buttonEnabled()}>
                  {buttonText()}
                </Button>
              </div>
              <div className='m-3 min-w-20'>
                <FormControl fullWidth>
                  <InputLabel id="threads-select-label">Threads</InputLabel>
                  <Select
                    className='h-9'
                    labelId="threads-select-label"
                    id="threads-select"
                    value={String(props.threadCount)}
                    label="Threads"
                    onChange={handleThreadsChange}
                  >
                    {
                      threadItems.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)
                    }
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
        </Paper>
        <Paper className='p-3 border mt-5' elevation={3}>
          {'Cata-Beta Simc addon '}
          <Link href="./Simulationcraft-beta-440.zip" underline="always">
            found here
          </Link>
          <br/>
          {'use /simc ingame for profile'}
        </Paper>
        <SimProgressBar progress={props.progress} simStatus={props.simStatus}/>
      </Grid>
    </Grid>
  );
}
