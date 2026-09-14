import React, { useCallback, useState } from "react";
import { Icons } from "./icons";
import { useEscape } from "./useEscape";

function OverflowMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEscape(open, close);

  return (
    <div className="ui-overflow">
      <button
        type="button"
        className="ui-icon-btn"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {Icons.More()}
      </button>
      {open && (
        <div className="ui-overflow-menu" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={item.tone === "danger" ? "is-danger" : ""}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OverflowMenu;
