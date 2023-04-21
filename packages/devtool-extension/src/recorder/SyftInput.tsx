import React from 'react';

export default function SyftInput({ onAdd }: { onAdd: () => void }) {
  return (
    <>
      <div className="ActionList" data-testid="syft-input">
        Syft Input Bar.
      </div>
    </>
  );
}
