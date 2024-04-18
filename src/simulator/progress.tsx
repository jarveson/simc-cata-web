import React from "react";
import { SimProgress } from "./simcraft";
import { LinearProgress, Paper, Typography } from "@mui/material";

export type PProps = {
  progress: SimProgress
}

export default function SimProgressBar(props: PProps) {
  let value = 0;
  let phaseText = props.progress.phaseName || 'Generating';

  if (props.progress.subphaseName) {
    phaseText += ` - ${props.progress.subphaseName} `;
  }
  phaseText += ` (${props.progress.phase}/${props.progress.totalPhases}): `;

  if (props.progress.iteration) {
    value = (props.progress.iteration * 100) / props.progress.totalIterations;
  }

  return (
    <div className='items-center flex mb-5'>
      <div className={'flex justify-center shrink-0 grow'}>
        <Paper className={'w-f p-4'}>
          <Typography variant="h5" gutterBottom>
            Progress
          </Typography>
          <LinearProgress variant="determinate" value={value} />
          <Typography variant="body1">
            {`${phaseText}${props.progress.iteration}/${props.progress.totalIterations}`}
          </Typography>
        </Paper>
      </div>
    </div>
  );
}
