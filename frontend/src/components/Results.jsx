import { ICONS, colorFor, pretty } from "./Icons.jsx";

export default function Results({ status, result, error }) {
  const top = status === "done" && result ? result.predicted_class : null;
  const TopIcon = top ? ICONS[top.toLowerCase()] : null;

  return (
    <div className="readout" aria-live="polite">
      <p className="ro-label">Prediction</p>

      {status === "idle" && (
        <p className="ro-idle">Waiting for a photo. Add one, press <strong>Predict</strong>, and the three scores appear here.</p>
      )}

      {status === "loading" && (
        <p className="ro-idle">Scanning the image... if the server was asleep, the first scan can take up to a minute.</p>
      )}

      {status === "error" && <div className="error" role="alert">{error}</div>}

      {top && (
        <h2 className="ro-name" style={{ color: colorFor(top) }}>
          {TopIcon && <TopIcon width={44} height={44} />}
          {pretty(top)}
        </h2>
      )}

      <ul className="lanes">
        {(result?.probabilities ?? [{ label: "Cat", probability: 0 }, { label: "bird", probability: 0 }, { label: "dog", probability: 0 }])
          .slice()
          .sort((a, b) => (result ? b.probability - a.probability : 0))
          .map((p) => {
            const Icon = ICONS[p.label.toLowerCase()];
            const active = result && p.label === top;
            return (
              <li key={p.label} className={`lane ${active ? "active" : ""}`}>
                <span className="lane-icon" style={{ color: colorFor(p.label) }}>{Icon && <Icon />}</span>
                <div className="lane-body">
                  <div className="lane-head">
                    <span>{pretty(p.label)}</span>
                    <span className="lane-val">{result ? `${p.probability.toFixed(2)}%` : "--"}</span>
                  </div>
                  <div
                    className="track"
                    role="progressbar"
                    aria-label={`${pretty(p.label)} confidence`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={result ? p.probability : 0}
                  >
                    <div className="fill" style={{ width: `${result ? Math.max(p.probability, 0.5) : 0}%`, background: colorFor(p.label) }} />
                  </div>
                </div>
              </li>
            );
          })}
      </ul>

      {top && (
        <p className="ro-note">
          The three scores add up to 100%. The model only knows cats, dogs and birds, so any other subject is still forced into one of them.
        </p>
      )}
    </div>
  );
}
