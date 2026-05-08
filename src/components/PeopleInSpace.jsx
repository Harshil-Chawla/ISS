import React from 'react';
import { UserRoundCheck } from 'lucide-react';

export default function PeopleInSpace({ people }) {
  return (
    <section className="panel people-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Crew manifest</p>
          <h2>People in Space</h2>
        </div>
        <div className="count-badge">{people.number}</div>
      </div>
      <div className="crew-list">
        {people.people.map((person) => (
          <div className="crew-row" key={`${person.name}-${person.craft}`}>
            <UserRoundCheck size={18} />
            <div>
              <strong>{person.name}</strong>
              <span>{person.craft}</span>
            </div>
          </div>
        ))}
        {!people.people.length && <p className="muted">Crew data is not available yet.</p>}
      </div>
    </section>
  );
}
