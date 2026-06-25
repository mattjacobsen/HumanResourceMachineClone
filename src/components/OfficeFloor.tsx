import type { Value } from '../engine/types';

interface OfficeFloorProps {
  inbox: Value[];
  outbox: Value[];
  floor: (Value | undefined)[];
  hand: Value | undefined;
  caption: string;
}

export function OfficeFloor({ inbox, outbox, floor, hand, caption }: OfficeFloorProps) {
  return (
    <div className="office-floor">
      <div className="office-floor__tray office-floor__tray--inbox">
        <div className="office-floor__tray-label">Inbox</div>
        <div className="office-floor__tray-items">
          {inbox.map((value, i) => (
            <span key={i} className="office-floor__chip">
              {value}
            </span>
          ))}
        </div>
      </div>

      <div className="office-floor__worker-area">
        <div className="office-floor__floor-tiles">
          {floor.map((value, tile) => (
            <div key={tile} className="office-floor__floor-tile">
              <span className="office-floor__floor-tile-index">{tile}</span>
              {value !== undefined && <span className="office-floor__chip">{value}</span>}
            </div>
          ))}
        </div>
        <div className="office-floor__worker">
          <span className="office-floor__worker-face" role="img" aria-label="worker">
            🙂
          </span>
          <div className="office-floor__hand">
            {hand !== undefined ? (
              <span className="office-floor__chip office-floor__chip--hand">{hand}</span>
            ) : (
              <span className="office-floor__hand-empty">empty</span>
            )}
          </div>
        </div>
        <p className="office-floor__caption">{caption}</p>
      </div>

      <div className="office-floor__tray office-floor__tray--outbox">
        <div className="office-floor__tray-label">Outbox</div>
        <div className="office-floor__tray-items">
          {outbox.map((value, i) => (
            <span key={i} className="office-floor__chip">
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
