import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { SimOutputData } from './sim_worker';
import { ObjectInspector } from 'react-inspector';
import { TextField } from '@mui/material';

type RVProps = {
    results: SimOutputData
}

export default function ResultsView(props: RVProps) {
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="Results View">
            <Tab label="Html" value="1" />
            <Tab label="Json" value="2" />
            <Tab label="Raw" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
            <iframe className='w-full h-full' style={{height:'200vh'}} sandbox='allow-scripts' srcDoc={props.results.html}/>
        </TabPanel>
        <TabPanel value="2">
            <ObjectInspector name="Simulation" theme="chromeDark" data={props.results.json} expandPaths={['$', '$.sim', '$.sim.statistics']} />
        </TabPanel>
        <TabPanel value="3">
            <TextField
              InputProps={{sx: {fontSize: '0.75rem', lineHeight: '1rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'} }}
              className={'w-full'}
              minRows="30"
              autoComplete='false'
              autoCorrect='false'
              spellCheck='false'
              autoCapitalize='false'
              multiline
              placeholder="Raw results here"
              value={props.results.raw}
            />
        </TabPanel>
      </TabContext>
    </Box>
  );
}