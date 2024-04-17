import React from 'react';
import Simcraft from './simcraft';
import type { SimProgress } from './simcraft';
import { SimOutputData } from './sim_worker';
import ResultsView from './resultview';
import ProfileInput from './profileinput';
import { SimStatus } from './simstatus';
import SimProgressBar from './progress';

type Props = {
  simc: Simcraft,
};

type State = {
  profile: string,
  result: SimOutputData | undefined,
  progress: SimProgress | undefined,
  status: SimStatus,
};

class Simulator extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      profile: '',
      result: undefined,
      progress: undefined,
      status: SimStatus.Loading,
    };

    if (!props.simc.loaded)
      props.simc.onLoad = () => { this.setState({status: SimStatus.Idle })};
  }

  profileHandler = (profile: string) => {
    if (this.state.status !== SimStatus.Idle)
      return;
    this.setState({ profile: profile });
  }

  buttonHandler = () => {
    if (this.state.status !== SimStatus.Idle)
      return;
    const { simc } = this.props;
    simc.addJob(this.state.profile, (progress) => {
        this.setState({ progress: progress });
      }).then((result) => {
        this.setState({ status: SimStatus.Idle, result: result });
      }, (err) => {
        this.setState({ status: SimStatus.Idle });
        console.warn(err);
    });
    this.setState({ status: SimStatus.Simulating, result: undefined, progress: undefined });
  }

  render = () => {
    const {
      profile,
      result,
      status,
      progress,
    } = this.state;
    let output;

    if (result && status === SimStatus.Idle && 'sim' in result?.json) {
      output = <ResultsView results={result}/>
    } else if (progress && status === SimStatus.Simulating && 'iteration' in progress) {
      output = <SimProgressBar progress={progress}/>
    }

    return (
      <>
      <ProfileInput 
        onChange={this.profileHandler} 
        profile={profile} 
        simStatus={status}
        runSim={this.buttonHandler}
      />
      {output}
      </>
    );
  }
}

export default Simulator;
