import { Paper, TextField } from "@mui/material";
import React from "react";

export type MTVProps = {
  value: string | undefined
}

export default function MonoTextView(props: MTVProps) {
  const monofont = { fontSize: '0.75rem', lineHeight: '1rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace' };

  return (
    <Paper className='flex'>
      <TextField
        InputProps={{ sx: monofont }}
        className={'w-full'}
        minRows="30"
        autoComplete='false'
        autoCorrect='false'
        spellCheck='false'
        autoCapitalize='false'
        multiline
        placeholder="Raw results here"
        value={props.value}
      />
    </Paper>
  )
}
