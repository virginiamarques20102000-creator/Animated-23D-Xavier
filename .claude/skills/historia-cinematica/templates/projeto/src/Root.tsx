import {Composition} from 'remotion';
import {Video} from './Video';
import {Sea} from './sea/Sea';
import {Pedro} from './pedro/Pedro';
export const Root = () => (
  <>
    <Composition id="Brasil" component={Video} durationInFrames={1470} fps={30} width={1080} height={1920} />
    <Composition id="Caravelas" component={Sea} durationInFrames={900} fps={30} width={1080} height={1920} />
    <Composition id="DomPedro" component={Pedro} durationInFrames={450} fps={30} width={1080} height={1920} />
  </>
);
