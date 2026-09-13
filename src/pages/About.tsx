import HeaderBar from '../components/HeaderBar'

export default function About() {
  return (
    <div className="container">
      <HeaderBar />
      <main style={{ minHeight: '100vh' }}>
        <div className="content" style={{ margin: '0 auto', marginTop: '8rem', maxWidth: '48rem' }}>
          <h5>ABOUT ME</h5>
          <h1>
            HELLO, I'M
            <br />
            EDVALDO
          </h1>
          <p className="description">
            I'm a Computer Science student who views coding as both a playground and a toolset. I enjoy building
            projects with complex structures to push my limits, but I'm equally at home developing web and Android
            apps. Every project is a chance to learn something new and build something useful or fun.
          </p>
          <p className="description">
            I love to build creative and fun projects just to mess around with different Technologies and learn them
            while I improve as a developer.
          </p>
        </div>
      </main>
    </div>
  )
}