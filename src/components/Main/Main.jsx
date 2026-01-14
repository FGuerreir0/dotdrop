import "./Main.css";
import { useNavigate } from 'react-router-dom';

const hrColors = [
  '#000000', '#0a0a0a', '#141414', '#1e1e1e', '#282828', // deep blacks
  '#323232', '#3c3c3c', '#464646', '#505050', '#5a5a5a', // dark grays
  '#646464', '#6e6e6e', '#787878', '#828282', '#8c8c8c', // mid grays
  '#969696', '#a0a0a0', '#aaaaaa', '#b4b4b4', '#bebebe', // light grays
  '#c8c8c8', '#d2d2d2', '#dcdcdc', '#e6e6e6', '#f0f0f0', // very light grays
  '#fafafa', '#ffffff' // near white to pure white
];

function Main() {
  const navigate = useNavigate();

  return (
    <main className="app-main">
      <div className="hero-box">
        <h1 className="main-title">DotDrop</h1>
        <p className="main-tagline">Collaborative Pixel Art Game</p>
        
        <div className="pixel-divider">
          {hrColors.slice(0, 15).map((color, idx) => (
            <div key={idx} className="pixel-dot" style={{ backgroundColor: color }} />
          ))}
        </div>

        <div className="rules-simple">
          <div className="rule-line">
            <span className="rule-icon">■</span>
            <span>Place pixels • Defend territory • Team up</span>
          </div>
          <div className="rule-line">
            <span className="rule-icon">▪</span>
            <span>1 second cooldown between placements</span>
          </div>
          <div className="rule-line">
            <span className="rule-icon">□</span>
            <span>Keep it creative and respectful</span>
          </div>
        </div>

        <div className="buttons-container">
          <button className="start-button" onClick={() => navigate('/canvas')}>
            START
          </button>

          <button 
            className="support-button" 
            onClick={() => window.open("https://buymeacoffee.com/fabioguerreiro", "_blank")}
          >
            <span>SUPPORT</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default Main;
