import {Composition} from 'remotion';
import {Video} from './Video';
export const Root = () => (
  <Composition id="Brasil" component={Video} durationInFrames={1200} fps={30} width={1080} height={1920} />
);
