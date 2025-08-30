import "./Main.css";
import { useNavigate } from 'react-router-dom';
import logo from '/logo.png';

const hrColors = [
  '#FF4747', '#FF6347', '#FF7F50', '#FF9147', '#FFAA47', // reds/oranges
  '#FFC147', '#FFD347', '#FFE847', '#FFF147', '#FFFB47', // yellows
  '#D4FF47', '#AAFF47', '#80FF47', '#47FF47', '#47FF80', // greens
  '#47FFAA', '#47FFD3', '#47FFEB', '#47F0FF', '#47D4FF', // turquoise/light blue
  '#47AAFF', '#4780FF', '#4747FF', '#6347FF', '#7F47FF', // blues/purples
  '#9147FF', '#AA47FF', '#C147FF', '#D347FF', '#E847FF', // magentas
  '#FF47EB', '#FF47D3', '#FF47AA', '#FF4780', '#FF4747', // pinks/reds
  '#FF6E6E', '#FF8C6E', '#FFA86E', '#FFC56E', '#FFE16E', // soft reds/oranges
  '#D4FF6E', '#AAFF6E', '#6EFF8C', '#6EFFC5', '#6EE1FF'  // soft greens/blues
];


function Main() {
  const navigate = useNavigate();
  return (
    <>
    <header className="app-header">
      <img src={logo} className="logo" alt="DotDrop Logo" />
    </header>
    <main className="app-main">
      <section className="section-rules">
        <h2>Rules:</h2>
        <ul>
          <li>Defend Your Territory</li>
          <p>
            Once you place pixels, protect them! Team up with others to hold
            your ground against rival groups.
          </p>

          <li>Attack with Strategy</li>
          <p>
            Every pixel has power — don’t waste it. Plan your moves, coordinate
            with allies, and strike where it matters most.
          </p>

          <li>Honor the Battlefield</li>
          <p>
            Battles are fierce, but respect your opponents. No offensive or
            hateful drawings — keep the war fun, fair and creative.
          </p>
        </ul>

        <div className="pixel-hr">
          {hrColors.map((color, idx) => (
            <div
              key={idx}
              className="pixel"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <h4>Remember, have fun and be creative!</h4>
      </section>
      <div className="main-pixel-buttons">
        <button className="pixel-button" onClick={() => navigate('/canvas')}>Start</button>
        <button className="pixel-button" onClick={() => window.open("https://buymeacoffee.com/fabioguerreiro", "_blank")}>☕ Buy me a coffee</button>
      </div>
    </main>
    </>
  );
}

export default Main;
