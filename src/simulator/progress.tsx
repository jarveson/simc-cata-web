import React from "react";
import { SimProgress } from "./simcraft";
import { LinearProgress, Paper, Typography } from "@mui/material";
import { SimStatus } from "./simstatus";

export type PProps = {
  progress: SimProgress | undefined
  simStatus: SimStatus
}

export default function SimProgressBar(props: PProps) {

  const getBarVal = () => {
    let value = 0;
    if (props.progress?.iteration && props.simStatus != SimStatus.Idle ) {
      value = (props.progress.iteration * 100) / props.progress.totalIterations;
    }
    return value;
  }

  const getPhaseText = () => {
    if (!props.progress || props.simStatus == SimStatus.Idle ) {
      return '';
    }
    let phaseText = props.progress.phaseName || 'Generating';

    if (props.progress.subphaseName) {
      phaseText += ` - ${props.progress.subphaseName} `;
    }
    phaseText += ` (${props.progress.phase}/${props.progress.totalPhases}): `;
    return `${phaseText}${props.progress.iteration}/${props.progress.totalIterations}`;
  }

  return (
    <div className='items-center flex mb-5 mt-5'>
      <div className={'flex justify-center shrink-0 grow'}>
        <Paper className={'w-full p-4 border'} elevation={3}>
          <Typography variant="h5" gutterBottom>
            { props.simStatus == SimStatus.Idle ? 'Idle' : 'Progress'}
          </Typography>
          <LinearProgress variant="determinate" value={getBarVal()} />
          <Typography variant="body1">
            {getPhaseText()}
          </Typography>
        </Paper>
      </div>
    </div>
  );
}
