const FACTS = [
  ["102 / 29 / 16", "training / validation / test images"],
  ["2.26 M", "parameters in the network"],
  ["28 of 29", "validation images correct (96.55%)"],
  ["16 of 16", "test images correct"],
];

const PIPELINE = [
  ["Photo in", "Your image is sent to the FastAPI server and is only held in memory, never saved."],
  ["Resize", "It is converted to RGB and resized to 224 × 224 × 3, the size the network was trained on."],
  ["Network", "MobileNetV2 (its own preprocessing is built into the saved model) returns three probabilities."],
  ["Answer", "The highest score is the predicted animal. All three are shown as bars."],
];

const TRAINING = [
  ["Dataset", "Roboflow “Cats, dogs and birds” (version 3), folders for train, valid and test."],
  ["Base network", "MobileNetV2 with ImageNet weights, frozen at first (3,843 trainable parameters)."],
  ["Augmentation", "Random horizontal flip, rotation (0.1) and zoom (0.1) during training."],
  ["Head", "Global average pooling, dropout 0.3, then a 3-way softmax layer."],
  ["Stage 1", "20 epochs, Adam at 0.001, early stopping on validation loss."],
  ["Stage 2", "Fine-tuned the last 30 base layers (batch-norm frozen) for 5 epochs at 0.00001."],
];

const STACK = [
  ["Model", "MobileNetV2, transfer learning"],
  ["Training", "TensorFlow 2.21 / Keras, Google Colab"],
  ["API", "Python, FastAPI"],
  ["Website", "React, Vite"],
  ["Hosting", "Render (API), Vercel (website)"],
];

export default function Info({ project }) {
  return (
    <>
      <section id="report" className="block">
        <h2 className="block-title">Model report</h2>
        <p className="block-lead">
          Numbers taken directly from the training notebook. The test set is very small (16 photos), so treat 100% as
          a sign the model works on this dataset, not as a guarantee on every photo.
        </p>
        <dl className="facts">
          {FACTS.map(([big, small]) => (
            <div key={small}><dt>{big}</dt><dd>{small}</dd></div>
          ))}
        </dl>
        <div className="table-wrap">
          <table>
            <caption className="sr">Per-class results on the 16-image test set</caption>
            <thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Test images</th></tr></thead>
            <tbody>
              <tr><td>Cat</td><td>1.00</td><td>1.00</td><td>1.00</td><td>5</td></tr>
              <tr><td>Bird</td><td>1.00</td><td>1.00</td><td>1.00</td><td>6</td></tr>
              <tr><td>Dog</td><td>1.00</td><td>1.00</td><td>1.00</td><td>5</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="how" className="block">
        <h2 className="block-title">What happens to your photo</h2>
        <ol className="pipeline">
          {PIPELINE.map(([t, d]) => (
            <li key={t}><h3>{t}</h3><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section id="about" className="block split">
        <div>
          <h2 className="block-title">How the model was built</h2>
          <p className="block-lead">{project.fullTitle}. A {project.badge.toLowerCase()}.</p>
          <dl className="rows">
            {TRAINING.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="block-title">Tech stack</h2>
          <dl className="rows">
            {STACK.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
