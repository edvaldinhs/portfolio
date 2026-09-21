export default function YddeWall({ src = 'ydde.mp4' }: { src?: string }) {
  if (src.endsWith('.webp')) {
    return <img className="ydde-wall-video" src={`/videos/${src}`} alt="" aria-hidden="true" />
  }
  return (
    <video
      className="ydde-wall-video"
      src={`/videos/${src}`}
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
    />
  )
}