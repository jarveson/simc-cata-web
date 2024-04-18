import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';
import { SimStatus } from './simstatus';

import { profilestr } from './testprofile';
import { profileScaleStats } from './testprofile';
import { SimProgress } from './simcraft';
import SimProgressBar from './progress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, Menu, MenuItem } from '@mui/material';

export type PIProps = {
  profile: string
  onChange: (prof: string) => void;
  simStatus: SimStatus;
  runSim: () => void;
  progress: SimProgress | undefined
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

  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
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
      <Grid item xs={4}>
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
              </Menu>
            </div>
            <div className='shrink-0 m-3'>
              <Button color="primary" variant="contained" onClick={() => { props.runSim() }} disabled={!buttonEnabled()}>
                {buttonText()}
              </Button>
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
