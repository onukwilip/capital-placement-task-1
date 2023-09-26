import React, { useState } from "react";
import css from "../styles/Breadcrumbs.module.scss";

const Breadcrumbs = () => {
  const [activeBreadCrumb, setActiveBreadCrumb] = useState<
    "Program details" | "Application form" | "Workflow" | "Preview"
  >("Application form");
  return (
    <div className={css.breadcrumbs}>
      {["Program details", "Application form", "Workflow", "Preview"].map(
        (name, i) => (
          <div
            className={`${css.breadcrumb} ${
              activeBreadCrumb === name ? css.active : null
            }`}
            key={i}
            onClick={() => setActiveBreadCrumb(name as any)}
          >
            {name}
          </div>
        )
      )}
    </div>
  );
};

export default Breadcrumbs;
