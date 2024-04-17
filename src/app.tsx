import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Simulator from './simulator/simulator';
import Simcraft from './simulator/simcraft';

type Props = {
};

class App extends React.Component<Props> {
  simc: Simcraft;

  constructor(props) {
    super(props);

    this.simc = new Simcraft();
  }

  render = () => {

    return (
      <React.Fragment>
        <CssBaseline />
        <div>
          <Simulator simc={this.simc} />
        </div>
      </React.Fragment>
    );
  }
}

export default App;
