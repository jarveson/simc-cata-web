import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import React from 'react';
import { SimStatus } from './simstatus';

import { profilestr } from './testprofile';

export type PIProps = {
   profile: string
   onChange: (prof : string) => void;
   simStatus: SimStatus;
   runSim: () => void;
}

export default function ProfileInput(props) {
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

    return (      
      <Grid container spacing={16}>
        <Grid item xs={12}>
            <Paper className='flex'>
            <TextField
                className={'w-3/4'}
                InputProps={{sx: {fontSize: '0.75rem', lineHeight: '1rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'} }}
                rows="20"
                autoComplete='false'
                autoCorrect='false'
                spellCheck='false'
                autoCapitalize='false'
                multiline
                placeholder="Paste profile here!"
                onChange={(e)=>{textChangeHandler(e)}}
                value={props.profile}
            />
            <div className='flex flex-col'>
                <div className='shrink-0 m-3'>
                <Button color="secondary" variant="contained" onClick={() => {props.onChange(profilestr)}} disabled={!buttonEnabled()}>
                    80 feral test Profile
                </Button>
                </div>
                <div className='shrink-0 m-3'>
                <Button color="primary" variant="contained" onClick={() => {props.runSim()}} disabled={!buttonEnabled()}>
                    {buttonText()}
                </Button>
                </div>
            </div>
            </Paper>
        </Grid>
        </Grid>
    );
}